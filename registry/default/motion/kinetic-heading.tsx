"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export interface KineticHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  text: string;
  as?: "h1" | "h2" | "h3";
  trigger?: "mount" | "scroll";
  /** Seconds per char. Default 0.028. */
  stagger?: number;
  delay?: number;
  ref?: React.Ref<HTMLHeadingElement>;
}

const SIZE: Record<string, string> = {
  h1: "text-4xl md:text-6xl",
  h2: "text-3xl md:text-5xl",
  h3: "text-2xl md:text-4xl",
};

export function KineticHeading({
  text,
  as = "h1",
  trigger = "mount",
  stagger = 0.028,
  delay = 0,
  className,
  ref,
  ...rest
}: KineticHeadingProps) {
  const rootRef = React.useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const Tag = as;
  React.useImperativeHandle(ref, () => rootRef.current as HTMLHeadingElement);

  const words = React.useMemo(() => text.split(" "), [text]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const chars = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll('[data-slot="char"]')
      );

      if (reduced) {
        gsap.set(root, { visibility: "visible" });
        gsap.set(chars, { yPercent: 0, opacity: 1 });
        return;
      }

      gsap.set(chars, { yPercent: 110, opacity: 0 });
      gsap.set(root, { visibility: "visible" });

      const vars: gsap.TweenVars = {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power4.out",
        stagger,
        delay,
      };
      if (trigger === "scroll") {
        vars.scrollTrigger = { trigger: root, start: "top 85%", once: true };
      }
      gsap.to(chars, vars);
    },
    { dependencies: [text, trigger, stagger, delay, reduced], scope: rootRef }
  );

  return (
    <Tag
      ref={rootRef}
      data-slot="kinetic-heading"
      aria-label={text}
      style={{ visibility: "hidden" }}
      className={cn(
        "font-semibold tracking-tight text-foreground",
        SIZE[as],
        className
      )}
      {...rest}
    >
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          <span
            data-slot="word"
            aria-hidden="true"
            className="inline-block overflow-hidden align-bottom"
          >
            {Array.from(word).map((char, ci) => (
              <span key={ci} data-slot="char" className="inline-block">
                {char}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
}
