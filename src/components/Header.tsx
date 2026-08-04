import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShieldCheck } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { telHref, whatsappGeneral } from "@/lib/whatsapp";

export function Header() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q } });
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-navy-deep text-white/90">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="truncate">
            20% off storewide · Stores in all 50 states · Same-day delivery · 50% deposit, balance on
            delivery
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <a href={telHref()} className="hidden hover:text-gold sm:inline">
              {SITE.phone}
            </a>
            <Link to="/admin" className="inline-flex items-center gap-1.5 hover:text-gold">
              <ShieldCheck className="size-3.5" />
              Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-navy text-white">
        <div className="container-page flex items-center gap-4 py-3">
          <Link to="/" className="shrink-0 rounded-2xl bg-white p-2">
            <img src="/brand/nexa-logo.png" alt={SITE.name} className="size-10 object-contain" />
          </Link>

          <form onSubmit={onSearch} className="hidden flex-1 md:flex">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, laptops, TVs..."
              aria-label="Search products"
              className="h-11 w-full rounded-l-2xl bg-white px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Search"
              className="grid h-11 w-14 place-items-center rounded-r-2xl bg-gold text-navy-deep transition hover:brightness-95"
            >
              <Search className="size-4" />
            </button>
          </form>

          <a
            href={whatsappGeneral()}
            target="_blank"
            rel="noreferrer"
            className="ml-auto shrink-0 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
          >
            Chat on WhatsApp
          </a>
        </div>

        <nav className="border-t border-white/10">
          <div className="container-page flex gap-6 overflow-x-auto py-3 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="shrink-0 whitespace-nowrap transition hover:text-gold"
                activeProps={{ className: "text-gold" }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
