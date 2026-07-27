"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { useControllableState } from "@/registry/default/lib/use-controllable-state";
import { Button } from "@/registry/default/ui/button";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface Candle {
  /** Axis label for the bucket, e.g. "10:15". */
  label: string;
  o: number;
  h: number;
  l: number;
  c: number;
  /** Quantity traded in the bucket. */
  v: number;
}

export interface BookLevel {
  price: number;
  qty: number;
}

export interface ChartOrder {
  side: "buy" | "sell";
  type: "limit" | "market";
  qty: number;
  /** The order line for a limit, the touching quote for a market order. */
  price: number;
}

export type CheckStatus = "ok" | "warn" | "risk";

export interface PreTradeCheck {
  key: string;
  label: string;
  value: string;
  status: CheckStatus;
  /** Shown only when the check is not clean, so the panel stays quiet. */
  note: string;
  /** 0–100; renders an inline meter under the row. */
  meter?: number;
}

export interface ChartTradingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  symbol: string;
  exchange?: string;
  /** Candles for the active timeframe, oldest first. */
  candles: Candle[];
  lastPrice: number;
  /** Best-first (descending price) bid levels. */
  bids: BookLevel[];
  /** Best-first (ascending price) ask levels. */
  asks: BookLevel[];
  prevClose: number;
  /** Session volume-weighted average price; drawn as a dashed line. */
  vwap?: number;
  /** Session traded quantity. Defaults to the sum of the candles on screen. */
  volume?: number;
  /** Defaults to the candle extremes. */
  dayHigh?: number;
  dayLow?: number;
  upperCircuit?: number;
  lowerCircuit?: number;
  timeframes?: string[];
  timeframe?: string;
  defaultTimeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  lotSize?: number;
  maxLots?: number;
  tick?: number;
  onLimitPriceChange?: (price: number) => void;
  onPlace?: (order: ChartOrder) => void;
  ref?: React.Ref<HTMLDivElement>;
}

/* ------------------------------------------------------------------ */
/* Geometry + formatting                                                */
/* ------------------------------------------------------------------ */

const VIEW_W = 320;
/** Right-hand gutter reserved for the price axis, LTP and order pills. */
const AXIS_W = 48;
const PLOT_W = VIEW_W - AXIS_W;
const AXIS_PCT = (AXIS_W / VIEW_W) * 100;
const PRICE_H = 148;
const VOL_TOP = 158;
const VOL_H = 32;
const VIEW_H = 190;
const PAD = 9;

const nf2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const nf0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Indian short scale, because 1,24,50,000 in a legend is unreadable. */
function volFmt(n: number) {
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return nf0.format(n);
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Deterministic LCG, so demo data is identical on server and client. */
function rng(seed: number) {
  let s = (seed || 1) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function generateCandles({
  base = 1543.4,
  count = 46,
  seed = 11,
  vol = 0.0035,
  drift = 0.0003,
  stepMinutes = 5,
  labelFor,
}: {
  base?: number;
  count?: number;
  seed?: number;
  vol?: number;
  drift?: number;
  stepMinutes?: number;
  /** Override the clock labels, e.g. dates for a daily series. */
  labelFor?: (index: number, count: number) => string;
} = {}): Candle[] {
  const rand = rng(seed);
  const out: Candle[] = [];
  let price = base * (1 - drift * count);
  for (let i = 0; i < count; i++) {
    const o = price;
    const move = (rand() - 0.48) * 2 * vol * o + drift * o;
    const c = o + move;
    const wick = (rand() * 0.6 + 0.2) * vol * o;
    const h = Math.max(o, c) + wick;
    const l = Math.min(o, c) - wick * (rand() * 0.8 + 0.3);
    // Volume follows the move: big candles trade big.
    const v = Math.round(
      (2400 + rand() * 5200) * (1 + (Math.abs(move) / (vol * o)) * 1.4)
    );
    // Session opens 09:15 IST.
    const mins = 9 * 60 + 15 + i * stepMinutes;
    const label =
      labelFor?.(i, count) ??
      `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    out.push({ label, o, h, l, c, v });
    price = c;
  }
  // Land the series exactly on `base` so a live last price continues the
  // tape instead of opening a gap against it.
  const shift = base - out[out.length - 1].c;
  return out.map((k) => ({
    ...k,
    o: +(k.o + shift).toFixed(2),
    h: +(k.h + shift).toFixed(2),
    l: +(k.l + shift).toFixed(2),
    c: +(k.c + shift).toFixed(2),
  }));
}

export function generateBook(mid: number, tick = 0.05, levels = 5) {
  const mk = (side: 1 | -1): BookLevel[] =>
    Array.from({ length: levels }, (_, i) => {
      const seed = Math.sin((mid + side * (i + 1)) * 9.71) * 10_000;
      const r = seed - Math.floor(seed);
      return {
        price: +(mid + side * tick * (i + 1)).toFixed(2),
        qty: Math.round(280 + r * 3800),
      };
    });
  return { bids: mk(-1), asks: mk(1) };
}

const STATUS_COLOR: Record<CheckStatus, string> = {
  ok: "var(--success)",
  warn: "var(--warning)",
  risk: "var(--destructive)",
};

/* ------------------------------------------------------------------ */
/* Pre-trade checks                                                     */
/* ------------------------------------------------------------------ */

function walkBook(levels: BookLevel[], qty: number) {
  let left = qty;
  let cost = 0;
  for (const l of levels) {
    const take = Math.min(left, l.qty);
    cost += take * l.price;
    left -= take;
    if (left <= 0) break;
  }
  const filled = qty - left;
  return { avg: filled > 0 ? cost / filled : 0, filled };
}

function buildChecks({
  side,
  type,
  qty,
  limit,
  lastPrice,
  bids,
  asks,
  dayHigh,
  dayLow,
  prevClose,
  upperCircuit,
  lowerCircuit,
}: {
  side: "buy" | "sell";
  type: "limit" | "market";
  qty: number;
  limit: number;
  lastPrice: number;
  bids: BookLevel[];
  asks: BookLevel[];
  dayHigh: number;
  dayLow: number;
  prevClose: number;
  upperCircuit?: number;
  lowerCircuit?: number;
}): PreTradeCheck[] {
  const bestBid = bids[0]?.price ?? lastPrice;
  const bestAsk = asks[0]?.price ?? lastPrice;
  const spread = Math.max(0, bestAsk - bestBid);
  const spreadBps = lastPrice ? (spread / lastPrice) * 10_000 : 0;

  const bidQty = bids.reduce((s, b) => s + b.qty, 0);
  const askQty = asks.reduce((s, a) => s + a.qty, 0);
  const bidShare = bidQty + askQty ? (bidQty / (bidQty + askQty)) * 100 : 50;
  /** Depth stacked behind your intent: bids support a buy, asks cap it. */
  const withYou = side === "buy" ? bidShare : 100 - bidShare;

  // You lift asks to buy and hit bids to sell.
  const fillSide = side === "buy" ? asks : bids;
  const reachable =
    type === "market"
      ? fillSide.slice(0, 3).reduce((s, l) => s + l.qty, 0)
      : fillSide
          .filter((l) => (side === "buy" ? l.price <= limit : l.price >= limit))
          .reduce((s, l) => s + l.qty, 0);
  const coverage = qty ? reachable / qty : 0;

  const touch = side === "buy" ? bestAsk : bestBid;
  const { avg, filled } = walkBook(fillSide, qty);
  const impactBps =
    filled > 0 && touch ? (Math.abs(avg - touch) / touch) * 10_000 : 0;

  const range = Math.max(0.01, dayHigh - dayLow);
  const pos = clamp(((lastPrice - dayLow) / range) * 100, 0, 100);
  // Buying into the day's high (or selling the low) is the expensive end.
  const posAgainstYou = side === "buy" ? pos : 100 - pos;
  const rangePct = prevClose ? (range / prevClose) * 100 : 0;

  const checks: PreTradeCheck[] = [
    {
      key: "spread",
      label: "Spread",
      value: `₹${nf2.format(spread)} · ${spreadBps.toFixed(1)} bps`,
      status: spreadBps < 5 ? "ok" : spreadBps < 15 ? "warn" : "risk",
      note:
        spreadBps < 15
          ? `Paying the spread costs ~₹${nf2.format((spread / 2) * qty)} on this size.`
          : "Wide spread — a limit inside the quote beats crossing it.",
    },
    {
      key: "depth",
      label: type === "market" ? "Depth at touch" : "Liquidity at your price",
      value:
        reachable === 0
          ? "Rests in book"
          : `${nf0.format(reachable)} vs ${nf0.format(qty)} qty`,
      status:
        reachable === 0 ? "warn" : coverage >= 2 ? "ok" : coverage >= 1 ? "warn" : "risk",
      note:
        reachable === 0
          ? `Your limit sits behind the market — it queues at ₹${nf2.format(limit)} instead of filling.`
          : coverage >= 2
            ? ""
            : coverage >= 1
              ? "Barely covered — expect the tail to fill in pieces."
              : `Only ${Math.round(coverage * 100)}% of your size is available; the rest walks the book.`,
      meter: Math.min(100, coverage * 50),
    },
    {
      key: "impact",
      label: "Impact cost",
      value:
        type === "limit" && reachable === 0
          ? "Capped by limit"
          : `${impactBps.toFixed(1)} bps · ₹${nf0.format(Math.abs(avg - touch) * filled)}`,
      status:
        type === "limit" && reachable === 0
          ? "ok"
          : impactBps < 6
            ? "ok"
            : impactBps < 20
              ? "warn"
              : "risk",
      note:
        impactBps < 6
          ? ""
          : `Your size moves the average fill to ₹${nf2.format(avg)} — split it or work the limit.`,
    },
    {
      key: "pressure",
      label: "Book pressure",
      value: `${Math.round(bidShare)}% buyers`,
      status: withYou >= 45 ? "ok" : withYou >= 32 ? "warn" : "risk",
      note:
        withYou >= 45
          ? ""
          : `Resting depth leans ${side === "buy" ? "sell" : "buy"}-side — you're trading into it.`,
      meter: bidShare,
    },
    {
      key: "range",
      label: "Day range position",
      value: `${Math.round(pos)}% of ₹${nf2.format(dayLow)}–${nf2.format(dayHigh)}`,
      status: posAgainstYou > 92 ? "risk" : posAgainstYou > 78 ? "warn" : "ok",
      note:
        posAgainstYou > 78
          ? `${side === "buy" ? "Buying" : "Selling"} at the ${side === "buy" ? "top" : "bottom"} of the day — no room left in your favour.`
          : "",
      meter: pos,
    },
    {
      key: "vol",
      label: "Session volatility",
      value: `${rangePct.toFixed(2)}% range`,
      status: rangePct < 2 ? "ok" : rangePct < 4 ? "warn" : "risk",
      note:
        rangePct < 2
          ? ""
          : "Fast tape — a market order can slip well past the quote you saw.",
    },
  ];

  if (upperCircuit != null && lowerCircuit != null) {
    const toBand =
      Math.min(upperCircuit - lastPrice, lastPrice - lowerCircuit) / lastPrice * 100;
    checks.push({
      key: "circuit",
      label: "Circuit headroom",
      value: `${toBand.toFixed(1)}% to band`,
      status: toBand < 1.5 ? "risk" : toBand < 4 ? "warn" : "ok",
      note:
        toBand < 4
          ? `Bands at ₹${nf2.format(lowerCircuit)}–${nf2.format(upperCircuit)}; trading halts if price locks.`
          : "",
    });
  }

  return checks;
}

/* ------------------------------------------------------------------ */
/* Depth rail                                                           */
/* ------------------------------------------------------------------ */

function DepthRow({
  side,
  level,
  maxQty,
  active,
  onPick,
}: {
  side: "bid" | "ask";
  level: BookLevel;
  maxQty: number;
  active: boolean;
  onPick: (price: number) => void;
}) {
  const barRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const pct = Math.round((level.qty / maxQty) * 100);

  /* Bars breathe to each new resting quantity instead of re-drawing. */
  useGSAP(
    () => {
      if (!barRef.current) return;
      if (reduced) {
        gsap.set(barRef.current, { width: `${pct}%` });
        return;
      }
      gsap.to(barRef.current, {
        width: `${pct}%`,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    { dependencies: [pct, reduced] }
  );

  return (
    <button
      type="button"
      onClick={() => onPick(level.price)}
      aria-label={`Set order price to ${nf2.format(level.price)} — ${side} depth ${nf0.format(level.qty)}`}
      className={cn(
        "relative flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1 font-mono type-caption numeric transition-colors duration-150",
        "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        active && "bg-muted"
      )}
    >
      <span
        ref={barRef}
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0 rounded-md"
        style={{
          width: 0,
          background: `linear-gradient(90deg, color-mix(in oklab, var(--${side}) 24%, transparent), color-mix(in oklab, var(--${side}) 5%, transparent))`,
        }}
      />
      <span className={cn("relative", side === "bid" ? "text-bid" : "text-ask")}>
        {nf2.format(level.price)}
      </span>
      <span className="relative text-muted-foreground">{nf0.format(level.qty)}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Check row                                                            */
/* ------------------------------------------------------------------ */

function CheckRow({ check }: { check: PreTradeCheck }) {
  const dotRef = React.useRef<HTMLSpanElement>(null);
  const meterRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const color = STATUS_COLOR[check.status];

  /* The dot pops when a check flips verdict — the one thing worth noticing. */
  useGSAP(
    () => {
      if (!dotRef.current || reduced) return;
      gsap.fromTo(
        dotRef.current,
        { scale: 0.4 },
        { scale: 1, duration: 0.45, ease: "back.out(3)" }
      );
    },
    { dependencies: [check.status, reduced] }
  );

  useGSAP(
    () => {
      if (!meterRef.current || check.meter == null) return;
      const width = `${clamp(check.meter, 0, 100)}%`;
      if (reduced) {
        gsap.set(meterRef.current, { width });
        return;
      }
      gsap.to(meterRef.current, {
        width,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    { dependencies: [check.meter, reduced] }
  );

  return (
    <li
      data-slot="check"
      data-status={check.status}
      className="rounded-xl border border-border/50 bg-background/60 px-2.5 py-2"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 type-meta text-muted-foreground">
          <span
            ref={dotRef}
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <span>{check.label}</span>
          {/* Status is a colour for sighted users; spell it out for the rest. */}
          <span className="sr-only">
            {check.status === "ok"
              ? "clear"
              : check.status === "warn"
                ? "worth noting"
                : "needs a look"}
          </span>
        </span>
        <span
          className="shrink-0 font-mono type-caption numeric"
          style={{ color: check.status === "ok" ? "var(--foreground)" : color }}
        >
          {check.value}
        </span>
      </div>
      {check.meter != null ? (
        <span
          aria-hidden="true"
          className="mt-1.5 block h-1 overflow-hidden rounded-full bg-muted"
        >
          <span
            ref={meterRef}
            className="block h-full rounded-full"
            style={{ width: 0, background: color }}
          />
        </span>
      ) : null}
      {check.status !== "ok" && check.note ? (
        <p className="mt-1 type-caption text-muted-foreground">{check.note}</p>
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Chart trading                                                        */
/* ------------------------------------------------------------------ */

/**
 * Chart-first trading terminal: candles draw in on load and re-stagger on
 * every timeframe switch, a draggable order line sets the limit price
 * straight on the chart, the depth rail breathes with the book, and a
 * pre-trade panel re-scores spread, liquidity, impact, book pressure,
 * range position and volatility against the side you are about to take.
 */
export function ChartTrading({
  symbol,
  exchange = "NSE",
  candles,
  lastPrice,
  bids,
  asks,
  prevClose,
  vwap,
  volume,
  dayHigh,
  dayLow,
  upperCircuit,
  lowerCircuit,
  timeframes = ["1m", "5m", "15m", "1D"],
  timeframe,
  defaultTimeframe,
  onTimeframeChange,
  lotSize = 1,
  maxLots = 50,
  tick = 0.05,
  onLimitPriceChange,
  onPlace,
  className,
  ref,
  ...rest
}: ChartTradingProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const plotRef = React.useRef<HTMLDivElement>(null);
  const chartWrapRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [tf, setTf] = useControllableState<string>({
    value: timeframe,
    defaultValue: defaultTimeframe ?? timeframes[1] ?? timeframes[0],
    onChange: onTimeframeChange,
  });
  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const [type, setType] = React.useState<"limit" | "market">("limit");
  const [lots, setLots] = React.useState(2);
  const [stage, setStage] = React.useState<"idle" | "confirm" | "placing" | "placed">("idle");
  const [placed, setPlaced] = React.useState<ChartOrder | null>(null);

  const snap = React.useCallback(
    (p: number) => +(Math.round(p / tick) * tick).toFixed(2),
    [tick]
  );

  const [limit, setLimit] = React.useState(() => snap(lastPrice));
  const [touched, setTouched] = React.useState(false);
  const limitRef = React.useRef(limit);
  limitRef.current = limit;
  const commitLimit = React.useCallback(
    (price: number) => {
      const next = snap(price);
      setTouched(true);
      if (next === limitRef.current) return;
      limitRef.current = next;
      setLimit(next);
      onLimitPriceChange?.(next);
    },
    [snap, onLimitPriceChange]
  );

  /* ---------------- scales ---------------- */

  /* Day range drives the checks; the plot domain follows the candles on
     screen, so a multi-day timeframe still fits inside the pane. */
  const high = dayHigh ?? Math.max(lastPrice, ...candles.map((c) => c.h));
  const low = dayLow ?? Math.min(lastPrice, ...candles.map((c) => c.l));

  const { lo, hi } = React.useMemo(() => {
    const rawHi = Math.max(lastPrice, vwap ?? lastPrice, ...candles.map((c) => c.h));
    const rawLo = Math.min(lastPrice, vwap ?? lastPrice, ...candles.map((c) => c.l));
    const pad = Math.max((rawHi - rawLo) * 0.08, tick * 4);
    return { lo: rawLo - pad, hi: rawHi + pad };
  }, [candles, lastPrice, vwap, tick]);

  const yOf = React.useCallback(
    (p: number) => PAD + (1 - (p - lo) / (hi - lo)) * (PRICE_H - PAD * 2),
    [lo, hi]
  );
  const priceAt = React.useCallback(
    (y: number) => lo + (1 - (y - PAD) / (PRICE_H - PAD * 2)) * (hi - lo),
    [lo, hi]
  );
  const topPct = React.useCallback((p: number) => (yOf(p) / VIEW_H) * 100, [yOf]);

  /* ---------------- derived ---------------- */

  const qty = lots * lotSize;
  const bestBid = bids[0]?.price ?? lastPrice;
  const bestAsk = asks[0]?.price ?? lastPrice;
  const touchPrice = side === "buy" ? bestAsk : bestBid;
  const effPrice = type === "market" ? touchPrice : limit;

  /* Until you move it yourself, the order line tracks the quote you would
     actually trade against — the ask to buy, the bid to sell. */
  React.useEffect(() => {
    if (touched) return;
    const seeded = snap(touchPrice);
    limitRef.current = seeded;
    setLimit(seeded);
  }, [touchPrice, touched, snap]);

  const change = lastPrice - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;
  const up = change >= 0;
  const sideColor = side === "buy" ? "var(--market-up)" : "var(--market-down)";
  const sessionVol = React.useMemo(
    () => volume ?? candles.reduce((s, c) => s + c.v, 0),
    [volume, candles]
  );

  const checks = React.useMemo(
    () =>
      buildChecks({
        side,
        type,
        qty,
        limit,
        lastPrice,
        bids,
        asks,
        dayHigh: high,
        dayLow: low,
        prevClose,
        upperCircuit,
        lowerCircuit,
      }),
    [side, type, qty, limit, lastPrice, bids, asks, high, low, prevClose, upperCircuit, lowerCircuit]
  );
  const risks = checks.filter((c) => c.status === "risk").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const verdict = risks ? "risk" : warns ? "warn" : ("ok" as CheckStatus);

  /* ---------------- candle geometry ---------------- */

  const maxVol = Math.max(1, ...candles.map((c) => c.v));
  const slot = PLOT_W / Math.max(1, candles.length);
  const bodyW = Math.max(1.2, slot * 0.62);

  const candleLayer = React.useMemo(
    () =>
      candles.map((c, i) => {
        const cx = slot * (i + 0.5);
        const rising = c.c >= c.o;
        const color = rising ? "var(--market-up)" : "var(--market-down)";
        const yHigh = yOf(c.h);
        const yLow = yOf(c.l);
        const yTop = yOf(Math.max(c.o, c.c));
        const yBot = yOf(Math.min(c.o, c.c));
        const volH = (c.v / maxVol) * VOL_H;
        return (
          <g key={`${c.label}-${i}`} data-candle="" style={{ opacity: 1 }}>
            <line
              x1={cx}
              x2={cx}
              y1={yHigh}
              y2={yLow}
              stroke={color}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={cx - bodyW / 2}
              y={yTop}
              width={bodyW}
              height={Math.max(0.8, yBot - yTop)}
              fill={color}
              opacity={rising ? 0.95 : 1}
            />
            <rect
              data-vol=""
              x={cx - bodyW / 2}
              y={VOL_TOP + (VOL_H - volH)}
              width={bodyW}
              height={Math.max(0.5, volH)}
              fill={color}
              opacity={0.3}
            />
          </g>
        );
      }),
    [candles, slot, bodyW, yOf, maxVol]
  );

  /* ---------------- entrance + timeframe switch ---------------- */

  useGSAP(
    () => {
      const bodies = gsap.utils.toArray<SVGGElement>(
        plotRef.current?.querySelectorAll("[data-candle]") ?? []
      );
      if (!bodies.length) return;
      if (reduced) {
        gsap.set(bodies, { opacity: 1, scaleY: 1 });
        gsap.set("[data-vwap]", { scaleX: 1, opacity: 1 });
        return;
      }
      const tl = gsap.timeline();
      tl.fromTo(
        bodies,
        { scaleY: 0.04, opacity: 0, transformOrigin: "50% 50%" },
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: { each: 0.012, from: "start" },
          clearProps: "transform",
        }
      );
      tl.fromTo(
        "[data-vwap]",
        { scaleX: 0, opacity: 0, transformOrigin: "0% 50%" },
        { scaleX: 1, opacity: 1, duration: 0.9, ease: "power2.inOut" },
        0.15
      );
      tl.fromTo(
        "[data-axis-label]",
        { opacity: 0, x: 6 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out", stagger: 0.05 },
        0.35
      );
    },
    { dependencies: [tf, reduced], scope: plotRef }
  );

  /* Checks re-cascade whenever the side or order type changes the scoring. */
  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-slot='check']",
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.05 }
      );
    },
    { dependencies: [side, type, reduced], scope: rootRef }
  );

  /* Last price pill flashes with the tick direction. */
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);
  const prevLast = React.useRef(lastPrice);
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

  /* ---------------- crosshair ---------------- */

  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const hoverRef = React.useRef<number | null>(null);
  const vLineRef = React.useRef<HTMLDivElement>(null);
  const hLineRef = React.useRef<HTMLDivElement>(null);
  const hLabelRef = React.useRef<HTMLSpanElement>(null);
  const xTo = React.useRef<((v: number) => void) | null>(null);
  const yTo = React.useRef<((v: number) => void) | null>(null);

  useGSAP(() => {
    if (!vLineRef.current || !hLineRef.current) return;
    const cfg = { duration: reduced ? 0 : 0.12, ease: "power3.out" };
    xTo.current = gsap.quickTo(vLineRef.current, "x", cfg);
    yTo.current = gsap.quickTo(hLineRef.current, "y", cfg);
  }, [reduced]);

  const moveCrosshair = (e: React.PointerEvent) => {
    const el = chartWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // The axis gutter is outside the plot, so normalise x against it.
    const plotW = (rect.width * PLOT_W) / VIEW_W;
    const fx = clamp((e.clientX - rect.left) / plotW, 0, 1);
    const fy = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const idx = clamp(Math.floor(fx * candles.length), 0, candles.length - 1);
    if (idx !== hoverRef.current) {
      hoverRef.current = idx;
      setHoverIdx(idx);
    }
    const price = clamp(priceAt(fy * VIEW_H), lo, hi);
    xTo.current?.((slot * (idx + 0.5) * rect.width) / VIEW_W);
    yTo.current?.((yOf(price) * rect.height) / VIEW_H);
    if (hLabelRef.current) hLabelRef.current.textContent = nf2.format(price);
  };

  const leaveCrosshair = () => {
    hoverRef.current = null;
    setHoverIdx(null);
  };

  const legend = candles[hoverIdx ?? candles.length - 1];

  /* ---------------- order line drag ---------------- */

  const [dragging, setDragging] = React.useState(false);

  const priceFromClientY = (clientY: number) => {
    const el = chartWrapRef.current;
    if (!el) return limit;
    const rect = el.getBoundingClientRect();
    const fy = clamp((clientY - rect.top) / rect.height, 0, 1);
    return clamp(priceAt(fy * VIEW_H), lo, hi);
  };

  const onHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    commitLimit(priceFromClientY(e.clientY));
  };
  const onHandleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };
  const onHandleKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? tick * 10 : tick;
    if (e.key === "ArrowUp") commitLimit(limit + step);
    else if (e.key === "ArrowDown") commitLimit(limit - step);
    else if (e.key === "PageUp") commitLimit(limit + tick * 20);
    else if (e.key === "PageDown") commitLimit(limit - tick * 20);
    else if (e.key === "Home") commitLimit(lastPrice);
    else return;
    e.preventDefault();
  };

  /* ---------------- fill marker ---------------- */

  const markerRef = React.useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!markerRef.current || !placed) return;
      if (reduced) {
        gsap.set(markerRef.current, { opacity: 1, scale: 1 });
        return;
      }
      gsap.fromTo(
        markerRef.current,
        { opacity: 0, scale: 0.6, x: 10 },
        { opacity: 1, scale: 1, x: 0, duration: 0.5, ease: "back.out(2.4)" }
      );
    },
    { dependencies: [placed, reduced] }
  );

  const place = async () => {
    if (stage === "placed") {
      setStage("idle");
      setPlaced(null);
      return;
    }
    if (verdict === "risk" && stage === "idle") {
      setStage("confirm");
      return;
    }
    setStage("placing");
    const order: ChartOrder = { side, type, qty, price: snap(effPrice) };
    await new Promise((r) => setTimeout(r, 850));
    setPlaced(order);
    setStage("placed");
    onPlace?.(order);
  };

  const maxDepthQty = Math.max(
    1,
    ...bids.map((b) => b.qty),
    ...asks.map((a) => a.qty)
  );

  const axisPrices = [hi, (hi + lo) / 2, lo];

  return (
    <div
      ref={rootRef}
      data-slot="chart-trading"
      style={{ "--side": sideColor } as React.CSSProperties}
      className={cn(
        "w-full max-w-3xl rounded-3xl border border-border/60 bg-card p-4 shadow-md sm:p-5",
        className
      )}
      {...rest}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="type-title text-foreground">{symbol}</span>
            <span className="rounded-md border border-border/60 px-1.5 py-0.5 type-caption text-muted-foreground">
              {exchange}
            </span>
          </div>
          <p className="mt-0.5 type-caption text-muted-foreground">
            Vol {volFmt(sessionVol)} · VWAP{" "}
            <span className="font-mono numeric">{vwap ? nf2.format(vwap) : "—"}</span>
          </p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "block font-mono type-metric numeric transition-colors duration-500",
              flash === "up" && "text-market-up",
              flash === "down" && "text-market-down",
              !flash && "text-foreground"
            )}
          >
            <NumberFlow value={lastPrice} decimals={2} locale="en-IN" />
          </span>
          <span
            className="inline-flex items-center gap-1 type-meta numeric"
            style={{ color: up ? "var(--market-up)" : "var(--market-down)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("size-3", !up && "rotate-180")}
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {nf2.format(Math.abs(change))} ({changePct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Timeframes */}
      <div
        className="mt-3 flex gap-1 rounded-xl bg-muted p-1"
        role="tablist"
        aria-label="Timeframe"
      >
        {timeframes.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tf === t}
            onClick={() => setTf(t)}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 type-meta font-medium transition-colors duration-200",
              tf === t
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart + depth */}
      <div className="mt-3 flex flex-col gap-3 lg:flex-row">
        <div ref={plotRef} className="min-w-0 flex-1">
          {/* OHLC legend: pinned, so the tooltip can never overflow the card. */}
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 px-0.5 font-mono type-caption numeric text-muted-foreground">
            <span className="text-foreground">{legend?.label}</span>
            <span>O {nf2.format(legend?.o ?? 0)}</span>
            <span>H {nf2.format(legend?.h ?? 0)}</span>
            <span>L {nf2.format(legend?.l ?? 0)}</span>
            <span
              style={{
                color:
                  (legend?.c ?? 0) >= (legend?.o ?? 0)
                    ? "var(--market-up)"
                    : "var(--market-down)",
              }}
            >
              C {nf2.format(legend?.c ?? 0)}
            </span>
            <span>Vol {volFmt(legend?.v ?? 0)}</span>
          </div>

          <div
            ref={chartWrapRef}
            className="relative mt-1 h-[240px] select-none sm:h-[280px]"
          >
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              aria-hidden="true"
            >
              {/* price grid */}
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1={0}
                  x2={PLOT_W}
                  y1={PAD + (i / 3) * (PRICE_H - PAD * 2)}
                  y2={PAD + (i / 3) * (PRICE_H - PAD * 2)}
                  stroke="var(--border)"
                  strokeWidth={1}
                  opacity={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <line
                x1={0}
                x2={PLOT_W}
                y1={VOL_TOP + VOL_H}
                y2={VOL_TOP + VOL_H}
                stroke="var(--border)"
                strokeWidth={1}
                opacity={0.6}
                vectorEffect="non-scaling-stroke"
              />
              {vwap != null ? (
                <line
                  data-vwap=""
                  x1={0}
                  x2={PLOT_W}
                  y1={yOf(vwap)}
                  y2={yOf(vwap)}
                  stroke="var(--foreground)"
                  strokeWidth={1}
                  strokeDasharray="1 3"
                  opacity={0.45}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
              {candleLayer}
            </svg>

            {/* Price axis labels (HTML, so text never stretches with the svg) */}
            <div
              className="pointer-events-none absolute inset-y-0 right-0"
              style={{ width: `${AXIS_PCT}%` }}
            >
              {axisPrices.map((p) => (
                <span
                  key={p}
                  data-axis-label=""
                  className="absolute left-1 -translate-y-1/2 font-mono type-caption numeric text-muted-foreground"
                  style={{ top: `${topPct(p)}%` }}
                >
                  {nf2.format(p)}
                </span>
              ))}
            </div>

            {/* Last traded price */}
            <div
              className="pointer-events-none absolute inset-x-0 z-10 -translate-y-1/2 transition-[top] duration-500 ease-out motion-reduce:transition-none"
              style={{ top: `${topPct(lastPrice)}%` }}
            >
              <span
                className="absolute left-0 top-0 h-px bg-foreground/25"
                style={{ right: `${AXIS_PCT}%` }}
              />
              <span
                className="absolute right-0 top-0 -translate-y-1/2 rounded px-1 py-px font-mono type-caption font-medium numeric text-background transition-colors duration-500"
                style={{ background: up ? "var(--market-up)" : "var(--market-down)" }}
              >
                {nf2.format(lastPrice)}
              </span>
            </div>

            {/* Order line + drag handle. Sits above the interaction surface so
                the handle keeps the pointer once a drag starts. */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 z-30 -translate-y-1/2",
                dragging
                  ? "transition-none"
                  : "transition-[top] duration-300 ease-out motion-reduce:transition-none"
              )}
              style={{ top: `${topPct(effPrice)}%` }}
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-0 border-t border-dashed"
                style={{ right: `${AXIS_PCT}%`, borderColor: sideColor }}
              />
              <div
                role="slider"
                tabIndex={0}
                aria-label={`${side} order price`}
                aria-orientation="vertical"
                aria-valuemin={snap(lo)}
                aria-valuemax={snap(hi)}
                aria-valuenow={snap(effPrice)}
                aria-valuetext={`₹${nf2.format(effPrice)}`}
                aria-disabled={type === "market"}
                onPointerDown={type === "limit" ? onHandleDown : undefined}
                onPointerMove={type === "limit" ? onHandleMove : undefined}
                onPointerUp={onHandleUp}
                onPointerCancel={onHandleUp}
                onKeyDown={type === "limit" ? onHandleKey : undefined}
                className={cn(
                  "pointer-events-auto absolute left-0 top-0 flex -translate-y-1/2 touch-none items-center gap-1 rounded-md px-1.5 py-px font-mono type-caption font-medium numeric text-background shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  type === "limit" ? "cursor-ns-resize" : "cursor-default opacity-80"
                )}
                style={{ background: sideColor }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="size-2.5"
                  aria-hidden="true"
                >
                  <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                </svg>
                {side === "buy" ? "B" : "S"} {nf2.format(effPrice)}
              </div>
            </div>

            {/* Placed-order marker */}
            {placed ? (
              <div
                ref={markerRef}
                /* Above the order line, so its own dashes don't strike the
                   label, and clear of the axis gutter. */
                className="pointer-events-none absolute z-40 -translate-y-1/2"
                style={{
                  top: `${topPct(placed.price)}%`,
                  right: `calc(${AXIS_PCT}% + 6px)`,
                  opacity: 0,
                }}
              >
                <span
                  className="flex items-center gap-1 rounded-md border px-1.5 py-px font-mono type-caption numeric"
                  style={{
                    borderColor: `color-mix(in oklab, var(--placed) 45%, transparent)`,
                    background: `color-mix(in oklab, var(--placed) 14%, var(--card))`,
                    color: "var(--placed)",
                    ["--placed" as string]:
                      placed.side === "buy" ? "var(--market-up)" : "var(--market-down)",
                  }}
                >
                  {placed.side === "buy" ? "▲" : "▼"} {nf0.format(placed.qty)} @{" "}
                  {nf2.format(placed.price)}
                </span>
              </div>
            ) : null}

            {/* Crosshair */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-10 transition-opacity duration-200",
                hoverIdx == null ? "opacity-0" : "opacity-100"
              )}
            >
              <div
                ref={vLineRef}
                className="absolute inset-y-0 left-0 w-px border-l border-dashed border-foreground/30"
              />
              <div ref={hLineRef} className="absolute inset-x-0 top-0">
                <span
                  className="absolute left-0 top-0 h-0 border-t border-dashed border-foreground/30"
                  style={{ right: `${AXIS_PCT}%` }}
                />
                <span
                  ref={hLabelRef}
                  className="absolute right-0 top-0 -translate-y-1/2 rounded bg-foreground px-1 py-px font-mono type-caption numeric text-background"
                />
              </div>
            </div>

            {/* Interaction surface: hover reads the tape, click sets the limit. */}
            <div
              className="absolute inset-y-0 left-0 z-20 cursor-crosshair"
              style={{ right: `${AXIS_PCT}%` }}
              onPointerMove={moveCrosshair}
              onPointerLeave={leaveCrosshair}
              onPointerDown={(e) => {
                if (type !== "limit") return;
                commitLimit(priceFromClientY(e.clientY));
              }}
            />
          </div>
        </div>

        {/* Depth rail */}
        <div
          data-slot="depth-rail"
          className="shrink-0 rounded-2xl border border-border/50 bg-background/50 p-2 lg:w-44"
        >
          <div className="flex items-baseline justify-between px-1 type-overline text-muted-foreground">
            <span>Depth</span>
            <span>Qty</span>
          </div>
          <div className="mt-1 flex flex-col-reverse">
            {asks.map((a, i) => (
              <DepthRow
                key={`a-${i}`}
                side="ask"
                level={a}
                maxQty={maxDepthQty}
                active={snap(effPrice) === a.price}
                onPick={commitLimit}
              />
            ))}
          </div>
          <div className="my-1 flex items-center justify-between rounded-md bg-muted/60 px-1.5 py-1 type-caption text-muted-foreground">
            <span>Spread</span>
            <span className="font-mono numeric text-foreground">
              {nf2.format(Math.max(0, bestAsk - bestBid))}
            </span>
          </div>
          <div className="flex flex-col">
            {bids.map((b, i) => (
              <DepthRow
                key={`b-${i}`}
                side="bid"
                level={b}
                maxQty={maxDepthQty}
                active={snap(effPrice) === b.price}
                onPick={commitLimit}
              />
            ))}
          </div>
          <p className="mt-1.5 px-1 type-caption text-muted-foreground">
            Tap a level to move your order there.
          </p>
        </div>
      </div>

      {/* Pre-trade checks */}
      <div className="mt-4 rounded-2xl border border-border/50 bg-muted/30 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="type-overline text-muted-foreground">Before you trade</p>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 type-caption font-medium"
            style={{
              color: STATUS_COLOR[verdict],
              borderColor: `color-mix(in oklab, ${STATUS_COLOR[verdict]} 35%, transparent)`,
              background: `color-mix(in oklab, ${STATUS_COLOR[verdict]} 10%, transparent)`,
            }}
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ background: STATUS_COLOR[verdict] }}
            />
            {verdict === "ok"
              ? "Clear to place"
              : verdict === "warn"
                ? `${warns} to note`
                : `${risks} need${risks > 1 ? "" : "s"} a look`}
          </span>
        </div>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {checks.map((c) => (
            <CheckRow key={c.key} check={c} />
          ))}
        </ul>
      </div>

      {/* Ticket */}
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div
          className="flex gap-1 rounded-xl bg-muted p-1"
          role="tablist"
          aria-label="Order side"
        >
          {(["buy", "sell"] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={side === s}
              onClick={() => {
                setSide(s);
                setStage("idle");
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 type-meta font-semibold uppercase tracking-wide transition-colors duration-200",
                side === s ? "text-background shadow-sm" : "text-muted-foreground hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              style={
                side === s
                  ? { background: s === "buy" ? "var(--market-up)" : "var(--market-down)" }
                  : undefined
              }
            >
              {s}
            </button>
          ))}
        </div>

        <div
          className="flex gap-1 rounded-xl bg-muted p-1"
          role="tablist"
          aria-label="Order type"
        >
          {(["limit", "market"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={type === t}
              onClick={() => {
                setType(t);
                setStage("idle");
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 type-meta font-medium capitalize transition-colors duration-200",
                type === t
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1 type-caption text-muted-foreground">
          Lots ({lotSize}/lot)
          <div className="flex h-9 items-stretch gap-1 rounded-xl border border-input bg-background p-1 shadow-xs">
            <button
              type="button"
              aria-label="Decrease lots"
              onClick={() => setLots((l) => Math.max(1, l - 1))}
              className="flex aspect-square items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="size-3.5" aria-hidden="true"><path d="M5 12h14" /></svg>
            </button>
            <span className="flex min-w-8 items-center justify-center font-mono type-meta numeric text-foreground">
              {lots}
            </span>
            <button
              type="button"
              aria-label="Increase lots"
              onClick={() => setLots((l) => Math.min(maxLots, l + 1))}
              className="flex aspect-square items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="size-3.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
        </label>

        <div className="ml-auto flex items-end gap-2">
          <p className="pb-1 text-right type-caption text-muted-foreground">
            {nf0.format(qty)} qty ·{" "}
            <span className="font-mono numeric text-foreground">
              ₹{nf2.format(effPrice)}
            </span>
            <br />≈ ₹{nf0.format(qty * effPrice)}
          </p>
          <Button
            className="text-background shadow-sm hover:opacity-90"
            style={{ background: sideColor }}
            loading={stage === "placing"}
            disabled={stage === "placing"}
            onClick={place}
          >
            {stage === "placed"
              ? "Place another"
              : stage === "confirm"
                ? "Place anyway"
                : `${side === "buy" ? "Buy" : "Sell"} ${type === "market" ? "at market" : nf2.format(limit)}`}
          </Button>
        </div>
      </div>

      {/* Confirm / placed strip */}
      {stage === "confirm" ? (
        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 type-meta"
          style={{
            borderColor: "color-mix(in oklab, var(--destructive) 35%, transparent)",
            background: "color-mix(in oklab, var(--destructive) 8%, transparent)",
          }}
          role="alert"
        >
          <span className="text-foreground">
            {risks} check{risks > 1 ? "s" : ""} flagged this order —{" "}
            {checks.find((c) => c.status === "risk")?.label.toLowerCase()} first.
          </span>
          <Button size="sm" variant="outline" onClick={() => setStage("idle")}>
            Let me adjust
          </Button>
        </div>
      ) : null}

      {stage === "placed" && placed ? (
        <p className="mt-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 type-meta text-muted-foreground">
          <span
            className="font-semibold uppercase"
            style={{ color: sideColor }}
          >
            {placed.side}
          </span>{" "}
          {nf0.format(placed.qty)} {symbol} · {placed.type} @ ₹
          {nf2.format(placed.price)} — working on the chart at that level.
        </p>
      ) : null}

      <p className="mt-3 type-caption text-muted-foreground">
        Drag the {side === "buy" ? "buy" : "sell"} line (or click the chart) to set
        your price · arrow keys nudge by a tick, shift for ten · simulated feed
      </p>
    </div>
  );
}
