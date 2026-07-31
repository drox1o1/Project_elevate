"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import type { EquationStep } from "@/lib/pop-indices/types";

gsap.registerPlugin(ScrollTrigger);

/**
 * The visible equation (PRD §D, §14.4).
 *
 * Every step is on the page, not in a methodology footnote, and every number
 * introduced by a step names the dataset it came from. The scroll animation
 * walks down the transformation one line at a time so the causality reads in
 * order — it is not number-scrambling, and under reduced motion the whole
 * equation is simply present.
 *
 * Motion ownership: GSAP. This is a narrative section.
 */

export interface RawValue {
  label: string;
  value: string;
  note?: string;
}

/**
 * An equation step with its dataset citation already resolved to a link and a
 * label. The resolution happens on the server — passing lookup functions to a
 * client component is not possible across the boundary.
 */
export interface ResolvedEquationStep extends EquationStep {
  sourceHref?: string;
  sourceLabel?: string;
}

export interface EquationBlockProps {
  steps: ResolvedEquationStep[];
  /** Unrounded values behind the rounded display, revealed on demand. */
  raw?: RawValue[];
  /** Rounding rule applied to every displayed figure. */
  roundingRule?: string;
  className?: string;
}

export function EquationBlock({
  steps,
  raw = [],
  roundingRule,
  className,
}: EquationBlockProps) {
  const rootRef = React.useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const [showRaw, setShowRaw] = React.useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const rows = gsap.utils.toArray<HTMLElement>(root.children);
      if (rows.length === 0) return;

      if (reduced) {
        gsap.set(rows, { opacity: 1, x: 0, clearProps: "filter" });
        return;
      }

      gsap.set(rows, { opacity: 0, x: -12, filter: "blur(4px)" });
      gsap.to(rows, {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 0.45,
        ease: "power3.out",
        stagger: 0.12,
        clearProps: "filter",
        scrollTrigger: { trigger: root, start: "top 82%", once: true },
      });
    },
    { dependencies: [reduced, steps.length], scope: rootRef }
  );

  return (
    <div className={cn("w-full", className)}>
      <ol ref={rootRef} className="flex flex-col gap-0">
        {steps.map((step, i) => (
          <li
            key={`${step.expression}-${i}`}
            className={cn(
              "grid gap-1 border-l-2 py-4 pl-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-6",
              i === steps.length - 1 ? "border-foreground/40" : "border-border"
            )}
          >
            <div className="min-w-0">
              <p className="break-words font-mono text-base text-foreground numeric sm:text-lg">
                {step.expression}
              </p>
              <p className="mt-1 type-meta text-muted-foreground">
                <span className="font-mono" aria-hidden="true">
                  ={" "}
                </span>
                <span className="sr-only">equals </span>
                {step.result}
              </p>
            </div>
            <div className="min-w-0 sm:pt-1">
              {step.note ? (
                <p className="type-meta leading-6 text-muted-foreground">{step.note}</p>
              ) : null}
              {step.datasetId ? (
                <p className="mt-1 type-caption">
                  <a
                    href={step.sourceHref ?? "#source-ledger"}
                    className="text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Source: {step.sourceLabel ?? step.datasetId}
                  </a>
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {raw.length > 0 ? (
        <div className="mt-5">
          <button
            type="button"
            aria-expanded={showRaw}
            onClick={() => setShowRaw((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono type-caption uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-150 hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true">{showRaw ? "−" : "+"}</span>
            {showRaw ? "Hide raw calculation" : "Show raw calculation"}
          </button>

          {showRaw ? (
            <dl className="mt-3 divide-y divide-border rounded-lg border border-border bg-muted/30">
              {raw.map((r) => (
                <div
                  key={r.label}
                  className="grid gap-1 p-3 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-baseline sm:gap-4"
                >
                  <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                    {r.label}
                  </dt>
                  <dd className="min-w-0">
                    <span className="break-all font-mono type-label text-foreground numeric">
                      {r.value}
                    </span>
                    {r.note ? (
                      <span className="mt-0.5 block type-caption text-muted-foreground">
                        {r.note}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
              {roundingRule ? (
                <div className="p-3">
                  <p className="type-caption text-muted-foreground">
                    <span className="uppercase tracking-[0.06em]">Rounding — </span>
                    {roundingRule}
                  </p>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
