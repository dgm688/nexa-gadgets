import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { SALE } from "@/lib/site";
import { Countdown } from "./Countdown";

const SLIDES = [
  {
    eyebrow: "TV & HOME CINEMA",
    title: "Cinema-grade 4K, now 20% off",
    body: 'Curved QLED and OLED screens from 43" to 75". See it in store, or have it delivered and set up the same day.',
    cta: "Shop TVs",
    slug: "tv-audio-systems",
  },
  {
    eyebrow: "FLAGSHIP PHONES",
    title: "The latest Galaxy, 20% below retail",
    body: "Unlocked flagships with full manufacturer warranty. Reserve online with a 50% deposit.",
    cta: "Shop phones",
    slug: "mobile-phones",
  },
  {
    eyebrow: "WORK & STUDY",
    title: "Laptops that keep up, for less",
    body: "New and certified pre-owned machines from Apple, HP and Dell — every one tested before it leaves the store.",
    cta: "Shop computers",
    slug: "computers",
  },
] as const;

export function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[i];

  return (
    <section className="relative isolate overflow-hidden bg-navy-deep text-white">
      <img
        src="/brand/hero-tv.jpg"
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/40" />

      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-[11px] font-bold tracking-widest">
            <Clock className="size-3.5" />
            {SALE.label}
          </span>

          <p className="mt-8 text-sm font-bold tracking-widest text-gold">{slide.eyebrow}</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-lg text-white/80">{slide.body}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/category/$slug"
              params={{ slug: slide.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-navy-deep transition hover:bg-white/90"
            >
              {slide.cta}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/search"
              search={{ q: "" }}
              className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold transition hover:bg-white/10"
            >
              Find a product
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-12 gap-y-4 border-t border-white/15 pt-6">
            {[
              ["50 states", "Physical stores"],
              ["Same day", "Delivery windows"],
              ["50% deposit", "Balance on delivery"],
            ].map(([big, small]) => (
              <div key={big}>
                <p className="font-display text-xl font-bold">{big}</p>
                <p className="text-sm text-white/70">{small}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="self-center rounded-3xl border border-white/15 bg-white/10 p-7 backdrop-blur-sm">
          <p className="text-xs font-bold tracking-widest text-gold">FLASH SALE ENDS IN</p>
          <div className="mt-5">
            <Countdown endsAt={SALE.endsAt} />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-white/80">
            Every price on the site is already 20% below US retail. Once the countdown ends, prices
            return to normal — order before it does.
          </p>
        </div>
      </div>
    </section>
  );
}
