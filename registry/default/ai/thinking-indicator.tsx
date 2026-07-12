"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface ThinkingIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export function ThinkingIndicator({
  label = "Thinking",
  className,
  ref,
  ...rest
}: ThinkingIndicatorProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;
      const dots = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll('[data-slot="dot"]')
      );
      gsap.fromTo(
        dots,
        { scale: 0.7, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.15,
        }
      );
    },
    { dependencies: [reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="thinking-indicator"
      role="status"
      className={cn("inline-flex items-center gap-2", className)}
      {...rest}
    >
      <span className="relative inline-flex overflow-hidden text-sm text-muted-foreground">
        {label}
        {reduced ? "…" : null}
        {!reduced ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-[duku-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent"
          />
        ) : null}
      </span>
      {!reduced ? (
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              data-slot="dot"
              className="size-1 rounded-full bg-muted-foreground"
            />
          ))}
        </span>
      ) : null}
    </div>
  );
}
