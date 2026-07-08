"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface StreamTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  /** Chars per second. Default 45. */
  speed?: number;
  startDelay?: number;
  caret?: boolean;
  onComplete?: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export function StreamText({
  text,
  speed = 45,
  startDelay = 0.2,
  caret = true,
  onComplete,
  className,
  ref,
  ...rest
}: StreamTextProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const caretRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const words = React.useMemo(() => text.split(/(\s+)/), [text]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const wordEls = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll('[data-slot="word"]')
      );
      const caretEl = caretRef.current;

      if (reduced) {
        gsap.set(wordEls, { opacity: 1 });
        if (caretEl) gsap.set(caretEl, { display: "none" });
        onCompleteRef.current?.();
        return;
      }

      const totalDuration = text.length / speed;
      const wordCount = wordEls.length || 1;

      if (caretEl) {
        gsap.fromTo(
          caretEl,
          { opacity: 1 },
          {
            opacity: 0,
            duration: 0.55,
            ease: "steps(1)",
            repeat: -1,
            yoyo: true,
          }
        );
      }

      gsap.to(wordEls, {
        opacity: 1,
        duration: 0.18,
        ease: "none",
        delay: startDelay,
        stagger: totalDuration / wordCount,
        onComplete: () => {
          onCompleteRef.current?.();
          if (caretEl) {
            // hold caret 0.8s after complete, then remove
            gsap.to(caretEl, {
              opacity: 0,
              display: "none",
              duration: 0.2,
              delay: 0.8,
              overwrite: true,
            });
          }
        },
      });
    },
    { dependencies: [text, speed, startDelay, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="stream-text"
      aria-label={text}
      className={cn("max-w-prose text-sm leading-6 text-foreground", className)}
      {...rest}
    >
      <span aria-hidden="true">
        {words.map((w, i) =>
          /^\s+$/.test(w) ? (
            <span key={i}>{w}</span>
          ) : (
            <span key={i} data-slot="word" className="opacity-0">
              {w}
            </span>
          )
        )}
        {caret ? (
          <span
            ref={caretRef}
            data-slot="caret"
            className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-foreground"
          />
        ) : null}
      </span>
    </div>
  );
}
