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

export function Countdown({ endsAt, tone = "light" }: { endsAt: string; tone?: "light" | "dark" }) {
  const target = new Date(endsAt).getTime();
  const [left, setLeft] = useState(() => remainingUntil(target));

  useEffect(() => {
    const id = setInterval(() => setLeft(remainingUntil(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells: [number, string][] = [
    [left.days, "DAYS"],
    [left.hours, "HOURS"],
    [left.mins, "MINS"],
    [left.secs, "SECS"],
  ];

  const pill =
    tone === "light"
      ? "bg-white/15 text-white"
      : "bg-navy text-white";

  return (
    <div className="flex gap-3">
      {cells.map(([value, label]) => (
        <div key={label} className="text-center">
          <div
            className={`flex h-14 w-16 items-center justify-center rounded-2xl text-2xl font-bold tabular-nums ${pill}`}
          >
            {String(value).padStart(2, "0")}
          </div>
          <div
            className={`mt-1.5 text-[10px] font-semibold tracking-widest ${
              tone === "light" ? "text-white/70" : "text-muted-foreground"
            }`}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
