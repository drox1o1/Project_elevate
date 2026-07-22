"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { NumberFlow } from "@/registry/default/fintech/number-flow";
import { Alert } from "@/registry/default/ui/alert";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface Holding {
  symbol: string;
  name: string;
  sector: string;
  value: number;
  /** Stock beta vs the index. */
  beta: number;
  dayChangePct: number;
}

export const DEMO_HOLDINGS: Holding[] = [
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Financials", value: 412000, beta: 1.05, dayChangePct: 0.6 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Financials", value: 268000, beta: 1.12, dayChangePct: -0.3 },
  { symbol: "INFY", name: "Infosys", sector: "IT", value: 236000, beta: 0.85, dayChangePct: 1.2 },
  { symbol: "TCS", name: "TCS", sector: "IT", value: 158000, beta: 0.8, dayChangePct: 0.4 },
  { symbol: "RELIANCE", name: "Reliance", sector: "Energy", value: 301000, beta: 1.1, dayChangePct: -0.8 },
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", value: 92000, beta: 0.6, dayChangePct: 0.9 },
  { symbol: "DMART", name: "Avenue Supermarts", sector: "Consumer", value: 74000, beta: 0.7, dayChangePct: -1.1 },
];

export interface PortfolioRiskProps
  extends React.HTMLAttributes<HTMLDivElement> {
  holdings?: Holding[];
  /** Concentration warning threshold as a fraction of portfolio. Default 0.25. */
  concentrationLimit?: number;
  ref?: React.Ref<HTMLDivElement>;
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

/* ------------------------------------------------------------------ */
/* Cockpit                                                              */
/* ------------------------------------------------------------------ */

export function PortfolioRisk({
  holdings = DEMO_HOLDINGS,
  concentrationLimit = 0.25,
  className,
  ref,
  ...rest
}: PortfolioRiskProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [shock, setShock] = React.useState(0); // NIFTY move in %, negative = down

  const total = holdings.reduce((s, h) => s + h.value, 0);
  const beta = holdings.reduce((s, h) => s + h.beta * h.value, 0) / total;
  const dayPnl = holdings.reduce((s, h) => s + (h.dayChangePct / 100) * h.value, 0);
  // 1-day 95% parametric VaR with ~1% daily index vol scaled by beta
  const var95 = total * beta * 0.01 * 1.65;

  const sectors = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const h of holdings) map.set(h.sector, (map.get(h.sector) ?? 0) + h.value);
    return [...map.entries()]
      .map(([sector, value]) => ({ sector, value, share: value / total }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, total]);

  const topConcentration = sectors[0];
  const concentrated = topConcentration.share > concentrationLimit;
  const shockImpact = total * beta * (shock / 100);

  /* Sector bars fill on scroll-in / data change. */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const bars = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-bar]"));
      for (const bar of bars) {
        const target = Number(bar.dataset.bar ?? 0) * 100;
        if (reduced) gsap.set(bar, { width: `${target}%` });
        else
          gsap.fromTo(
            bar,
            { width: 0 },
            { width: `${target}%`, duration: 0.7, ease: "power3.out", stagger: 0.06 }
          );
      }
    },
    { dependencies: [reduced, holdings], scope: rootRef }
  );

  const tiles: {
    label: string;
    value: React.ReactNode;
    sub?: string;
    accent: string;
  }[] = [
    {
      label: "Portfolio value",
      value: <NumberFlow value={total} prefix="₹" locale="en-IN" />,
      sub: `${holdings.length} holdings`,
      accent: "var(--foreground)",
    },
    {
      label: "Day P&L",
      value: (
        <span className={dayPnl >= 0 ? "text-market-up" : "text-market-down"}>
          <NumberFlow value={Math.round(dayPnl)} prefix={dayPnl >= 0 ? "+₹" : "−₹"} locale="en-IN" />
        </span>
      ),
      sub: `${((dayPnl / total) * 100).toFixed(2)}%`,
      accent: dayPnl >= 0 ? "var(--market-up)" : "var(--market-down)",
    },
    {
      label: "Beta",
      value: <NumberFlow value={beta} decimals={2} />,
      sub: "vs NIFTY 50",
      accent: "var(--info)",
    },
    {
      label: "VaR 95% · 1d",
      value: (
        <span className="text-risk-high">
          <NumberFlow value={Math.round(var95)} prefix="₹" locale="en-IN" />
        </span>
      ),
      sub: `${((var95 / total) * 100).toFixed(1)}% of value`,
      accent: "var(--risk-high)",
    },
  ];

  return (
    <div
      ref={rootRef}
      data-slot="portfolio-risk"
      className={cn(
        "w-full max-w-2xl rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
      {...rest}
    >
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="group/tile relative overflow-hidden rounded-xl border border-border/70 bg-background p-3 shadow-xs transition-shadow duration-200 hover:shadow-sm"
          >
            {/* Left accent rail keyed to the metric's meaning. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-2 left-0 w-0.5 rounded-full opacity-70"
              style={{ background: t.accent }}
            />
            <p className="pl-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {t.label}
            </p>
            <p className="mt-1 pl-1.5 text-lg font-semibold tabular-nums text-foreground">
              {t.value}
            </p>
            {t.sub ? (
              <p className="pl-1.5 text-[11px] tabular-nums text-muted-foreground">{t.sub}</p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Sector exposure */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold text-foreground">Sector exposure</h3>
        <ul className="mt-2.5 flex flex-col gap-2.5">
          {sectors.map((s) => {
            const over = s.share > concentrationLimit;
            return (
              <li key={s.sector} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 truncate text-muted-foreground">
                  {s.sector}
                </span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/70 ring-1 ring-inset ring-border/50">
                  <span
                    data-bar={s.share}
                    className="block h-full rounded-full"
                    style={{
                      width: 0,
                      background: over
                        ? "linear-gradient(90deg, color-mix(in oklab, var(--risk-high) 70%, transparent), var(--risk-high))"
                        : "linear-gradient(90deg, color-mix(in oklab, var(--info) 55%, var(--primary)), var(--info))",
                    }}
                  />
                </span>
                <span
                  className={cn(
                    "w-12 shrink-0 text-right tabular-nums",
                    over ? "font-medium text-risk-high" : "text-foreground"
                  )}
                >
                  {(s.share * 100).toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {concentrated ? (
        <div className="mt-3">
          <Alert variant="warning" title="Concentration risk">
            {topConcentration.sector} is {(topConcentration.share * 100).toFixed(0)}% of the
            portfolio — above your {(concentrationLimit * 100).toFixed(0)}% limit.
          </Alert>
        </div>
      ) : null}

      {/* Scenario testing */}
      <div className="mt-4 rounded-xl border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-foreground">Scenario</h3>
          <span className="text-xs tabular-nums text-muted-foreground">
            NIFTY {shock >= 0 ? "+" : ""}
            {shock.toFixed(1)}%
          </span>
        </div>
        <input
          type="range"
          min={-10}
          max={5}
          step={0.5}
          value={shock}
          aria-label="Index shock scenario in percent"
          onChange={(e) => setShock(parseFloat(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-[11px] text-muted-foreground">
            Estimated portfolio impact (β-scaled)
          </span>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              shockImpact >= 0 ? "text-market-up" : "text-market-down"
            )}
          >
            <NumberFlow
              value={Math.round(shockImpact)}
              prefix={shockImpact >= 0 ? "+₹" : "−₹"}
              locale="en-IN"
              trend
            />
          </span>
        </div>
        {shock <= -5 ? (
          <p className="mt-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-[11px] leading-4 text-foreground">
            <span className="font-semibold">Hedge idea:</span> a NIFTY put ~5% below spot
            (β-weighted {inr(Math.round(total * beta))} exposure) caps this scenario near ₹
            {inr(Math.round(Math.abs(shockImpact) * 0.4))}. Educational, not advice.
          </p>
        ) : null}
      </div>
    </div>
  );
}
