"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface FundProfile {
  name: string;
  category: string;
  returns3y: number;
  returns5y: number;
  /** Share of 3y rolling windows beating the benchmark, %. */
  rollingBeat: number;
  expenseRatio: number;
  exitLoad: string;
  maxDrawdown: number;
  sharpe: number;
  managerTenureYears: number;
  /** Top-10 holdings share, %. */
  top10Weight: number;
}

export interface FundCompareProps
  extends React.HTMLAttributes<HTMLDivElement> {
  funds?: [FundProfile, FundProfile];
  /** Portfolio overlap between the two funds, %. */
  overlapPct?: number;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_FUNDS: [FundProfile, FundProfile] = [
  {
    name: "Nifty Alpha Flexicap",
    category: "Flexi cap · direct growth",
    returns3y: 18.4,
    returns5y: 15.2,
    rollingBeat: 74,
    expenseRatio: 0.62,
    exitLoad: "1% < 1y",
    maxDrawdown: -21.3,
    sharpe: 1.12,
    managerTenureYears: 6.5,
    top10Weight: 38,
  },
  {
    name: "Bluechip Advantage",
    category: "Large cap · direct growth",
    returns3y: 14.1,
    returns5y: 13.8,
    rollingBeat: 58,
    expenseRatio: 0.95,
    exitLoad: "Nil",
    maxDrawdown: -16.8,
    sharpe: 0.94,
    managerTenureYears: 2.1,
    top10Weight: 52,
  },
];

interface MetricRow {
  key: string;
  label: string;
  hint: string;
  value: (f: FundProfile) => number;
  format: (v: number) => string;
  /** true if higher is better. */
  higherBetter: boolean;
  /** Normalizer for the bar, returns 0–1. */
  norm: (v: number) => number;
}

const METRICS: MetricRow[] = [
  { key: "r3", label: "3y returns", hint: "annualised", value: (f) => f.returns3y, format: (v) => `${v.toFixed(1)}%`, higherBetter: true, norm: (v) => v / 25 },
  { key: "r5", label: "5y returns", hint: "annualised", value: (f) => f.returns5y, format: (v) => `${v.toFixed(1)}%`, higherBetter: true, norm: (v) => v / 25 },
  { key: "roll", label: "Rolling consistency", hint: "3y windows beating benchmark", value: (f) => f.rollingBeat, format: (v) => `${v.toFixed(0)}%`, higherBetter: true, norm: (v) => v / 100 },
  { key: "er", label: "Expense ratio", hint: "lower is better", value: (f) => f.expenseRatio, format: (v) => `${v.toFixed(2)}%`, higherBetter: false, norm: (v) => v / 1.5 },
  { key: "dd", label: "Max drawdown", hint: "worst peak-to-trough", value: (f) => Math.abs(f.maxDrawdown), format: (v) => `−${v.toFixed(1)}%`, higherBetter: false, norm: (v) => v / 30 },
  { key: "sharpe", label: "Sharpe", hint: "risk-adjusted return", value: (f) => f.sharpe, format: (v) => v.toFixed(2), higherBetter: true, norm: (v) => v / 1.5 },
  { key: "tenure", label: "Manager tenure", hint: "current manager", value: (f) => f.managerTenureYears, format: (v) => `${v.toFixed(1)}y`, higherBetter: true, norm: (v) => v / 10 },
  { key: "conc", label: "Top-10 weight", hint: "concentration, lower is better", value: (f) => f.top10Weight, format: (v) => `${v.toFixed(0)}%`, higherBetter: false, norm: (v) => v / 60 },
];

/* ------------------------------------------------------------------ */
/* Compare                                                              */
/* ------------------------------------------------------------------ */

/**
 * Two funds, honestly compared: mirrored metric bars grow from the
 * centre, the better side is marked per metric, and portfolio overlap
 * tells you whether holding both diversifies anything at all.
 */
export function FundCompare({
  funds = DEMO_FUNDS,
  overlapPct = 41,
  className,
  ref,
  ...rest
}: FundCompareProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const [a, b] = funds;

  const winsA = METRICS.filter((m) => {
    const va = m.value(a);
    const vb = m.value(b);
    return m.higherBetter ? va > vb : va < vb;
  }).length;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const bars = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-bar]"));
      if (reduced) {
        for (const bar of bars) gsap.set(bar, { width: `${Number(bar.dataset.bar) * 100}%` });
        return;
      }
      for (const bar of bars) {
        gsap.fromTo(
          bar,
          { width: 0 },
          {
            width: `${Math.min(1, Number(bar.dataset.bar)) * 100}%`,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.05,
          }
        );
      }
    },
    { scope: rootRef }
  );

  const winDot = (mine: number, theirs: number, higherBetter: boolean) => {
    const win = higherBetter ? mine > theirs : mine < theirs;
    return win ? (
      <span aria-label="better" className="text-success">●</span>
    ) : null;
  };

  return (
    <div
      ref={rootRef}
      data-slot="fund-compare"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
      {...rest}
    >
      {/* Fund headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <div>
          <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-foreground">
            <span className="size-1.5 rounded-full bg-primary" />A
          </span>
          <p className="text-sm font-semibold leading-5 text-foreground">{a.name}</p>
          <p className="text-[10px] text-muted-foreground">{a.category}</p>
        </div>
        <span className="pt-1 text-[10px] font-medium uppercase text-muted-foreground">vs</span>
        <div className="text-right">
          <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-info/10 px-1.5 py-0.5 text-[9px] font-medium text-foreground">
            B<span className="size-1.5 rounded-full bg-info" />
          </span>
          <p className="text-sm font-semibold leading-5 text-foreground">{b.name}</p>
          <p className="text-[10px] text-muted-foreground">{b.category}</p>
        </div>
      </div>

      {/* Metric rows: mirrored bars from the centre */}
      <div className="mt-4 flex flex-col gap-2.5">
        {METRICS.map((m) => {
          const va = m.value(a);
          const vb = m.value(b);
          return (
            <div key={m.key}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 text-xs tabular-nums">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  {winDot(va, vb, m.higherBetter)}
                  {m.format(m.key === "dd" ? va : va)}
                </span>
                <span className="text-center text-[10px] text-muted-foreground">
                  {m.label}
                  <span className="hidden sm:inline"> · {m.hint}</span>
                </span>
                <span className="flex items-center justify-end gap-1.5 font-medium text-foreground">
                  {m.format(vb)}
                  {winDot(vb, va, m.higherBetter)}
                </span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1" aria-hidden="true">
                <div className="flex justify-end overflow-hidden rounded-l-full bg-muted/70 ring-1 ring-inset ring-border/40">
                  <span
                    data-bar={Math.min(1, m.norm(va))}
                    className="block h-1.5 rounded-l-full"
                    style={{
                      width: 0,
                      background: "linear-gradient(270deg, var(--primary), color-mix(in oklab, var(--primary) 45%, transparent))",
                    }}
                  />
                </div>
                <div className="flex overflow-hidden rounded-r-full bg-muted/70 ring-1 ring-inset ring-border/40">
                  <span
                    data-bar={Math.min(1, m.norm(vb))}
                    className="block h-1.5 rounded-r-full"
                    style={{
                      width: 0,
                      background: "linear-gradient(90deg, var(--info), color-mix(in oklab, var(--info) 45%, transparent))",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exit load + overlap */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background px-3 py-2 text-xs shadow-xs">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Exit load</p>
          <p className="mt-0.5 tabular-nums text-foreground">
            {a.exitLoad} <span className="text-muted-foreground">vs</span> {b.exitLoad}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background px-3 py-2 text-xs shadow-xs">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Portfolio overlap
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
              role="meter"
              aria-label="Portfolio overlap"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={overlapPct}
            >
              <span
                data-bar={overlapPct / 100}
                className="block h-full rounded-full"
                style={{
                  width: 0,
                  background:
                    overlapPct > 50
                      ? "linear-gradient(90deg, color-mix(in oklab, var(--warning) 50%, transparent), var(--warning))"
                      : "linear-gradient(90deg, color-mix(in oklab, var(--primary) 50%, transparent), var(--primary))",
                }}
              />
            </span>
            <span className="font-medium tabular-nums text-foreground">{overlapPct}%</span>
          </div>
          {overlapPct > 50 ? (
            <p className="mt-1 text-[10px] leading-4 text-warning">
              High overlap — holding both adds little diversification.
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">{winsA >= METRICS.length / 2 ? a.name : b.name}</span>{" "}
        leads on {Math.max(winsA, METRICS.length - winsA)} of {METRICS.length} metrics ·
        past returns don&apos;t guarantee future ones · not advice
      </p>
    </div>
  );
}
