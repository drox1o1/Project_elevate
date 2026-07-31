"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/pop-indices/confidence-badge";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import type { PresentedComputing } from "@/lib/pop-indices/present";

/**
 * "What could Rocket Singh build with the same money?"
 *
 * The amount is held fixed and the year moves, which is the only way to show
 * technology deflation without an index number in the way. Motion owns the
 * state transitions here — the rows are a shared-layout list and the bars are
 * springs — while GSAP owns nothing on this component. One system per element.
 */
export function SameMoney({
  data,
  accent,
  id,
  className,
}: {
  data: PresentedComputing;
  accent: { light: string; dark: string };
  id: string;
  className?: string;
}) {
  const [bandIndex, setBandIndex] = React.useState(
    // Open on the tier the page leads with, so the first thing shown is the
    // band that contains the headline machine.
    Math.max(0, data.sameMoney.findIndex((b) => b.amount === 85000))
  );
  const reduced = useReducedMotion();
  const band = data.sameMoney[bandIndex];

  return (
    <div
      data-pop-money={id}
      className={cn("min-w-0", className)}
      style={{ "--pop-accent": accent.light } as React.CSSProperties}
    >
      <style>{`.dark [data-pop-money="${id}"]{--pop-accent:${accent.dark}}`}</style>

      <div
        role="tablist"
        aria-label="Amount"
        className="flex flex-wrap gap-2"
      >
        {data.sameMoney.map((b, i) => {
          const active = i === bandIndex;
          return (
            <button
              key={b.amount}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setBandIndex(i)}
              className={cn(
                "relative rounded-full border px-4 py-2 font-mono type-caption numeric transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                active
                  ? "border-transparent text-background"
                  : "border-input text-muted-foreground hover:bg-muted/60"
              )}
            >
              {active ? (
                <motion.span
                  layoutId={`money-pill-${id}`}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                  className="absolute inset-0 rounded-full bg-foreground"
                />
              ) : null}
              <span className="relative">{b.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 max-w-2xl type-meta leading-6 text-muted-foreground">
        The sum is held fixed. The year moves. Capability is the same composite
        used above, indexed so the {data.baseYear} business machine is 100.
      </p>

      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <caption className="sr-only">
            What {band.label} bought in each year, by constituent.
          </caption>
          <thead>
            <tr className="border-b border-border">
              {[
                "Year",
                "Processor",
                "Memory",
                "Storage",
                "Graphics",
                "Display",
                "Capability",
              ].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={cn(
                    "pb-3 pr-4 font-mono type-caption font-normal uppercase tracking-[0.1em] text-muted-foreground last:pr-0",
                    i === 6 && "text-right"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait" initial={false}>
              <motion.tr key={band.amount} className="hidden" aria-hidden="true" />
            </AnimatePresence>
            {band.rows.map((r, i) => (
              <motion.tr
                key={`${band.amount}-${r.year}`}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.28, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }
                }
                className="border-b border-border align-top"
              >
                <td className="py-4 pr-4">
                  <span className="font-mono type-label text-foreground numeric">
                    {r.year}
                  </span>
                  <ConfidenceBadge level={r.confidence} className="mt-1.5 flex" />
                </td>
                <td className="py-4 pr-4 type-meta leading-5 text-foreground">
                  {r.processor}
                </td>
                <td className="py-4 pr-4 type-meta leading-5 text-foreground">
                  {r.memory}
                </td>
                <td className="py-4 pr-4 type-meta leading-5 text-foreground">
                  {r.storage}
                </td>
                <td className="py-4 pr-4 type-meta leading-5 text-foreground">
                  {r.graphics}
                </td>
                <td className="py-4 pr-4 type-meta leading-5 text-muted-foreground">
                  {r.display}
                </td>
                <td className="w-[11rem] py-4">
                  <span className="block text-right font-mono type-label text-foreground numeric">
                    {r.capabilityLabel}
                  </span>
                  <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ background: "var(--pop-accent)" }}
                      initial={reduced ? false : { width: 0 }}
                      animate={{ width: `${Math.max(2, r.barWidth)}%` }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 180, damping: 26, delay: i * 0.03 }
                      }
                    />
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-5 flex flex-col gap-2">
        {band.rows
          .filter((r) => r.note)
          .map((r) => (
            <li
              key={r.year}
              className="flex gap-3 type-meta leading-6 text-muted-foreground"
            >
              <span className="shrink-0 font-mono text-foreground numeric">
                {r.year}
              </span>
              <span>{r.note}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
