import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { telHref } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-20 bg-navy-deep text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="inline-block rounded-2xl bg-white p-2">
            <img src="/brand/nexa-logo.png" alt={SITE.name} className="size-10 object-contain" />
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            US-based electronics dealer with physical stores in all 50 states. 20% off storewide,
            same-day delivery, and a 50% deposit option with the balance paid on delivery.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-widest text-white">SHOP</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 7).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="transition hover:text-gold"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-widest text-white">CONTACT</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {SITE.address}
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href={telHref()} className="transition hover:text-gold">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href={`mailto:${SITE.email}`} className="transition hover:text-gold">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-widest text-white">FOLLOW</h3>
          <div className="mt-4 flex gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-white/10">
              <Facebook className="size-4" />
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-white/10">
              <Instagram className="size-4" />
            </span>
          </div>
          <Link to="/admin" className="mt-5 inline-block text-sm transition hover:text-gold">
            Staff login
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 text-xs">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
