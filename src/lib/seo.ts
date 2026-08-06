import { useEffect } from "react";
import { SITE } from "./site";

export const SITE_URL = "https://nexagadgets.us";
export const DEFAULT_OG = `${SITE_URL}/brand/og.jpg`;

export const DEFAULT_DESCRIPTION =
  "US electronics retailer with physical stores in all 50 states. Phones, laptops, TVs and more at 20% below retail, with same-day delivery and a 50% deposit option.";

/** Absolute URL — Open Graph rejects relative paths. */
export const absoluteUrl = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

type Seo = {
  title: string;
  description?: string;
  /** Path only, e.g. "/product/foo". Becomes the canonical and og:url. */
  path: string;
  image?: string;
  type?: "website" | "product";
  /** Serialised and injected as <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown>;
  /** Search and other thin pages should not be indexed. */
  noIndex?: boolean;
};

const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
};

const JSON_LD_ID = "route-jsonld";

/**
 * Applies per-route metadata.
 *
 * This runs in the browser, so it reaches crawlers that execute JavaScript —
 * Google does. Social scrapers (WhatsApp, Facebook, LinkedIn, Slack) do not,
 * which is why the build also emits a static HTML file per product and
 * category with these same tags baked in. This hook keeps the tab title,
 * canonical and structured data correct during client-side navigation; the
 * prerendered files are what a shared link actually previews from.
 */
export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG,
  type = "website",
  jsonLd,
  noIndex,
}: Seo) {
  useEffect(() => {
    const url = absoluteUrl(path);
    const img = absoluteUrl(image);

    document.title = title;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noIndex ? "noindex, follow" : "index, follow",
    );
    setLink("canonical", url);

    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:image"]', "property", "og:image", img);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE.name);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", img);

    document.getElementById(JSON_LD_ID)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = JSON_LD_ID;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, path, image, type, jsonLd, noIndex]);
}
