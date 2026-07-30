"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { ConfidenceBadge } from "@/components/pop-ppp/confidence-badge";
import { IndexArtwork } from "@/components/pop-ppp/index-artwork";
import type { Confidence, Motif } from "@/lib/pop-ppp/types";

/**
 * An index card.
 *
 * Composed as a piece of editorial rather than as a dashboard tile: the
 * dialogue leads, the artwork is the index's own series drawn large and
 * bleeding out of the frame, and the current value is set as display type
 * rather than as a metric label. The ordinal is furniture.
 *
 * The artwork sits behind the text at low opacity and lifts on hover, which
 * is the only decorative motion here — everything else in the card is
 * information.
 *
 * Motion ownership: Motion. GSAP never touches these elements.
 */

export interface IndexCardData {
  slug: string;
  shortName: string;
  film: string;
  releaseYear: number;
  dialogue: string;
  indexedUnit: string;
  baseYear: number;
  latestYear: number;
  baseValue: string;
  currentValue: string;
  change: string;
  changePositive: boolean;
  reading: string;
  confidence: Confidence;
  motif: Motif;
  accent: { light: string; dark: string };
  values: number[];
  /** Key art. Falls back to the generative artwork when absent. */
  imageSrc?: string | null;
}

export function IndexCard({
  data,
  ordinal,
  className,
}: {
  data: IndexCardData;
  ordinal?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <motion.article
      whileHover={reduced ? undefined : { y: -4 }}
      transition={
        reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }
      }
      className={cn("group min-w-0", className)}
      style={{ "--pop-accent": data.accent.light } as React.CSSProperties}
      data-pop-card={uid}
    >
      <style>{`.dark [data-pop-card="${uid}"]{--pop-accent:${data.accent.dark}}`}</style>

      <Link
        href={`/pop-ppp/${data.slug}`}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card",
          "border-border transition-colors duration-300",
          "hover:border-[color-mix(in_oklab,var(--pop-accent)_50%,var(--border))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {/* Key art when the index has it; otherwise the series drawn large
            and cropped. Either way the card has an image. */}
        {data.imageSrc ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.imageSrc}
              alt=""
              loading="lazy"
              className={cn(
                "size-full object-cover",
                "transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]",
                "motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              )}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 55%, color-mix(in oklab, var(--pop-accent) 22%, transparent) 100%)",
              }}
            />
          </div>
        ) : (
          <>
            <IndexArtwork
              values={data.values}
              motif={data.motif}
              className={cn(
                "pointer-events-none absolute -right-14 -top-12 h-56 w-56 opacity-[0.16]",
                "transition-[opacity,transform] duration-500 ease-out-expo",
                "group-hover:scale-[1.06] group-hover:opacity-[0.3]",
                "motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              )}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 80% at 100% 0%, color-mix(in oklab, var(--pop-accent) 9%, transparent) 0%, transparent 60%)",
              }}
            />
          </>
        )}

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center gap-3">
            {ordinal != null ? (
              <span className="font-mono type-caption text-muted-foreground numeric">
                {String(ordinal).padStart(2, "0")}
              </span>
            ) : null}
            <span aria-hidden="true" className="h-px w-6 bg-border" />
            <span className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
              {data.film} · {data.releaseYear}
            </span>
          </div>

          {/* The hook, in the register it deserves. */}
          <blockquote className="mt-5">
            <p className="text-balance text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-xl">
              &ldquo;{data.dialogue}&rdquo;
            </p>
          </blockquote>

          <p className="mt-4 type-meta text-muted-foreground">{data.indexedUnit}</p>

          {/* Result as display type, not as a dashboard stat. */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-[1.75rem] font-semibold leading-none tracking-[-0.02em] text-foreground numeric sm:text-3xl">
              {data.currentValue}
            </span>
            <span
              className={cn(
                "font-mono type-meta numeric",
                data.changePositive ? "text-market-up" : "text-market-down"
              )}
            >
              {data.change}
            </span>
          </div>
          <p className="mt-1.5 font-mono type-caption text-muted-foreground numeric">
            from {data.baseValue} in {data.baseYear} · verified to {data.latestYear}
          </p>

          <p className="mt-5 flex-1 type-meta italic leading-6 text-muted-foreground">
            {data.reading}
          </p>

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
            <ConfidenceBadge level={data.confidence} />
            <span className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
              Open →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
