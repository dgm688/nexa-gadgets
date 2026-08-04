import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronDown, Menu, Search, ShieldCheck, X } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { telHref, whatsappGeneral } from "@/lib/whatsapp";
import { EASE_OUT, springSoft } from "@/lib/motion";

/**
 * The previous header stacked three full-width bars — announcement, brand +
 * search, then eleven category links — costing ~130px before any content.
 *
 * This collapses to one bar. Four high-intent categories stay inline; the full
 * set moves behind a "Browse" panel, which is more discoverable than a row that
 * overflowed off-screen on every viewport under 1500px.
 */

const PRIMARY = ["mobile-phones", "computers", "tv-audio-systems", "gaming"];

export function Header() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const browseRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  // Route change closes any open surface, so navigation never leaves a panel behind.
  useEffect(() => {
    setBrowseOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Escape and outside-click both dismiss — no dead ends.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBrowseOpen(false);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setBrowseOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q } });
  };

  const primaryCats = CATEGORIES.filter((c) => PRIMARY.includes(c.slug));

  return (
    <>
      <div className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas)]">
        <div className="container-page flex h-9 items-center justify-between text-[12px] text-[var(--color-ink-faint)]">
          <p className="truncate">
            <span className="text-[var(--color-ink-dim)]">20% off storewide</span>
            <span className="mx-2 opacity-40">·</span>
            Stores in all 50 states
            <span className="mx-2 hidden opacity-40 sm:inline">·</span>
            <span className="hidden sm:inline">50% deposit, balance on delivery</span>
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <a href={telHref()} className="tabular hidden hover:text-[var(--color-ink)] sm:inline">
              {SITE.phone}
            </a>
            {/* Hidden on mobile: the 36px utility bar cannot host a 44px target,
                and the footer's "Staff login" covers the same need. */}
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 hover:text-[var(--color-ink)] sm:inline-flex"
            >
              <ShieldCheck className="size-3.5" />
              Admin
            </Link>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled
            ? "border-[var(--color-hairline)] bg-[var(--color-canvas)]/80 backdrop-blur-xl"
            : "border-transparent bg-[var(--color-canvas)]"
        }`}
      >
        <div className="container-page flex h-16 items-center gap-3">
          <Link
            to="/"
            className="flex min-h-[44px] shrink-0 items-center gap-2.5 pr-1"
            aria-label={SITE.name}
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[var(--color-ink)] text-[13px] font-bold text-[#08090a]">
              N
            </span>
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:block">
              Nexa
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" ref={browseRef}>
            <button
              type="button"
              onClick={() => setBrowseOpen((v) => !v)}
              aria-expanded={browseOpen}
              aria-haspopup="true"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] text-[var(--color-ink-dim)] transition-colors hover:bg-white/[0.05] hover:text-[var(--color-ink)]"
            >
              Browse
              <motion.span animate={{ rotate: browseOpen ? 180 : 0 }} transition={springSoft}>
                <ChevronDown className="size-3.5" />
              </motion.span>
            </button>

            {primaryCats.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="rounded-full px-3.5 py-2 text-[14px] text-[var(--color-ink-dim)] transition-colors hover:bg-white/[0.05] hover:text-[var(--color-ink)]"
                activeProps={{ className: "text-[var(--color-ink)] bg-white/[0.06]" }}
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
            <div className="group relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-faint)]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="h-10 w-full rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface)] pl-10 pr-3 text-[14px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]"
              />
            </div>
          </form>

          <a
            href={whatsappGeneral()}
            target="_blank"
            rel="noreferrer"
            className="ml-auto hidden shrink-0 items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-semibold text-[#08090a] transition-colors hover:bg-white md:ml-0 md:inline-flex"
          >
            Chat to buy
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="ml-auto grid size-11 place-items-center rounded-full border border-[var(--color-hairline)] lg:hidden"
          >
            <Menu className="size-4.5" />
          </button>
        </div>

        <AnimatePresence>
          {browseOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="absolute inset-x-0 top-full border-y border-[var(--color-hairline)] bg-[var(--color-canvas)]/95 backdrop-blur-xl"
            >
              <div className="container-page grid gap-1 py-6 md:grid-cols-3">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="group rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.05]"
                  >
                    <p className="text-[14px] font-medium group-hover:text-white">{c.name}</p>
                    <p className="mt-0.5 truncate text-[12px] text-[var(--color-ink-faint)]">
                      {c.blurb}
                    </p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[var(--color-canvas)] lg:hidden"
          >
            <div className="container-page flex h-16 items-center justify-between">
              <span className="text-[15px] font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full border border-[var(--color-hairline)]"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <div className="container-page overflow-y-auto pb-24" style={{ maxHeight: "calc(100dvh - 4rem)" }}>
              <form onSubmit={submitSearch} className="relative mb-6">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-faint)]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                  className="h-12 w-full rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface)] pl-11 pr-4 text-[16px] outline-none focus:border-[var(--color-accent)]"
                />
              </form>

              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.03 } } }}
                className="divide-y divide-[var(--color-hairline)]"
              >
                {CATEGORIES.map((c) => (
                  <motion.li
                    key={c.slug}
                    variants={{
                      hidden: { opacity: 0, x: -8 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="flex min-h-[56px] items-center justify-between py-4 text-[16px]"
                    >
                      {c.name}
                      <ChevronDown className="size-4 -rotate-90 text-[var(--color-ink-faint)]" />
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <a
                href={whatsappGeneral()}
                target="_blank"
                rel="noreferrer"
                className="mt-8 flex min-h-[52px] items-center justify-center rounded-full bg-[var(--color-ink)] text-[15px] font-semibold text-[#08090a]"
              >
                Chat to buy
              </a>
              <a
                href={telHref()}
                className="tabular mt-3 flex min-h-[52px] items-center justify-center rounded-full border border-[var(--color-hairline-strong)] text-[15px]"
              >
                {SITE.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
