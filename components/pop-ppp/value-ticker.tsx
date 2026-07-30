"use client";

import { Marquee } from "@/registry/default/motion/marquee";
import { cn } from "@/lib/utils";

/**
 * A running tape of every published index.
 *
 * Borrowed deliberately from a trading terminal: it is the one piece of
 * furniture that says "these are live figures with units" before the reader
 * has scrolled to a single chart. It pauses under reduced motion — the
 * underlying Marquee handles that — and it is aria-hidden because the same
 * values are on the page as real, navigable content.
 */

export interface TickerItem {
  shortName: string;
  value: string;
  change: string;
  changePositive: boolean;
}

export function ValueTicker({
  items,
  className,
}: {
  items: TickerItem[];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden border-y border-white/10 py-3",
        className
      )}
    >
      <Marquee speed={46} className="[--gap:0px]">
        <div className="flex shrink-0 items-center">
          {items.map((it) => (
            <span
              key={it.shortName}
              className="flex items-center gap-2.5 whitespace-nowrap px-5"
            >
              <span className="font-mono type-caption uppercase tracking-[0.12em] text-white/45">
                {it.shortName}
              </span>
              <span className="font-mono type-meta text-white numeric">{it.value}</span>
              <span
                className={cn(
                  "font-mono type-caption numeric",
                  it.changePositive ? "text-market-up" : "text-market-down"
                )}
              >
                {it.change}
              </span>
              <span className="text-white/15">/</span>
            </span>
          ))}
        </div>
      </Marquee>
      {/* Feathered ends so the tape reads as continuous. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16"
        style={{ background: "linear-gradient(to right, #08080a, transparent)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16"
        style={{ background: "linear-gradient(to left, #08080a, transparent)" }}
      />
    </div>
  );
}
