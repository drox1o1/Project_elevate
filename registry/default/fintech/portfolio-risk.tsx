"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

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

// Categorical allocation palette, tuned to read in both themes.
const SECTOR_HUES = [
  "217 91% 60%", // indigo
  "258 90% 66%", // violet
  "173 80% 40%", // teal
  "38 92% 50%", // amber
  "330 81% 60%", // rose
  "199 89% 48%", // cyan
];

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
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [shock, setShock] = React.useState(0); // NIFTY move in %, negative = down
  const [active, setActive] = React.useState<string | null>(null);

  const total = holdings.reduce((s, h) => s + h.value, 0);
  const beta = holdings.reduce((s, h) => s + h.beta * h.value, 0) / total;
  const dayPnl = holdings.reduce((s, h) => s + (h.dayChangePct / 100) * h.value, 0);
  const dayPnlPct = (dayPnl / total) * 100;
  // 1-day 95% parametric VaR with ~1% daily index vol scaled by beta
  const var95 = total * beta * 0.01 * 1.65;

  const sectors = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const h of holdings) map.set(h.sector, (map.get(h.sector) ?? 0) + h.value);
    return [...map.entries()]
      .map(([sector, value]) => ({ sector, value, share: value / total }))
      .sort((a, b) => b.value - a.value)
      .map((s, i) => ({ ...s, hue: SECTOR_HUES[i % SECTOR_HUES.length] }));
  }, [holdings, total]);

  // Cumulative offsets so segments lay out along one bar.
  const laidOut = React.useMemo(() => {
    let acc = 0;
    return sectors.map((s) => {
      const left = acc;
      acc += s.share;
      return { ...s, left };
    });
  }, [sectors]);

  const topConcentration = sectors[0];
  const concentrated = topConcentration.share > concentrationLimit;
  const shockImpact = total * beta * (shock / 100);

  // Stress slider geometry: 0% sits where "no move" falls in the range.
  const SHOCK_MIN = -10;
  const SHOCK_MAX = 5;
  const posOf = (v: number) => ((v - SHOCK_MIN) / (SHOCK_MAX - SHOCK_MIN)) * 100;
  const zeroPos = posOf(0);
  const thumbPos = posOf(shock);
  const fillLeft = Math.min(zeroPos, thumbPos);
  const fillWidth = Math.abs(thumbPos - zeroPos);
  const stressDown = shock < 0;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const segs = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-seg]"));
      const legend = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-legend]"));
      if (reduced) {
        gsap.set(segs, { scaleX: 1, opacity: 1 });
        gsap.set(legend, { y: 0, opacity: 1 });
        return;
      }
      gsap.set(segs, { transformOrigin: "left center" });
      gsap
        .timeline()
        .fromTo(
          segs,
          { scaleX: 0, opacity: 0.4 },
          { scaleX: 1, opacity: 1, duration: 0.75, ease: "expo.out", stagger: 0.07 }
        )
        .fromTo(
          legend,
          { y: 6, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.04 },
          0.35
        );
    },
    { dependencies: [reduced, holdings], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="portfolio-risk"
      className={cn(
        "group/card relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-md",
        className
      )}
      {...rest}
    >
      {/* Ambient top sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-[radial-gradient(60%_100%_at_50%_100%,hsl(var(--elevation-hue)/0.05),transparent)] dark:bg-[radial-gradient(60%_100%_at_50%_100%,hsl(0_0%_100%/0.04),transparent)]"
      />

      {/* ---- Hero: value + day P&L ---------------------------------- */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Portfolio value
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <span className="text-4xl font-semibold leading-none tracking-tight text-foreground tabular-nums">
              <NumberFlow value={total} prefix="₹" locale="en-IN" />
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium tabular-nums ring-1 ring-inset",
                dayPnl >= 0
                  ? "bg-market-up/10 text-market-up ring-market-up/20"
                  : "bg-market-down/10 text-market-down ring-market-down/20"
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("size-3", dayPnl < 0 && "rotate-180")}
                aria-hidden="true"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {dayPnl >= 0 ? "+₹" : "−₹"}
              {inr(Math.abs(Math.round(dayPnl)))}
              <span className="opacity-60">· {Math.abs(dayPnlPct).toFixed(2)}%</span>
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {holdings.length} holdings · updated just now
          </p>
        </div>

        {/* Risk chips */}
        <div className="flex items-stretch gap-5 rounded-2xl border border-border/60 bg-background/60 px-4 py-2.5 backdrop-blur-sm">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Beta
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              <NumberFlow value={beta} decimals={2} />
            </p>
            <p className="text-[10px] text-muted-foreground">vs NIFTY 50</p>
          </div>
          <div className="w-px bg-border/60" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              VaR 95% · 1d
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-risk-high">
              ₹<NumberFlow value={Math.round(var95)} locale="en-IN" />
            </p>
            <p className="text-[10px] text-muted-foreground">
              {((var95 / total) * 100).toFixed(1)}% of value
            </p>
          </div>
        </div>
      </div>

      {/* ---- Allocation: one segmented bar + interactive legend ------ */}
      <div className="relative mt-7">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-foreground">Allocation</h3>
          {concentrated ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warning">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning/60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-warning" />
              </span>
              Concentrated
            </span>
          ) : null}
        </div>

        {/* Segmented bar */}
        <div
          className="relative mt-3 h-3.5 w-full"
          role="img"
          aria-label={`Sector allocation: ${sectors
            .map((s) => `${s.sector} ${(s.share * 100).toFixed(0)}%`)
            .join(", ")}`}
        >
          {laidOut.map((s) => {
            const isActive = active === s.sector;
            const dim = active != null && !isActive;
            return (
              <div
                key={s.sector}
                data-seg
                onMouseEnter={() => setActive(s.sector)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "absolute top-0 h-full cursor-default rounded-full transition-[opacity,transform,box-shadow] duration-300",
                  dim ? "opacity-40" : "opacity-100",
                  isActive && "shadow-[0_0_0_1px_var(--card),0_4px_12px_-2px_var(--seg-shadow)]"
                )}
                style={
                  {
                    left: `calc(${s.left * 100}% + ${s.left > 0 ? 3 : 0}px)`,
                    width: `calc(${s.share * 100}% - 3px)`,
                    background: `linear-gradient(180deg, hsl(${s.hue} / 0.92), hsl(${s.hue}))`,
                    transform: isActive ? "scaleY(1.25)" : "scaleY(1)",
                    "--seg-shadow": `hsl(${s.hue} / 0.5)`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>

        {/* Legend */}
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
          {laidOut.map((s) => {
            const isActive = active === s.sector;
            const dim = active != null && !isActive;
            const over = s.share > concentrationLimit;
            return (
              <li
                key={s.sector}
                data-legend
                onMouseEnter={() => setActive(s.sector)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "flex cursor-default items-center gap-2 transition-opacity duration-200",
                  dim && "opacity-45"
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-[4px] transition-transform duration-200"
                  style={{
                    background: `hsl(${s.hue})`,
                    transform: isActive ? "scale(1.25)" : "scale(1)",
                  }}
                />
                <span className="text-xs font-medium text-foreground">{s.sector}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    over ? "font-semibold text-warning" : "text-muted-foreground"
                  )}
                >
                  {(s.share * 100).toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>

        {concentrated ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-warning/25 bg-warning/[0.06] px-3.5 py-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-px size-4 shrink-0 text-warning"
              aria-hidden="true"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <p className="text-[13px] leading-5 text-foreground">
              <span className="font-semibold">{topConcentration.sector}</span> is{" "}
              {(topConcentration.share * 100).toFixed(0)}% of the portfolio, above your{" "}
              {(concentrationLimit * 100).toFixed(0)}% limit. Trimming it lowers single-sector risk.
            </p>
          </div>
        ) : null}
      </div>

      {/* ---- Stress test: custom slider ----------------------------- */}
      <div className="relative mt-7 rounded-2xl border border-border/60 bg-background/50 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Stress test</h3>
            <span className="text-[11px] text-muted-foreground">β-scaled impact</span>
          </div>
          <span
            className={cn(
              "rounded-lg px-2 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset transition-colors duration-300",
              shock === 0
                ? "bg-muted/60 text-muted-foreground ring-border/60"
                : stressDown
                  ? "bg-market-down/10 text-market-down ring-market-down/20"
                  : "bg-market-up/10 text-market-up ring-market-up/20"
            )}
          >
            NIFTY {shock >= 0 ? "+" : ""}
            {shock.toFixed(1)}%
          </span>
        </div>

        {/* Slider */}
        <div className="relative mt-4 h-6">
          <style>{`
            #stress-${uid}::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px; cursor: grab; }
            #stress-${uid}:active::-webkit-slider-thumb { cursor: grabbing; }
            #stress-${uid}::-moz-range-thumb { width: 28px; height: 28px; border: 0; background: transparent; cursor: grab; }
          `}</style>
          {/* track */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted ring-1 ring-inset ring-border/50" />
          {/* fill */}
          <div
            className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full transition-[background] duration-300"
            style={{
              left: `${fillLeft}%`,
              width: `${fillWidth}%`,
              background: stressDown
                ? "linear-gradient(270deg, color-mix(in oklab, var(--market-down) 55%, transparent), var(--market-down))"
                : "linear-gradient(90deg, color-mix(in oklab, var(--market-up) 55%, transparent), var(--market-up))",
            }}
          />
          {/* zero tick */}
          <div
            className="pointer-events-none absolute top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-border"
            style={{ left: `${zeroPos}%` }}
          />
          {/* native input (a11y + keyboard + pointer), transparent on top */}
          <input
            id={`stress-${uid}`}
            type="range"
            min={SHOCK_MIN}
            max={SHOCK_MAX}
            step={0.5}
            value={shock}
            aria-label="Index shock scenario in percent"
            onChange={(e) => setShock(parseFloat(e.target.value))}
            className="peer absolute inset-0 z-20 w-full cursor-pointer appearance-none bg-transparent opacity-0"
          />
          {/* thumb */}
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 z-10 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background shadow-md transition-[border-color,box-shadow] duration-300",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              shock === 0
                ? "border-muted-foreground/60"
                : stressDown
                  ? "border-market-down"
                  : "border-market-up"
            )}
            style={{ left: `${thumbPos}%` }}
          />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <span className="text-[11px] text-muted-foreground">
            Estimated portfolio impact
          </span>
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums transition-colors duration-300",
              shock === 0
                ? "text-muted-foreground"
                : shockImpact >= 0
                  ? "text-market-up"
                  : "text-market-down"
            )}
          >
            <NumberFlow
              value={Math.abs(Math.round(shockImpact))}
              prefix={shock === 0 ? "₹" : shockImpact >= 0 ? "+₹" : "−₹"}
              locale="en-IN"
            />
          </span>
        </div>

        {shock <= -5 ? (
          <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-[11px] leading-4 text-foreground">
            <span className="font-semibold">Hedge idea:</span> a NIFTY put ~5% below spot
            (β-weighted ₹{inr(Math.round(total * beta))} exposure) caps this scenario near ₹
            {inr(Math.round(Math.abs(shockImpact) * 0.4))}. Educational, not advice.
          </p>
        ) : null}
      </div>
    </div>
  );
}
