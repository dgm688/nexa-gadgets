import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp, revealOnce, springSoft, stagger, tileIn } from "@/lib/motion";

/** Section wrapper with consistent vertical rhythm. */
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`container-page py-20 md:py-28 ${className}`}>
      {children}
    </section>
  );
}

/**
 * Section header. Eyebrow carries the category, the heading carries the
 * promise — so the eye lands on one line of large type, not two competing ones.
 */
export function SectionHead({
  overline,
  title,
  lede,
  action,
}: {
  overline?: string;
  title: string;
  lede?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={revealOnce}
      className="mb-10 flex flex-wrap items-end justify-between gap-6"
    >
      <div className="max-w-2xl">
        {overline && <p className="eyebrow mb-3">{overline}</p>}
        <h2 className="text-3xl md:text-[2.75rem] md:leading-[1.05]">{title}</h2>
        {lede && (
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-dim)]">
            {lede}
          </p>
        )}
      </div>
      {action}
    </motion.div>
  );
}

/** Grid whose children reveal in a shallow diagonal wave. */
export function RevealGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={stagger(0.05)}
      initial="hidden"
      whileInView="show"
      viewport={revealOnce}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={tileIn} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Primary CTA. Solid ink-on-light — the single highest-contrast element on any
 * given screen, so there is never ambiguity about the main action.
 */
export function ButtonPrimary({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
  external,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  external?: boolean;
}) {
  const cls =
    "group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[14px] font-semibold text-[#08090a] transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 " +
    className;

  if (href) {
    return (
      <motion.a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={cls}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={springSoft}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={springSoft}
    >
      {children}
    </motion.button>
  );
}

/** Secondary CTA — hairline only, so it never competes with the primary. */
export function ButtonGhost({
  children,
  href,
  onClick,
  className = "",
  external,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  external?: boolean;
}) {
  const cls =
    "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-hairline-strong)] px-6 py-3 text-[14px] font-medium text-[var(--color-ink)] transition-colors duration-200 hover:border-[var(--color-ink-dim)] hover:bg-white/[0.04] " +
    className;

  if (href) {
    return (
      <motion.a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={cls}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={springSoft}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cls}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={springSoft}
    >
      {children}
    </motion.button>
  );
}

/** Small metadata pill used for badges and status. */
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "sale" | "new" | "accent" | "onImageSale" | "onImageDark";
}) {
  const tones = {
    neutral: "bg-white/[0.06] text-[var(--color-ink-dim)] border-transparent",
    sale: "bg-[var(--color-sale)]/12 text-[var(--color-sale)] border-[var(--color-sale)]/25",
    new: "bg-white/[0.08] text-[var(--color-ink)] border-[var(--color-hairline-strong)]",
    accent:
      "bg-[var(--color-accent)]/14 text-[var(--color-accent-hot)] border-[var(--color-accent)]/25",
    /*
     * Badges that sit on the light product tile need their own tones — the
     * dark-canvas variants above are light-on-light there and disappear.
     */
    onImageSale: "bg-[var(--color-sale)] text-[#08090a] border-transparent",
    onImageDark: "bg-[#08090a]/88 text-white border-transparent backdrop-blur-sm",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
