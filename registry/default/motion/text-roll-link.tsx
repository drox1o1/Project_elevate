"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface TextRollLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  ref?: React.Ref<HTMLAnchorElement>;
}

export function TextRollLink({
  label,
  className,
  ref,
  ...rest
}: TextRollLinkProps) {
  const rootRef = React.useRef<HTMLAnchorElement>(null);
  const underlineRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLAnchorElement);

  const chars = React.useMemo(() => Array.from(label), [label]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const underline = underlineRef.current;
      if (!root || !underline || reduced) return;

      const stacks = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll('[data-slot="char-stack"]')
      );
      gsap.set(underline, { scaleX: 0, transformOrigin: "left" });

      const enter = () => {
        gsap.to(stacks, {
          yPercent: -100,
          duration: 0.35,
          ease: "power3.inOut",
          stagger: 0.015,
          overwrite: true,
        });
        gsap.to(underline, {
          scaleX: 1,
          transformOrigin: "left",
          duration: 0.3,
          ease: "power3.out",
          overwrite: true,
        });
      };
      const leave = () => {
        gsap.to(stacks, {
          yPercent: 0,
          duration: 0.35,
          ease: "power3.inOut",
          stagger: 0.015,
          overwrite: true,
        });
        gsap.to(underline, {
          scaleX: 0,
          transformOrigin: "right",
          duration: 0.3,
          ease: "power3.out",
          overwrite: true,
        });
      };

      root.addEventListener("pointerenter", enter);
      root.addEventListener("pointerleave", leave);
      root.addEventListener("focus", enter);
      root.addEventListener("blur", leave);
      return () => {
        root.removeEventListener("pointerenter", enter);
        root.removeEventListener("pointerleave", leave);
        root.removeEventListener("focus", enter);
        root.removeEventListener("blur", leave);
      };
    },
    { dependencies: [label, reduced], scope: rootRef }
  );

  return (
    <a
      ref={rootRef}
      data-slot="text-roll-link"
      aria-label={label}
      className={cn(
        "relative inline-block pb-0.5 text-sm font-medium text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
        className
      )}
      {...rest}
    >
      <span aria-hidden="true" className="flex">
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block h-[1.2em] overflow-hidden leading-[1.2em]"
          >
            <span data-slot="char-stack" className="flex flex-col">
              <span className="block whitespace-pre">{char}</span>
              <span className="block whitespace-pre">{char}</span>
            </span>
          </span>
        ))}
      </span>
      <span
        ref={underlineRef}
        data-slot="underline"
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full bg-foreground"
      />
    </a>
  );
}
