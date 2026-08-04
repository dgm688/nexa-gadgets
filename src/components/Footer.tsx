import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { telHref, whatsappGeneral } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-hairline)]">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div className="max-w-sm">
          <img
            src="/brand/nexa-wordmark.png"
            alt={SITE.name}
            width={1395}
            height={383}
            className="h-8 w-auto"
          />
          <p className="mt-5 text-[14px] leading-relaxed text-[var(--color-ink-dim)]">
            US electronics retailer with physical stores in all 50 states. Every price 20% below
            retail, same-day delivery, and a 50% deposit option with the balance paid on delivery.
          </p>
          <a
            href={whatsappGeneral()}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] px-5 py-3 text-[13px] font-medium transition-colors hover:border-[var(--color-whatsapp)] hover:text-[var(--color-whatsapp)]"
          >
            Chat on WhatsApp
          </a>
        </div>

        <nav aria-label="Shop">
          <h3 className="eyebrow">Shop</h3>
          <ul className="mt-3">
            {CATEGORIES.slice(0, 7).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="inline-block py-2 text-[14px] text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-ink)]"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="eyebrow">Contact</h3>
          <ul className="mt-5 space-y-3 text-[14px] text-[var(--color-ink-dim)]">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--color-ink-faint)]" />
              {SITE.address}
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-[var(--color-ink-faint)]" />
              <a href={telHref()} className="tabular transition-colors hover:text-[var(--color-ink)]">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-[var(--color-ink-faint)]" />
              <a
                href={`mailto:${SITE.email}`}
                className="transition-colors hover:text-[var(--color-ink)]"
              >
                {SITE.email}
              </a>
            </li>
          </ul>

          <Link
            to="/admin"
            className="mt-5 inline-block py-2 text-[13px] text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
          >
            Staff login
          </Link>
        </div>
      </div>

      <div className="border-t border-[var(--color-hairline)]">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-6 text-[12px] text-[var(--color-ink-faint)]">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>Prices shown include the 20% storewide discount.</p>
        </div>
      </div>
    </footer>
  );
}
