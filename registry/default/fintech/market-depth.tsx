"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface DepthLevel {
  price: number;
  qty: number;
  orders: number;
}

export interface MarketDepthProps
  extends React.HTMLAttributes<HTMLDivElement> {
  symbol: string;
  /** Best-first (descending price) bid levels. */
  bids: DepthLevel[];
  /** Best-first (ascending price) ask levels. */
  asks: DepthLevel[];
  lastPrice: number;
  /** Average traded price marker. */
  atp?: number;
  onLevelSelect?: (side: "bid" | "ask", level: DepthLevel) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const nf = new Intl.NumberFormat("en-IN");
const nf2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Deterministic demo ladder around a mid price. */
export function generateDepth(mid: number, tick = 0.05, levels = 7) {
  const mk = (side: 1 | -1): DepthLevel[] =>
    Array.from({ length: levels }, (_, i) => {
      const seed = Math.sin((mid + side * i) * 7.13) * 10_000;
      const r = seed - Math.floor(seed);
      return {
        price: +(mid + side * tick * (i + 1)).toFixed(2),
        qty: Math.round(300 + r * 4200),
        orders: 1 + Math.round(r * 14),
      };
    });
  return { bids: mk(-1), asks: mk(1) };
}

/* ------------------------------------------------------------------ */
/* Ladder                                                               */
/* ------------------------------------------------------------------ */

function Row({
  side,
  level,
  maxQty,
  best,
  onSelect,
}: {
  side: "bid" | "ask";
  level: DepthLevel;
  maxQty: number;
  best: boolean;
  onSelect?: (side: "bid" | "ask", level: DepthLevel) => void;
}) {
  const barRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const pct = Math.round((level.qty / maxQty) * 100);

  /* Qty bars breathe to their new size on every update. */
  useGSAP(
    () => {
      if (!barRef.current) return;
      if (reduced) {
        gsap.set(barRef.current, { width: `${pct}%` });
        return;
      }
      gsap.to(barRef.current, {
        width: `${pct}%`,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      });
    },
    { dependencies: [pct, reduced] }
  );

  return (
    <button
      type="button"
      onClick={() => onSelect?.(side, level)}
      aria-label={`${side} ${nf2.format(level.price)}, quantity ${nf.format(level.qty)}, ${level.orders} orders`}
      className={cn(
        "relative grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 rounded-md px-2 py-1 text-right font-mono text-[12px] tabular-nums transition-colors duration-150",
        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        best && "font-semibold"
      )}
    >
      <span
        ref={barRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0.5 rounded-sm opacity-15",
          side === "bid" ? "right-0 bg-bid" : "left-0 bg-ask"
        )}
        style={{ width: 0 }}
      />
      <span className="relative text-left text-muted-foreground">
        {level.orders}
      </span>
      <span className="relative text-muted-foreground">{nf.format(level.qty)}</span>
      <span
        className={cn(
          "relative w-16",
          side === "bid" ? "text-bid" : "text-ask"
        )}
      >
        {nf2.format(level.price)}
      </span>
    </button>
  );
}

/**
 * Live bid/ask depth ladder: quantity bars grow from the outside in,
 * the spread sits in the middle, and last price flashes directionally.
 */
export function MarketDepth({
  symbol,
  bids,
  asks,
  lastPrice,
  atp,
  onLevelSelect,
  className,
  ref,
  ...rest
}: MarketDepthProps) {
  const reduced = useReducedMotion();
  const prevLast = React.useRef(lastPrice);
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);

  React.useEffect(() => {
    if (reduced || lastPrice === prevLast.current) {
      prevLast.current = lastPrice;
      return;
    }
    setFlash(lastPrice > prevLast.current ? "up" : "down");
    prevLast.current = lastPrice;
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [lastPrice, reduced]);

  const maxQty = Math.max(1, ...bids.map((b) => b.qty), ...asks.map((a) => a.qty));
  const spread = asks[0] && bids[0] ? asks[0].price - bids[0].price : 0;
  const bidTotal = bids.reduce((s, b) => s + b.qty, 0);
  const askTotal = asks.reduce((s, a) => s + a.qty, 0);
  const bidShare = Math.round((bidTotal / (bidTotal + askTotal)) * 100);

  return (
    <div
      ref={ref}
      data-slot="market-depth"
      className={cn(
        "w-full max-w-sm rounded-xl border border-border bg-card p-3",
        className
      )}
      {...rest}
    >
      <div className="flex items-baseline justify-between gap-2 px-1">
        <span className="text-sm font-semibold text-foreground">{symbol}</span>
        <span
          className={cn(
            "font-mono text-sm font-semibold tabular-nums transition-colors duration-500",
            flash === "up" && "text-market-up",
            flash === "down" && "text-market-down"
          )}
        >
          {nf2.format(lastPrice)}
        </span>
      </div>

      {/* buyer/seller balance */}
      <div
        className="mt-2 flex h-1.5 overflow-hidden rounded-full"
        role="meter"
        aria-label="Buy-side share of visible depth"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={bidShare}
      >
        <span className="bg-bid transition-all duration-500" style={{ width: `${bidShare}%` }} />
        <span className="flex-1 bg-ask" />
      </div>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground">
        <span>Buyers {bidShare}%</span>
        <span>Sellers {100 - bidShare}%</span>
      </div>

      <div className="mt-2 grid grid-cols-[auto_auto_1fr] px-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Orders</span>
        <span className="ml-6">Qty</span>
        <span className="text-right">Price</span>
      </div>

      {/* Asks (worst to best, so the spread meets in the middle) */}
      <div className="mt-1 flex flex-col-reverse">
        {asks.map((a, i) => (
          <Row key={a.price} side="ask" level={a} maxQty={maxQty} best={i === 0} onSelect={onLevelSelect} />
        ))}
      </div>

      <div className="my-1 flex items-center justify-between rounded-md bg-muted/60 px-2 py-1 text-[11px]">
        <span className="text-muted-foreground">
          Spread <span className="font-mono tabular-nums text-foreground">{nf2.format(spread)}</span>
        </span>
        {atp ? (
          <span className="text-muted-foreground">
            ATP <span className="font-mono tabular-nums text-foreground">{nf2.format(atp)}</span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-col">
        {bids.map((b, i) => (
          <Row key={b.price} side="bid" level={b} maxQty={maxQty} best={i === 0} onSelect={onLevelSelect} />
        ))}
      </div>

      <p className="mt-2 px-1 text-[10px] text-muted-foreground">
        Tap a level to prefill an order · simulated feed
      </p>
    </div>
  );
}
