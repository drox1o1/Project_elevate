"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { blackScholes, smileIv } from "@/registry/default/lib/black-scholes";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface StrategyLeg {
  side: "buy" | "sell";
  type: "call" | "put";
  strike: number;
  premium: number;
  delta: number;
  theta: number;
  vega: number;
}

export type StrategyKey =
  | "long-call"
  | "bull-call-spread"
  | "straddle"
  | "strangle"
  | "iron-condor";

export const STRATEGIES: Record<StrategyKey, { label: string; legs: (atm: number, step: number) => { side: "buy" | "sell"; type: "call" | "put"; strike: number }[] }> = {
  "long-call": {
    label: "Long Call",
    legs: (atm) => [{ side: "buy", type: "call", strike: atm }],
  },
  "bull-call-spread": {
    label: "Bull Call Spread",
    legs: (atm, step) => [
      { side: "buy", type: "call", strike: atm },
      { side: "sell", type: "call", strike: atm + 2 * step },
    ],
  },
  straddle: {
    label: "Straddle",
    legs: (atm) => [
      { side: "buy", type: "call", strike: atm },
      { side: "buy", type: "put", strike: atm },
    ],
  },
  strangle: {
    label: "Strangle",
    legs: (atm, step) => [
      { side: "buy", type: "call", strike: atm + 2 * step },
      { side: "buy", type: "put", strike: atm - 2 * step },
    ],
  },
  "iron-condor": {
    label: "Iron Condor",
    legs: (atm, step) => [
      { side: "sell", type: "put", strike: atm - 2 * step },
      { side: "buy", type: "put", strike: atm - 4 * step },
      { side: "sell", type: "call", strike: atm + 2 * step },
      { side: "buy", type: "call", strike: atm + 4 * step },
    ],
  },
};

export interface StrategyBuilderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  spot: number;
  /** Days to expiry used to price the legs. Default 7. */
  dte?: number;
  /** Strike interval. Default 100. */
  step?: number;
  lotSize?: number;
  defaultStrategy?: StrategyKey;
  ref?: React.Ref<HTMLDivElement>;
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

/* ------------------------------------------------------------------ */
/* Builder                                                              */
/* ------------------------------------------------------------------ */

const W = 480;
const H = 190;
const PAD = { l: 10, r: 10, t: 14, b: 20 };

/**
 * Options strategy builder: pick a structure and the payoff curve morphs
 * to it — profit region in market-up, loss in market-down, breakevens
 * marked, leg Greeks totalled, and an expiry-spot scrubber that rolls the
 * P&L as you drag.
 */
export function StrategyBuilder({
  spot,
  dte = 7,
  step = 100,
  lotSize = 75,
  defaultStrategy = "bull-call-spread",
  className,
  ref,
  ...rest
}: StrategyBuilderProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const lineRef = React.useRef<SVGPathElement>(null);
  const areaRef = React.useRef<SVGPathElement>(null);
  const areaLossRef = React.useRef<SVGPathElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [strategy, setStrategy] = React.useState<StrategyKey>(defaultStrategy);
  const atm = Math.round(spot / step) * step;
  const [expirySpot, setExpirySpot] = React.useState(atm);

  /* Price the legs coherently. */
  const legs: StrategyLeg[] = React.useMemo(
    () =>
      STRATEGIES[strategy].legs(atm, step).map((l) => {
        const iv = smileIv(spot, l.strike);
        const g = blackScholes({ s: spot, k: l.strike, t: dte / 365, iv, side: l.type });
        const sign = l.side === "buy" ? 1 : -1;
        return {
          ...l,
          premium: g.price,
          delta: sign * g.delta,
          theta: sign * g.theta,
          vega: sign * g.vega,
        };
      }),
    [strategy, atm, step, spot, dte]
  );

  const payoffAt = React.useCallback(
    (s: number) =>
      legs.reduce((sum, l) => {
        const intrinsic = l.type === "call" ? Math.max(0, s - l.strike) : Math.max(0, l.strike - s);
        const sign = l.side === "buy" ? 1 : -1;
        return sum + sign * (intrinsic - l.premium);
      }, 0) * lotSize,
    [legs, lotSize]
  );

  /* Sample the payoff across ±10%. */
  const sMin = spot * 0.9;
  const sMax = spot * 1.1;
  const N = 80;
  const samples = React.useMemo(
    () =>
      Array.from({ length: N + 1 }, (_, i) => {
        const s = sMin + ((sMax - sMin) * i) / N;
        return { s, p: payoffAt(s) };
      }),
    [payoffAt, sMin, sMax]
  );
  const pMax = Math.max(...samples.map((d) => Math.abs(d.p)), 1);
  const x = (s: number) => PAD.l + ((s - sMin) / (sMax - sMin)) * (W - PAD.l - PAD.r);
  const y = (p: number) => H / 2 - (p / pMax) * (H / 2 - PAD.t);
  const zeroY = y(0);

  const linePath = samples
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(d.s).toFixed(1)},${y(d.p).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${x(sMax).toFixed(1)},${zeroY} L${x(sMin).toFixed(1)},${zeroY} Z`;

  /* Breakevens: zero crossings. */
  const breakevens: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    if ((a.p <= 0 && b.p > 0) || (a.p >= 0 && b.p < 0)) {
      breakevens.push(a.s + ((0 - a.p) / (b.p - a.p)) * (b.s - a.s));
    }
  }

  const maxProfitRaw = Math.max(...samples.map((d) => d.p));
  const maxLossRaw = Math.min(...samples.map((d) => d.p));
  const edgeUp = samples[samples.length - 1].p >= maxProfitRaw - 1;
  const edgeDown = samples[0].p <= maxLossRaw + 1 && strategy !== "iron-condor";
  const netPremium = legs.reduce(
    (s, l) => s + (l.side === "buy" ? -1 : 1) * l.premium * lotSize,
    0
  );
  const totals = legs.reduce(
    (t, l) => ({ delta: t.delta + l.delta, theta: t.theta + l.theta, vega: t.vega + l.vega }),
    { delta: 0, theta: 0, vega: 0 }
  );

  /* The curve morphs between strategies. */
  useGSAP(
    () => {
      const items: [SVGPathElement | null, string][] = [
        [lineRef.current, linePath],
        [areaRef.current, areaPath],
        [areaLossRef.current, areaPath],
      ];
      for (const [el, d] of items) {
        if (!el) continue;
        if (reduced) el.setAttribute("d", d);
        else gsap.to(el, { attr: { d }, duration: 0.55, ease: "power3.inOut", overwrite: true });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    { dependencies: [linePath, reduced] }
  );

  const pnlAtScrub = payoffAt(expirySpot);

  return (
    <div
      ref={rootRef}
      data-slot="strategy-builder"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      {/* Strategy picker */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Strategy">
        {(Object.keys(STRATEGIES) as StrategyKey[]).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={strategy === k}
            onClick={() => setStrategy(k)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200",
              strategy === k
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {STRATEGIES[k].label}
          </button>
        ))}
      </div>

      {/* Payoff chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`${STRATEGIES[strategy].label} payoff at expiry. Max profit ${edgeUp ? "unlimited" : `₹${inr(maxProfitRaw)}`}, max loss ${edgeDown ? "unlimited" : `₹${inr(Math.abs(maxLossRaw))}`}.`}
      >
        <defs>
          <clipPath id="duku-profit-clip">
            <rect x={0} y={0} width={W} height={zeroY} />
          </clipPath>
          <clipPath id="duku-loss-clip">
            <rect x={0} y={zeroY} width={W} height={H - zeroY} />
          </clipPath>
        </defs>
        <path ref={areaRef} d={areaPath} clipPath="url(#duku-profit-clip)" className="fill-market-up/15" />
        <path ref={areaLossRef} d={areaPath} clipPath="url(#duku-loss-clip)" className="fill-market-down/15" />
        <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} className="stroke-border" />
        {/* spot + scrub markers */}
        <line x1={x(spot)} x2={x(spot)} y1={PAD.t} y2={H - PAD.b} strokeDasharray="3 3" className="stroke-muted-foreground/50" />
        <text x={x(spot)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[9px]">spot</text>
        <line x1={x(expirySpot)} x2={x(expirySpot)} y1={PAD.t} y2={H - PAD.b} className="stroke-info" />
        <circle cx={x(expirySpot)} cy={y(pnlAtScrub)} r={4} className="fill-info stroke-card" strokeWidth={1.5} />
        {breakevens.map((b) => (
          <g key={b}>
            <line x1={x(b)} x2={x(b)} y1={zeroY - 6} y2={zeroY + 6} className="stroke-foreground" strokeWidth={1.5} />
            <text x={x(b)} y={zeroY - 9} textAnchor="middle" className="fill-foreground text-[9px] font-medium tabular-nums">
              {inr(Math.round(b))}
            </text>
          </g>
        ))}
        <path ref={lineRef} d={linePath} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-primary" />
      </svg>

      {/* Expiry scrubber */}
      <label className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
        Expiry spot
        <input
          type="range"
          min={Math.ceil(sMin / 10) * 10}
          max={Math.floor(sMax / 10) * 10}
          step={10}
          value={expirySpot}
          aria-label="Expiry spot"
          onChange={(e) => setExpirySpot(parseInt(e.target.value, 10))}
          className="flex-1 accent-primary"
        />
        <span
          className={cn(
            "w-24 text-right font-semibold tabular-nums",
            pnlAtScrub >= 0 ? "text-market-up" : "text-market-down"
          )}
        >
          <NumberFlow
            value={Math.round(pnlAtScrub)}
            prefix={pnlAtScrub >= 0 ? "+₹" : "−₹"}
            locale="en-IN"
            trend
          />
        </span>
      </label>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {[
          ["Max profit", edgeUp ? "Unlimited" : `₹${inr(maxProfitRaw)}`, "text-market-up"],
          ["Max loss", edgeDown ? "Unlimited" : `₹${inr(Math.abs(maxLossRaw))}`, "text-market-down"],
          ["Net premium", `${netPremium >= 0 ? "+" : "−"}₹${inr(Math.abs(netPremium))}`, netPremium >= 0 ? "text-market-up" : "text-foreground"],
          ["Breakevens", breakevens.length ? breakevens.map((b) => inr(Math.round(b))).join(" / ") : "—", "text-foreground"],
        ].map(([label, value, cls]) => (
          <div key={label as string} className="rounded-lg border border-border bg-background px-2.5 py-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className={cn("font-semibold tabular-nums", cls as string)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Legs */}
      <ul className="mt-3 flex flex-col gap-1.5">
        {legs.map((l, i) => (
          <li
            key={`${l.side}-${l.type}-${l.strike}-${i}`}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  l.side === "buy" ? "bg-market-up/15 text-market-up" : "bg-market-down/15 text-market-down"
                )}
              >
                {l.side}
              </span>
              <span className="font-medium text-foreground">
                {inr(l.strike)} {l.type.toUpperCase()}
              </span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              ₹{l.premium.toFixed(2)} · Δ {l.delta.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] tabular-nums text-muted-foreground">
        <span>
          Net Δ {totals.delta.toFixed(2)} · Θ ₹{(totals.theta * lotSize).toFixed(0)}/day · V ₹
          {(totals.vega * lotSize).toFixed(0)}/1% IV
        </span>
        <span>1 lot = {lotSize} · payoff at expiry · not advice</span>
      </p>
    </div>
  );
}
