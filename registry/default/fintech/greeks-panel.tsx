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
  /** Identity hue (HSL channels). */
  hue: string;
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
      description: "Premium change per ₹1 move.",
      hue: "217 91% 60%",
    },
    {
      key: "gamma",
      label: "Gamma",
      symbol: "Γ",
      value: g.gamma,
      decimals: 4,
      norm: Math.min(1, g.gamma * 400),
      negative: false,
      description: "How fast delta moves; peaks ATM.",
      hue: "258 90% 66%",
    },
    {
      key: "theta",
      label: "Theta",
      symbol: "Θ",
      value: g.theta,
      decimals: 2,
      norm: Math.min(1, Math.abs(g.theta) / Math.max(1, g.price * 0.25)),
      negative: g.theta < 0,
      description: "Time decay per day.",
      hue: "0 84% 60%",
    },
    {
      key: "vega",
      label: "Vega",
      symbol: "V",
      value: g.vega,
      decimals: 2,
      norm: Math.min(1, g.vega / Math.max(1, spot * 0.002)),
      negative: false,
      description: "Premium change per 1% IV.",
      hue: "173 80% 40%",
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
      // Tiles cascade in on first paint.
      const tiles = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-tile]"));
      if (!reduced) {
        gsap.fromTo(
          tiles,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.06, clearProps: "transform,opacity" }
        );
      }
    },
    { dependencies: [spot, strike, dte, vol, side, reduced], scope: rootRef }
  );

  const sideHue = side === "call" ? "217 91% 60%" : "38 92% 50%";

  return (
    <div
      ref={rootRef}
      data-slot="greeks-panel"
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-md",
        className
      )}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full opacity-[0.12] blur-2xl"
        style={{ background: `hsl(${sideHue})` }}
      />

      {/* Header */}
      <div className="relative flex flex-wrap items-center gap-2">
        <span
          className="type-overline rounded-lg px-2 py-0.5 font-semibold ring-1 ring-inset"
          style={{
            color: `hsl(${sideHue})`,
            background: `hsl(${sideHue} / 0.12)`,
            boxShadow: `inset 0 0 0 1px hsl(${sideHue} / 0.2)`,
          }}
        >
          {side}
        </span>
        <span className="text-sm font-semibold numeric text-foreground">
          {new Intl.NumberFormat("en-IN").format(strike)}
        </span>
        <span className="rounded-full bg-muted/70 px-1.5 py-0.5 type-caption font-medium text-muted-foreground">
          {moneyness}
        </span>
        <span className="text-xs text-muted-foreground">
          {dte}d · IV {(vol * 100).toFixed(1)}%
        </span>
      </div>

      {/* Premium hero */}
      <div className="relative mt-3 flex items-baseline gap-2">
        <span className="type-display text-foreground">
          <NumberFlow value={g.price} prefix="₹" decimals={2} locale="en-IN" trend />
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          premium
        </span>
      </div>

      {/* Greek tiles */}
      <ul className="relative mt-5 grid grid-cols-2 gap-3">
        {rows.map((row) => (
          <li
            key={row.key}
            data-tile
            className="group/tile relative overflow-hidden rounded-2xl border border-border/60 bg-background/60 p-3.5 transition-shadow duration-200 hover:shadow-sm"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-1 -top-2 select-none text-5xl font-semibold leading-none opacity-[0.07] transition-opacity duration-300 group-hover/tile:opacity-[0.14]"
              style={{ color: `hsl(${row.hue})` }}
            >
              {row.symbol}
            </span>
            <p className="type-overline text-muted-foreground">
              {row.label}
            </p>
            <p
              className={cn(
                "mt-0.5 text-xl font-semibold numeric",
                row.negative ? "text-market-down" : "text-foreground"
              )}
            >
              <NumberFlow value={row.value} decimals={row.decimals} trend />
            </p>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-inset ring-border/40"
              role="meter"
              aria-label={`${row.label} magnitude`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(row.norm * 100)}
            >
              <span
                data-gauge={row.norm}
                className="block h-full rounded-full"
                style={{
                  width: 0,
                  background: `linear-gradient(90deg, hsl(${row.hue} / 0.5), hsl(${row.hue}))`,
                }}
              />
            </div>
            <p className="mt-2 type-meta leading-4 text-muted-foreground">
              {row.description}
            </p>
          </li>
        ))}
      </ul>

      <p className="relative mt-4 flex items-center justify-between border-t border-border/60 pt-3 type-meta text-muted-foreground">
        <span>
          Θ per lot ({lotSize}):{" "}
          <span className="font-medium numeric text-foreground">
            ₹{(g.theta * lotSize).toFixed(0)}/day
          </span>
        </span>
        <span>Black-Scholes · r 6.5%</span>
      </p>
    </div>
  );
}
