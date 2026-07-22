"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export type OrderType = "market" | "limit" | "stop" | "stop-limit";

export interface PlacedOrder {
  side: "buy" | "sell";
  type: OrderType;
  qty: number;
  price?: number;
  triggerPrice?: number;
}

export interface OrderTicketProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  symbol: string;
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  lotSize?: number;
  /** Margin available to trade. Drives the risk-blocked state. */
  availableMargin?: number;
  /** Margin factor per unit of notional. Default 0.14 (index options-ish). */
  marginFactor?: number;
  onPlaced?: (order: PlacedOrder) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const nf2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Indian-broker conventions: SL = stop-loss limit (trigger + limit price),
// SL-M = stop-loss market (trigger, fills at market).
const TYPES: { key: OrderType; label: string }[] = [
  { key: "market", label: "Market" },
  { key: "limit", label: "Limit" },
  { key: "stop-limit", label: "SL" },
  { key: "stop", label: "SL-M" },
];

const spring = { type: "spring", stiffness: 480, damping: 38 } as const;

type Stage = "form" | "review" | "placing" | "filling" | "done";

/* ------------------------------------------------------------------ */
/* Ticket                                                               */
/* ------------------------------------------------------------------ */

/**
 * Advanced order ticket: buy/sell recolors the whole ticket, order types
 * reveal the fields they need, margin and charges roll live, over-margin
 * blocks the flow, and placement plays a partial-fill progress state.
 */
export function OrderTicket({
  symbol,
  lastPrice,
  bestBid,
  bestAsk,
  lotSize = 75,
  availableMargin = 250_000,
  marginFactor = 0.14,
  onPlaced,
  className,
  ref,
  ...rest
}: OrderTicketProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const [type, setType] = React.useState<OrderType>("limit");
  const [lots, setLots] = React.useState(1);
  const [price, setPrice] = React.useState(lastPrice.toFixed(2));
  const [trigger, setTrigger] = React.useState((lastPrice * 0.995).toFixed(2));
  const [chargesOpen, setChargesOpen] = React.useState(false);
  const [stage, setStage] = React.useState<Stage>("form");
  const [filled, setFilled] = React.useState(0);

  const qty = lots * lotSize;
  const effPrice =
    type === "market" ? (side === "buy" ? bestAsk : bestBid) : parseFloat(price) || 0;
  const notional = qty * effPrice;
  const margin = Math.round(notional * marginFactor);
  const brokerage = 20;
  const stt = Math.round(notional * 0.000625);
  const other = Math.round(notional * 0.000053) + 15;
  const charges = brokerage + stt + other;
  const overMargin = margin > availableMargin;
  const needsPrice = type === "limit" || type === "stop-limit";
  const needsTrigger = type === "stop" || type === "stop-limit";
  const sideColor = side === "buy" ? "var(--market-up)" : "var(--market-down)";

  const chargesRef = React.useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!chargesRef.current) return;
      if (reduced) {
        gsap.set(chargesRef.current, { height: chargesOpen ? "auto" : 0, opacity: chargesOpen ? 1 : 0 });
        return;
      }
      gsap.to(chargesRef.current, {
        height: chargesOpen ? "auto" : 0,
        opacity: chargesOpen ? 1 : 0,
        duration: 0.3,
        ease: "power3.out",
      });
    },
    { dependencies: [chargesOpen, reduced] }
  );

  const place = async () => {
    setStage("placing");
    await new Promise((r) => setTimeout(r, 900));
    setStage("filling");
    // partial fill: 40% then complete
    setFilled(Math.round(qty * 0.4));
    await new Promise((r) => setTimeout(r, 1300));
    setFilled(qty);
    await new Promise((r) => setTimeout(r, 500));
    setStage("done");
    onPlaced?.({
      side,
      type,
      qty,
      ...(needsPrice ? { price: parseFloat(price) } : {}),
      ...(needsTrigger ? { triggerPrice: parseFloat(trigger) } : {}),
    });
  };

  const reset = () => {
    setStage("form");
    setFilled(0);
  };

  const numField = (
    label: string,
    value: string,
    set: (v: string) => void,
    disabled = false
  ) => (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-[11px] font-medium text-muted-foreground">
      {label}
      <input
        inputMode="decimal"
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => set(e.target.value.replace(/[^0-9.]/g, ""))}
        className={cn(
          "h-10 w-full min-w-0 rounded-xl border border-input bg-background px-3 font-mono text-sm tabular-nums text-foreground shadow-xs",
          "transition-[border-color,box-shadow] duration-200 hover:border-ring/30",
          "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
          disabled && "opacity-50"
        )}
      />
    </label>
  );

  return (
    <div
      ref={rootRef}
      data-slot="order-ticket"
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-3xl border bg-card p-5 shadow-md transition-colors duration-300",
        side === "buy" ? "border-market-up/30" : "border-market-down/30",
        className
      )}
      {...rest}
    >
      {/* Side-tinted top hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-colors duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${sideColor}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{symbol}</span>
        <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
          <span className="rounded-md bg-bid/10 px-1.5 py-0.5 text-bid">{nf2.format(bestBid)}</span>
          <span className="text-muted-foreground">/</span>
          <span className="rounded-md bg-ask/10 px-1.5 py-0.5 text-ask">{nf2.format(bestAsk)}</span>
        </span>
      </div>

      {stage === "form" || stage === "review" ? (
        <LayoutGroup id={uid}>
          {/* Side toggle */}
          <div className="isolate mt-4 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label="Order side">
            {(["buy", "sell"] as const).map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={side === s}
                onClick={() => setSide(s)}
                className={cn(
                  "relative rounded-lg py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200",
                  side === s ? "text-white" : "text-muted-foreground hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {side === s ? (
                  <motion.span
                    layoutId={`side-${uid}`}
                    transition={reduced ? { duration: 0 } : spring}
                    className="absolute inset-0 -z-10 rounded-lg shadow-sm"
                    style={{ background: s === "buy" ? "var(--market-up)" : "var(--market-down)" }}
                  />
                ) : null}
                {s}
              </button>
            ))}
          </div>

          {/* Order type */}
          <div className="isolate mt-2 flex gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label="Order type">
            {TYPES.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={type === t.key}
                onClick={() => setType(t.key)}
                className={cn(
                  "relative flex-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors duration-200",
                  type === t.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {type === t.key ? (
                  <motion.span
                    layoutId={`type-${uid}`}
                    transition={reduced ? { duration: 0 } : spring}
                    className="absolute inset-0 -z-10 rounded-lg bg-primary shadow-sm"
                  />
                ) : null}
                {t.label}
              </button>
            ))}
          </div>

          {/* Qty + prices */}
          <div className="mt-4 flex gap-2">
            <label className="flex w-28 flex-col gap-1.5 text-[11px] font-medium text-muted-foreground">
              Lots ({lotSize}/lot)
              <div className="flex h-10 items-stretch gap-1 rounded-xl border border-input bg-background p-1 shadow-xs">
                <button
                  type="button"
                  aria-label="Decrease lots"
                  onClick={() => setLots((l) => Math.max(1, l - 1))}
                  className="flex aspect-square items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="size-3.5" aria-hidden="true"><path d="M5 12h14" /></svg>
                </button>
                <span className="flex flex-1 items-center justify-center font-mono text-sm tabular-nums text-foreground">
                  {lots}
                </span>
                <button
                  type="button"
                  aria-label="Increase lots"
                  onClick={() => setLots((l) => Math.min(20, l + 1))}
                  className="flex aspect-square items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="size-3.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </label>
            {needsTrigger ? numField("Trigger", trigger, setTrigger) : null}
            {numField(
              type === "market" ? "Price (mkt)" : "Price",
              type === "market" ? nf2.format(effPrice) : price,
              setPrice,
              type === "market"
            )}
          </div>

          {/* Margin */}
          <div className="mt-4 flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">Margin required</span>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                overMargin ? "text-destructive" : "text-foreground"
              )}
            >
              <NumberFlow value={margin} prefix="₹" locale="en-IN" />
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/40" aria-hidden="true">
            <span
              className="block h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.min(100, (margin / availableMargin) * 100)}%`,
                background: overMargin
                  ? "linear-gradient(90deg, color-mix(in oklab, var(--destructive) 55%, transparent), var(--destructive))"
                  : `linear-gradient(90deg, color-mix(in oklab, ${sideColor} 50%, transparent), ${sideColor})`,
              }}
            />
          </div>
          <p className="mt-1.5 text-[11px] tabular-nums text-muted-foreground">
            Available ₹{inr(availableMargin)}
            {overMargin ? (
              <span className="ml-1 font-medium text-destructive">
                — exceeds margin, reduce quantity
              </span>
            ) : null}
          </p>

          {/* Charges */}
          <button
            type="button"
            aria-expanded={chargesOpen}
            onClick={() => setChargesOpen((o) => !o)}
            className="mt-3 flex w-full items-center justify-between rounded-lg py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>Charges ≈ ₹{inr(charges)}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn("size-3.5 transition-transform duration-300", chargesOpen && "rotate-180")} aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <div ref={chargesRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
            <dl className="flex flex-col gap-1 rounded-xl bg-muted/50 p-2.5 text-[11px] tabular-nums text-muted-foreground">
              <div className="flex justify-between"><dt>Brokerage</dt><dd>₹{brokerage}</dd></div>
              <div className="flex justify-between"><dt>STT</dt><dd>₹{inr(stt)}</dd></div>
              <div className="flex justify-between"><dt>Exchange + GST + stamp</dt><dd>₹{inr(other)}</dd></div>
            </dl>
          </div>

          {/* Action */}
          {stage === "form" ? (
            <Button
              className={cn(
                "mt-4 w-full text-white shadow-sm",
                side === "buy"
                  ? "bg-market-up hover:bg-market-up/90"
                  : "bg-market-down hover:bg-market-down/90"
              )}
              disabled={overMargin || (needsPrice && !parseFloat(price))}
              onClick={() => setStage("review")}
            >
              Review {side} order
            </Button>
          ) : (
            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-3.5">
              <p className="text-xs text-foreground">
                <span className={cn("font-semibold uppercase", side === "buy" ? "text-market-up" : "text-market-down")}>
                  {side}
                </span>{" "}
                {qty} {symbol} · {TYPES.find((t) => t.key === type)?.label}
                {needsPrice ? ` @ ₹${price}` : " @ market"}
                {needsTrigger ? ` · trigger ₹${trigger}` : ""}
              </p>
              <p className="text-[11px] tabular-nums text-muted-foreground">
                Margin ₹{inr(margin)} + charges ₹{inr(charges)}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setStage("form")}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    "flex-1 text-white",
                    side === "buy"
                      ? "bg-market-up hover:bg-market-up/90"
                      : "bg-market-down hover:bg-market-down/90"
                  )}
                  onClick={place}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </LayoutGroup>
      ) : (
        <FillState
          stage={stage}
          side={side}
          qty={qty}
          filled={filled}
          symbol={symbol}
          onReset={reset}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Placement / partial fill                                             */
/* ------------------------------------------------------------------ */

function FillState({
  stage,
  side,
  qty,
  filled,
  symbol,
  onReset,
}: {
  stage: Stage;
  side: "buy" | "sell";
  qty: number;
  filled: number;
  symbol: string;
  onReset: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const pct = Math.round((filled / qty) * 100);
  const sideColor = side === "buy" ? "var(--market-up)" : "var(--market-down)";

  useGSAP(
    () => {
      if (!ref.current) return;
      if (reduced) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power3.out", clearProps: "filter" }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="mt-5 flex flex-col items-center gap-3 py-2 text-center">
      <p className="text-sm font-medium text-foreground">
        {stage === "placing"
          ? "Placing order…"
          : stage === "filling"
            ? pct < 100
              ? "Partially filled"
              : "Filling…"
            : "Order complete"}
      </p>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/40"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={qty}
        aria-valuenow={filled}
        aria-label="Fill progress"
      >
        <span
          className="block h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${stage === "placing" ? 4 : pct}%`,
            background: `linear-gradient(90deg, color-mix(in oklab, ${sideColor} 55%, transparent), ${sideColor})`,
          }}
        />
      </div>
      <p className="text-xs tabular-nums text-muted-foreground">
        {filled}/{qty} {symbol}
        {stage === "filling" && pct < 100 ? " · working the rest at your limit" : ""}
      </p>
      {stage === "done" ? (
        <Button size="sm" variant="outline" onClick={onReset}>
          New order
        </Button>
      ) : null}
    </div>
  );
}
