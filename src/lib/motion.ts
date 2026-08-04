import type { Transition, Variants } from "framer-motion";

/**
 * One motion vocabulary for the whole site.
 *
 * Durations sit in the 150–400ms band: long enough to read as intentional,
 * short enough never to gate an interaction. Exits run at ~65% of entrances so
 * dismissals feel responsive. Only transform and opacity are animated, so
 * nothing here can trigger layout or paint thrash.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const; // entering
export const EASE_IN = [0.7, 0, 0.84, 0] as const; // exiting

export const springSoft: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 34,
  mass: 0.7,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Parent for grids and lists; children stagger in a shallow wave. */
export const stagger = (each = 0.05, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: each, delayChildren: delay },
  },
});

/** Card/tile entrance — paired with `stagger` on the container. */
export const tileIn: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

/** Route-level transition. Deliberately quiet: content, not choreography. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.2, ease: EASE_IN } },
};

/** Shared viewport config so reveals fire once, slightly before entry. */
export const revealOnce = { once: true, margin: "-64px" } as const;
