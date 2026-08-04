import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; mins: number; secs: number };

const remainingUntil = (target: number): Remaining => {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    mins: Math.floor(ms / 60_000) % 60,
    secs: Math.floor(ms / 1000) % 60,
  };
};

/**
 * Deliberately quiet. The old treatment was a large glass card of oversized
 * digits that out-shouted the headline; urgency reads better as precise, small
 * type. Tabular numerals stop the row reflowing every second.
 */
export function Countdown({
  endsAt,
  size = "sm",
}: {
  endsAt: string;
  size?: "sm" | "lg";
}) {
  const target = new Date(endsAt).getTime();
  const [left, setLeft] = useState(() => remainingUntil(target));

  useEffect(() => {
    const id = setInterval(() => setLeft(remainingUntil(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells: [number, string][] = [
    [left.days, "d"],
    [left.hours, "h"],
    [left.mins, "m"],
    [left.secs, "s"],
  ];

  if (size === "sm") {
    return (
      <span className="tabular inline-flex items-baseline gap-1.5 font-mono text-[13px] text-[var(--color-ink)]">
        {cells.map(([v, l]) => (
          <span key={l}>
            {String(v).padStart(2, "0")}
            <span className="text-[var(--color-ink-faint)]">{l}</span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className="flex gap-3">
      {cells.map(([v, l]) => (
        <div
          key={l}
          className="min-w-[68px] rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-3 text-center"
        >
          <div className="tabular font-mono text-2xl font-medium tracking-tight">
            {String(v).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-ink-faint)]">
            {l === "d" ? "days" : l === "h" ? "hrs" : l === "m" ? "min" : "sec"}
          </div>
        </div>
      ))}
    </div>
  );
}
