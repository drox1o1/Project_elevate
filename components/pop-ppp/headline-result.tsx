"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { formatMoney, type MoneyFormat } from "@/lib/pop-ppp/calc";

gsap.registerPlugin(ScrollTrigger);

/**
 * The reveal (PRD §B).
 *
 * Result first, methodology second — the page answers the question before it
 * explains itself. The present value counts up exactly once and only in the
 * direction the number moved; nothing else on the block animates its digits,
 * because a screen of rolling numbers reads as a slot machine rather than as
 * economic data.
 */

function CountUp({
  value,
  format,
  className,
}: {
  value: number;
  format: MoneyFormat;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const write = React.useCallback(
    (n: number) => formatMoney(format, n),
    [format]
  );

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      if (reduced) {
        node.textContent = write(value);
        return;
      }
      const proxy = { v: 0 };
      node.textContent = write(0);
      gsap.to(proxy, {
        v: value,
        duration: 1.1,
        ease: "power2.out",
        onUpdate: () => {
          node.textContent = write(proxy.v);
        },
        scrollTrigger: { trigger: node, start: "top 90%", once: true },
      });
    },
    { dependencies: [value, write, reduced] }
  );

  return (
    <span className={className}>
      {/* Server-rendered text so the figure exists before hydration. */}
      <span ref={ref}>{write(value)}</span>
    </span>
  );
}

export interface Metric {
  label: string;
  value: string;
  note?: string;
  /** Renders in the estimate treatment. */
  provisional?: boolean;
}

export interface HeadlineResultProps {
  /** e.g. "50 tolas = 583.19 grams of gold" */
  reveal: string;
  baseLabel: string;
  baseValue: string;
  currentLabel: string;
  /** Raw number for the single count-up. */
  currentValue: number;
  /** Serialisable formatting rule — functions cannot cross to a client component. */
  format: MoneyFormat;
  remark: string;
  metrics: Metric[];
  className?: string;
}

export function HeadlineResult({
  reveal,
  baseLabel,
  baseValue,
  currentLabel,
  currentValue,
  format,
  remark,
  metrics,
  className,
}: HeadlineResultProps) {
  return (
    <div className={cn("w-full", className)}>
      <p className="text-balance font-mono text-lg text-foreground numeric sm:text-xl">
        {reveal}
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="type-overline text-muted-foreground">{baseLabel}</p>
          <p className="mt-1.5 type-metric text-muted-foreground numeric">
            {baseValue}
          </p>
        </div>
        <div>
          <p className="type-overline text-muted-foreground">{currentLabel}</p>
          <CountUp
            value={currentValue}
            format={format}
            className="mt-1.5 block type-display text-foreground numeric"
          />
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-balance type-body italic leading-6 text-muted-foreground">
        {remark}
      </p>

      <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card p-4">
            <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
              {m.label}
            </dt>
            <dd
              className={cn(
                "mt-1 type-title numeric",
                m.provisional ? "text-warning" : "text-foreground"
              )}
            >
              {m.value}
            </dd>
            {m.note ? (
              <p className="mt-1 type-caption leading-5 text-muted-foreground">
                {m.note}
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </div>
  );
}
