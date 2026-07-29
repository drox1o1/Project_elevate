"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { ConfidenceBadge } from "@/components/pop-ppp/confidence-badge";
import { IndexGlyph } from "@/components/pop-ppp/index-glyph";
import type { Confidence, EconomicCategory } from "@/lib/pop-ppp/types";

/**
 * An index-grid card (PRD §3).
 *
 * Carries the six things the grid promises — scene, indexed item, base year,
 * current value, change, one-line reading — and nothing else. Typography and
 * an abstract mark do the visual work; no posters.
 *
 * Motion ownership: Motion, because this is component-level interaction
 * state. GSAP never touches these elements.
 */

export interface IndexCardData {
  slug: string;
  shortName: string;
  film: string;
  indexedUnit: string;
  baseYear: number;
  latestYear: number;
  currentValue: string;
  change: string;
  changePositive: boolean;
  reading: string;
  confidence: Confidence;
  category: EconomicCategory;
  accent: { light: string; dark: string };
}

export function IndexCard({ data, className }: { data: IndexCardData; className?: string }) {
  const reduced = useReducedMotion();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      transition={
        reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }
      }
      className={cn("min-w-0", className)}
      style={{ "--pop-accent": data.accent.light } as React.CSSProperties}
      data-pop-card={uid}
    >
      <style>{`.dark [data-pop-card="${uid}"]{--pop-accent:${data.accent.dark}}`}</style>
      <Link
        href={`/pop-ppp/${data.slug}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5",
          "transition-colors duration-200 hover:border-[color-mix(in_oklab,var(--pop-accent)_45%,var(--border))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {/* Accent wash, tinted by index rather than by film branding. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full opacity-[0.13] blur-2xl transition-opacity duration-300 group-hover:opacity-25"
          style={{ background: "var(--pop-accent)" }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="type-title text-foreground">{data.shortName}</h3>
            <p className="mt-0.5 type-meta text-muted-foreground">{data.film}</p>
          </div>
          <IndexGlyph
            category={data.category}
            className="h-8 w-10 shrink-0 text-[var(--pop-accent)] opacity-70"
          />
        </div>

        <p className="relative mt-3 type-label text-foreground">{data.indexedUnit}</p>
        <p className="relative mt-0.5 font-mono type-caption text-muted-foreground numeric">
          {data.baseYear}–{data.latestYear}
        </p>

        <div className="relative mt-4 flex items-end justify-between gap-3">
          <span className="type-metric text-foreground numeric">
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

        <p className="relative mt-3 flex-1 type-meta leading-6 text-muted-foreground">
          {data.reading}
        </p>

        <div className="relative mt-4 flex items-center justify-between gap-2">
          <ConfidenceBadge level={data.confidence} />
          <span className="font-mono type-caption uppercase tracking-[0.08em] text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5">
            Open index →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
