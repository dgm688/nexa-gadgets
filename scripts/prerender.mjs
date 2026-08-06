/**
 * Emits a static HTML file per product and category, plus robots.txt and
 * sitemap.xml.
 *
 * Why this exists: the storefront is a client-rendered SPA, and social
 * scrapers — WhatsApp, Facebook, LinkedIn, Slack, iMessage — do not execute
 * JavaScript. Meta tags set at runtime are invisible to them, so a shared
 * product link previews as a bare URL or, at best, the generic site card.
 *
 * Each file emitted here is the same app shell with the <!--seo--> block
 * replaced. Vercel serves the static file for a matching path (it wins over
 * the SPA rewrite), the scraper reads real tags, and the browser boots the
 * same bundle as always — so there is no second rendering path to maintain.
 *
 * Products come from Supabase when credentials are present, so the catalogue
 * is whatever is actually live. A product added through the admin gets its
 * preview on the next deploy.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE_URL = "https://nexagadgets.us";
const OG = `${SITE_URL}/brand/og.jpg`;
const NAME = "Nexa Gadgets";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const usd = (n) => `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Categories are static; read them straight out of the source of truth. */
function readCategories() {
  const src = readFileSync(join(root, "src/lib/catalog.ts"), "utf8");
  const block = src.split("export const CATEGORIES")[1]?.split("];")[0] ?? "";
  return [...block.matchAll(/\{ slug: "([^"]+)", name: "([^"]+)", blurb: "([^"]+)" \}/g)].map(
    ([, slug, name, blurb]) => ({ slug, name, blurb }),
  );
}

async function readProducts() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.log("[prerender] no Supabase credentials — prerendering categories only");
    return [];
  }
  try {
    const res = await fetch(
      `${url}/rest/v1/products?select=slug,name,brand,price,short_description,description,images,in_stock`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // A prerender failure must not fail the deploy — the site still works,
    // it just falls back to the generic share card until the next build.
    console.warn("[prerender] product fetch failed, skipping products:", err.message);
    return [];
  }
}

const seoBlock = ({ title, description, path, image, type = "website", jsonLd }) => {
  const url = `${SITE_URL}${path}`;
  const img = image?.startsWith("http") ? image : `${SITE_URL}${image ?? "/brand/og.jpg"}`;
  return `<title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="${NAME}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(img)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(img)}" />${
      jsonLd
        ? `\n    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`
        : ""
    }`;
};

function emit(shell, path, seo) {
  if (!shell.includes("<!--seo-->")) throw new Error("shell is missing the <!--seo--> marker");
  const html = shell.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, seoBlock(seo));
  const dir = join(dist, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

const shell = readFileSync(join(dist, "index.html"), "utf8");
const categories = readCategories();
const products = await readProducts();
const urls = [{ loc: `${SITE_URL}/`, priority: "1.0" }];

for (const c of categories) {
  emit(shell, `category/${c.slug}`, {
    title: `${c.name} | ${NAME}`,
    description: `${c.blurb}. ${c.name} at ${NAME} — every price 20% below retail, in store in all 50 states with same-day delivery.`,
    path: `/category/${c.slug}`,
  });
  urls.push({ loc: `${SITE_URL}/category/${c.slug}`, priority: "0.8" });
}

for (const p of products) {
  const image = p.images?.[0];
  emit(shell, `product/${p.slug}`, {
    title: `${p.name} | ${NAME}`,
    description: `${p.short_description ?? p.name} ${usd(p.price)} at ${NAME} — in store in all 50 states, or reserve with a 50% deposit.`,
    path: `/product/${p.slug}`,
    image,
    type: "product",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.description || p.short_description || p.name,
      image: (p.images ?? []).map((i) => (i.startsWith("http") ? i : `${SITE_URL}${i}`)),
      brand: { "@type": "Brand", name: p.brand ?? NAME },
      sku: p.slug,
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/product/${p.slug}`,
        priceCurrency: "USD",
        price: p.price,
        availability:
          p.in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      },
    },
  });
  urls.push({ loc: `${SITE_URL}/product/${p.slug}`, priority: "0.7" });
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>
`,
);

// /search is excluded: query pages are thin and endlessly variable, and would
// bury the real category and product pages under near-duplicates.
writeFileSync(
  join(dist, "robots.txt"),
  `User-agent: *
Allow: /
Disallow: /admin
Disallow: /search

Sitemap: ${SITE_URL}/sitemap.xml
`,
);

console.log(
  `[prerender] ${categories.length} categories, ${products.length} products, sitemap with ${urls.length} URLs`,
);
