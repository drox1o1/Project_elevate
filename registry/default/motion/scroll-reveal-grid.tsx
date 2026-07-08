"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollRevealGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Wrapper grid: direct children rise-in on scroll with a grid-aware stagger.
 */
export function ScrollRevealGrid({
  className,
  children,
  ref,
  ...rest
}: ScrollRevealGridProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const cards = gsap.utils.toArray<HTMLElement>(
        Array.from(root.children) as HTMLElement[]
      );
      if (!cards.length) return;
      if (reduced) {
        gsap.set(cards, { y: 0, opacity: 1 });
        return;
      }
      gsap.set(cards, { y: 12, opacity: 0 });
      gsap.to(cards, {
        y: 0,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
        stagger: { each: 0.08, grid: "auto", from: "start" },
        scrollTrigger: {
          trigger: root,
          start: "top 80%",
          once: true,
        },
      });
    },
    { dependencies: [reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="scroll-reveal-grid"
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
