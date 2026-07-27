"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export interface StatCounterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  /** % change; renders a ▲/▼ badge in the sanctioned semantic colors. */
  delta?: number;
  locale?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export function StatCounter({
  value,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  label,
  delta,
  locale = "en-IN",
  className,
  ref,
  ...rest
}: StatCounterProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const numberRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const format = React.useCallback(
    (n: number) =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n),
    [locale, decimals]
  );

  useGSAP(
    () => {
      const node = numberRef.current;
      if (!node) return;
      const write = (n: number) => {
        node.textContent = `${prefix}${format(n)}${suffix}`;
      };
      if (reduced) {
        write(value);
        return;
      }
      write(from);
      const proxy = { val: from };
      gsap.to(proxy, {
        val: value,
        duration,
        ease: "power2.out",
        onUpdate: () => write(proxy.val),
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 88%",
          once: true,
        },
      });
    },
    { dependencies: [value, from, duration, prefix, suffix, format, reduced], scope: rootRef }
  );

  const deltaPositive = (delta ?? 0) >= 0;

  return (
    <div
      ref={rootRef}
      data-slot="stat-counter"
      className={cn("inline-flex flex-col", className)}
      {...rest}
    >
      <div className="flex items-baseline gap-2">
        <span
          ref={numberRef}
          data-slot="value"
          className="text-4xl font-semibold tracking-tight text-foreground numeric"
        />
        {delta != null ? (
          <span
            data-slot="delta"
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium numeric ring-1 ring-inset"
            style={{
              color: deltaPositive ? "var(--market-up)" : "var(--market-down)",
              background: deltaPositive
                ? "color-mix(in oklab, var(--market-up) 10%, transparent)"
                : "color-mix(in oklab, var(--market-down) 10%, transparent)",
              borderColor: "transparent",
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${deltaPositive ? "var(--market-up)" : "var(--market-down)"} 22%, transparent)`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("size-3", !deltaPositive && "rotate-180")}
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {Math.abs(delta)}%
          </span>
        ) : null}
      </div>
      {label ? (
        <span data-slot="label" className="mt-1 text-sm text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  );
}
