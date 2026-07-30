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
  accent: { light: string; dark: string };
  /** Stable scope for the dark-mode accent override — the index slug. */
  scopeId: string;
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
  accent,
  scopeId,
  className,
}: HeadlineResultProps) {
  return (
    <div
      data-pop-headline={scopeId}
      className={cn("w-full", className)}
      style={{ "--pop-accent": accent.light } as React.CSSProperties}
    >
      <style>{`.dark [data-pop-headline="${scopeId}"]{--pop-accent:${accent.dark}}`}</style>

      <p className="max-w-3xl text-balance font-mono text-base text-muted-foreground numeric sm:text-lg">
        {reveal}
      </p>

      <div className="mt-10 flex flex-wrap items-end gap-x-14 gap-y-8">
        <div>
          <p className="font-mono type-caption uppercase tracking-[0.12em] text-muted-foreground">
            {baseLabel}
          </p>
          <p className="mt-2 font-mono text-2xl text-muted-foreground numeric sm:text-3xl">
            {baseValue}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="mb-3 hidden font-mono text-2xl text-border sm:block"
        >
          →
        </span>
        <div>
          <p className="font-mono type-caption uppercase tracking-[0.12em] text-muted-foreground">
            {currentLabel}
          </p>
          <CountUp
            value={currentValue}
            format={format}
            className="mt-2 block font-mono text-[2.75rem] font-semibold leading-none tracking-[-0.03em] text-[var(--pop-accent)] numeric sm:text-6xl"
          />
        </div>
      </div>

      <p className="mt-8 max-w-2xl text-balance text-[0.9375rem] italic leading-7 text-muted-foreground">
        {remark}
      </p>

      {/* Padded to a full row: a gap-px grid shows its own background through
          any empty cell, which reads as a broken card rather than as space. */}
      <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card p-5">
            <dt className="font-mono type-caption uppercase tracking-[0.08em] text-muted-foreground">
              {m.label}
            </dt>
            <dd
              className={cn(
                "mt-2 font-mono text-lg numeric",
                m.provisional ? "text-warning" : "text-foreground"
              )}
            >
              {m.value}
            </dd>
            {m.note ? (
              <p className="mt-1.5 type-caption leading-5 text-muted-foreground">
                {m.note}
              </p>
            ) : null}
          </div>
        ))}
        {Array.from({
          length: (3 - (metrics.length % 3)) % 3,
        }).map((_, i) => (
          <div key={`pad-${i}`} aria-hidden="true" className="hidden bg-card lg:block" />
        ))}
        {metrics.length % 2 === 1 ? (
          <div aria-hidden="true" className="hidden bg-card sm:block lg:hidden" />
        ) : null}
      </dl>
    </div>
  );
}
