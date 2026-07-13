"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { blackScholes, smileIv } from "@/registry/default/lib/black-scholes";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

export interface GreeksPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side: "call" | "put";
  strike: number;
  spot: number;
  /** Days to expiry. */
  dte: number;
  /** Implied volatility as a fraction. Defaults to a smile around ATM. */
  iv?: number;
  /** Contract lot size used for the per-lot theta line. Default 75. */
  lotSize?: number;
  ref?: React.Ref<HTMLDivElement>;
}

interface GreekRow {
  key: "delta" | "gamma" | "theta" | "vega";
  label: string;
  symbol: string;
  value: number;
  decimals: number;
  /** 0–1 magnitude for the gauge. */
  norm: number;
  negative: boolean;
  description: string;
}

/**
 * Live Greeks for one option: premium and Δ Γ Θ V computed with
 * Black-Scholes so every number agrees. Values roll with NumberFlow and
 * each gauge springs to its new magnitude when inputs change.
 */
export function GreeksPanel({
  side,
  strike,
  spot,
  dte,
  iv,
  lotSize = 75,
  className,
  ref,
  ...rest
}: GreeksPanelProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const vol = iv ?? smileIv(spot, strike);
  const g = blackScholes({ s: spot, k: strike, t: dte / 365, iv: vol, side });
  const moneyness =
    (side === "call" ? spot - strike : strike - spot) > 0 ? "ITM" : "OTM";

  const rows: GreekRow[] = [
    {
      key: "delta",
      label: "Delta",
      symbol: "Δ",
      value: g.delta,
      decimals: 2,
      norm: Math.min(1, Math.abs(g.delta)),
      negative: g.delta < 0,
      description: "Premium change per ₹1 move in the underlying.",
    },
    {
      key: "gamma",
      label: "Gamma",
      symbol: "Γ",
      value: g.gamma,
      decimals: 4,
      norm: Math.min(1, g.gamma * 400),
      negative: false,
      description: "How fast delta itself moves — peaks at the money.",
    },
    {
      key: "theta",
      label: "Theta",
      symbol: "Θ",
      value: g.theta,
      decimals: 2,
      norm: Math.min(1, Math.abs(g.theta) / Math.max(1, g.price * 0.25)),
      negative: g.theta < 0,
      description: "Time decay per calendar day, all else equal.",
    },
    {
      key: "vega",
      label: "Vega",
      symbol: "V",
      value: g.vega,
      decimals: 2,
      norm: Math.min(1, g.vega / Math.max(1, spot * 0.002)),
      negative: false,
      description: "Premium change per 1 percentage-point move in IV.",
    },
  ];

  // Gauges spring to their new magnitude whenever inputs change.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const bars = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-gauge]")
      );
      for (const bar of bars) {
        const target = Number(bar.dataset.gauge ?? 0) * 100;
        if (reduced) gsap.set(bar, { width: `${target}%` });
        else
          gsap.to(bar, {
            width: `${target}%`,
            duration: 0.6,
            ease: "power3.out",
            overwrite: true,
          });
      }
    },
    { dependencies: [spot, strike, dte, vol, side, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="greeks-panel"
      className={cn(
        "w-full max-w-md rounded-xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase",
              side === "call" ? "bg-bid/15 text-bid" : "bg-ask/15 text-ask"
            )}
          >
            {side}
          </span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {new Intl.NumberFormat("en-IN").format(strike)}
          </span>
          <span className="text-xs text-muted-foreground">
            {moneyness} · {dte}d · IV {(vol * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          <NumberFlow value={g.price} prefix="₹" decimals={2} locale="en-IN" trend />
        </span>
        <span className="text-xs text-muted-foreground">premium</span>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-foreground">
                <span className="mr-1.5 inline-block w-3 text-center font-semibold text-muted-foreground">
                  {row.symbol}
                </span>
                {row.label}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  row.negative ? "text-market-down" : "text-foreground"
                )}
              >
                <NumberFlow value={row.value} decimals={row.decimals} trend />
              </span>
            </div>
            <div
              className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="meter"
              aria-label={`${row.label} magnitude`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(row.norm * 100)}
            >
              <span
                data-gauge={row.norm}
                className={cn(
                  "block h-full rounded-full",
                  row.negative ? "bg-market-down" : "bg-primary"
                )}
                style={{ width: 0 }}
              />
            </div>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              {row.description}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-border pt-2 text-[11px] text-muted-foreground">
        Θ per lot ({lotSize}): ₹{(g.theta * lotSize).toFixed(0)}/day ·
        Black-Scholes, r 6.5%
      </p>
    </div>
  );
}
