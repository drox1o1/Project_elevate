"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollFadeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Cascade interval between direct children. */
  stagger?: number;
  /** Rise distance in px. */
  y?: number;
  /** Pop children in with a back-out scale instead of a plain rise. */
  pop?: boolean;
  /** Extra delay once the trigger fires. */
  delay?: number;
}

/**
 * Rises its direct children in on scroll — the site-wide entrance for
 * headings, copy and badge rows. Each child gets its own once-only
 * ScrollTrigger so long sections animate as they arrive, not all at once.
 */
export function ScrollFade({
  children,
  className,
  stagger = 0.07,
  y = 16,
  pop = false,
  delay = 0,
  ...rest
}: ScrollFadeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const items = gsap.utils.toArray<HTMLElement>(root.children);
      if (items.length === 0) return;

      if (reduced) {
        gsap.set(items, { y: 0, scale: 1, opacity: 1, clearProps: "filter" });
        return;
      }

      gsap.set(
        items,
        pop
          ? { scale: 0.8, opacity: 0, filter: "blur(6px)" }
          : { y, opacity: 0, filter: "blur(8px)" }
      );
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: pop ? 0.45 : 0.5,
            ease: pop ? "back.out(1.7)" : "power3.out",
            stagger,
            delay,
            overwrite: true,
            clearProps: "filter",
          }),
      });
    },
    { dependencies: [reduced, stagger, y, pop, delay], scope: rootRef }
  );

  return (
    <div ref={rootRef} className={cn(className)} {...rest}>
      {children}
    </div>
  );
}
