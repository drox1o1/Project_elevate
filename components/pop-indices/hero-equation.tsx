"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/**
 * The landing hero's resolving equation (PRD §1, §17).
 *
 * A cultural reference walks through its own transformation into a present
 * value: `50 tola → 583.19 g → historical price → present value`. Each stage
 * holds long enough to read, which is the whole point — the motion has to
 * explain the causality, not perform it.
 *
 * Motion ownership: GSAP, because this is narrative rather than component
 * state. Under reduced motion the sequence is replaced by the resolved final
 * line, so no information is lost.
 */

export interface EquationStage {
  /** The expression at this stage. */
  text: string;
  /** Caption under the expression. */
  caption: string;
}

export interface HeroEquationProps {
  stages: EquationStage[];
  className?: string;
  /** Seconds each stage holds before the next. */
  hold?: number;
  /** Set on the dark scene bands. */
  invert?: boolean;
}

export function HeroEquation({
  stages,
  className,
  hold = 2.1,
  invert = false,
}: HeroEquationProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(reduced ? stages.length - 1 : 0);

  useGSAP(
    () => {
      if (reduced) {
        setActive(stages.length - 1);
        return;
      }
      // A repeating timeline whose only job is to advance the index — the
      // per-stage crossfade is owned by CSS transitions below, so nothing is
      // animated by two systems at once.
      const tl = gsap.timeline({ repeat: -1 });
      stages.forEach((_, i) => {
        tl.call(() => setActive(i), undefined, i * hold);
      });
      tl.to({}, { duration: stages.length * hold });
      return () => tl.kill();
    },
    { dependencies: [reduced, stages.length, hold], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className={cn("w-full", className)}
      // The equation is decorative repetition of what the copy already says;
      // announcing every stage would be noise. The resolved line is exposed
      // once, below, for assistive tech.
      aria-hidden="true"
    >
      <div className="relative flex min-h-[6.5rem] flex-col items-center justify-center gap-2 overflow-hidden px-2 sm:min-h-[7.5rem]">
        {stages.map((stage, i) => (
          <div
            key={stage.text}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-2",
              "transition-[opacity,transform,filter] duration-500 ease-out-expo",
              "motion-reduce:transition-none",
              i === active
                ? "translate-y-0 opacity-100 blur-0"
                : i < active
                  ? "-translate-y-2 opacity-0 blur-[3px]"
                  : "translate-y-2 opacity-0 blur-[3px]"
            )}
          >
            <span
              className={cn(
                "text-balance text-center font-mono text-xl tracking-tight numeric sm:text-3xl",
                invert ? "text-white" : "text-foreground"
              )}
            >
              {stage.text}
            </span>
            <span
              className={cn(
                "text-center font-mono type-caption uppercase tracking-[0.14em]",
                invert ? "text-white/45" : "text-muted-foreground"
              )}
            >
              {stage.caption}
            </span>
          </div>
        ))}
      </div>

      {/* Progress rail — reads as a filmstrip of the transformation. */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        {stages.map((stage, i) => (
          <span
            key={stage.text}
            className={cn(
              "h-0.5 w-5 transition-colors duration-300",
              i <= active
                ? invert
                  ? "bg-white/70"
                  : "bg-foreground/70"
                : invert
                  ? "bg-white/15"
                  : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
