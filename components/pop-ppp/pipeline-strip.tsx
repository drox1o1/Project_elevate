"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * "What is being measured?" (PRD §4).
 *
 * Scene → Unit → Dataset → Equation → Index, revealed in order on scroll so
 * the pipeline reads as a sequence rather than as five cards that happen to
 * be adjacent. The connecting rule draws itself between stages, which is the
 * only thing on the page that animates purely to show direction.
 *
 * Motion ownership: GSAP. Narrative section.
 */

export interface PipelineStage {
  label: string;
  detail: string;
  example: string;
}

export function PipelineStrip({
  stages,
  className,
}: {
  stages: PipelineStage[];
  className?: string;
}) {
  const rootRef = React.useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const items = gsap.utils.toArray<HTMLElement>(root.children);
      const rules = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-pipeline-rule]")
      );

      if (reduced) {
        gsap.set(items, { opacity: 1, y: 0, clearProps: "filter" });
        gsap.set(rules, { scaleX: 1 });
        return;
      }

      gsap.set(items, { opacity: 0, y: 14, filter: "blur(6px)" });
      gsap.set(rules, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });
      items.forEach((item, i) => {
        tl.to(
          item,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power3.out",
            clearProps: "filter",
          },
          i * 0.16
        );
        const rule = item.querySelector<HTMLElement>("[data-pipeline-rule]");
        if (rule) {
          tl.to(rule, { scaleX: 1, duration: 0.3, ease: "power2.out" }, i * 0.16 + 0.28);
        }
      });
    },
    { dependencies: [reduced, stages.length], scope: rootRef }
  );

  return (
    <ol
      ref={rootRef}
      className={cn(
        "grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-0",
        className
      )}
    >
      {stages.map((stage, i) => (
        <li key={stage.label} className="relative min-w-0 lg:pr-5">
          <div className="flex items-center gap-2">
            <span className="font-mono type-caption text-muted-foreground numeric">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="type-title text-foreground">{stage.label}</h3>
          </div>
          {/* The rule between stages — hidden on the last one. */}
          {i < stages.length - 1 ? (
            <span
              data-pipeline-rule
              aria-hidden="true"
              className="mt-3 hidden h-px w-full bg-border lg:block"
            />
          ) : (
            <span aria-hidden="true" className="mt-3 hidden h-px w-full lg:block" />
          )}
          <p className="mt-3 type-meta leading-6 text-muted-foreground lg:mt-2">
            {stage.detail}
          </p>
          <p className="mt-2 break-words font-mono type-caption text-foreground numeric">
            {stage.example}
          </p>
        </li>
      ))}
    </ol>
  );
}
