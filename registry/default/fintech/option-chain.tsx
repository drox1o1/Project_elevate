"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import {
  blackScholes,
  smileIv,
} from "@/registry/default/lib/black-scholes";

/* ------------------------------------------------------------------ */
/* Data model + example-data generator                                  */
/* ------------------------------------------------------------------ */

export interface OptionQuote {
  ltp: number;
  /** Percent change on the day. */
  chg: number;
  oi: number;
  chgOi: number;
  volume: number;
  /** Implied volatility as a fraction, e.g. 0.14. */
  iv: number;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface OptionChainRow {
  strike: number;
  call: OptionQuote;
  put: OptionQuote;
}

/** Deterministic pseudo-random in [0,1) seeded by strike + salt. */
const prand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export interface GenerateOptionChainOptions {
  spot: number;
  /** Strike interval. Default 50 (NIFTY). */
  step?: number;
  /** Strikes on each side of ATM. Default 8. */
  span?: number;
  /** Days to expiry. Default 7. */
  dte?: number;
}

/** Coherent example data: premiums and Greeks come from Black-Scholes. */
export function generateOptionChain({
  spot,
  step = 50,
  span = 8,
  dte = 7,
}: GenerateOptionChainOptions): OptionChainRow[] {
  const atm = Math.round(spot / step) * step;
  const t = dte / 365;
  const rows: OptionChainRow[] = [];
  for (let i = -span; i <= span; i++) {
    const strike = atm + i * step;
    const iv = smileIv(spot, strike);
    const quote = (side: "call" | "put"): OptionQuote => {
      const g = blackScholes({ s: spot, k: strike, t, iv, side });
      const salt = strike + (side === "call" ? 1 : 2) * 1000 + dte;
      const near = Math.exp(-Math.abs(strike - spot) / (step * 4));
      const ltp = Math.max(0.05, g.price);
      const spread = Math.max(0.05, ltp * 0.004 + 0.05);
      return {
        ltp,
        chg: (prand(salt) - (side === "call" ? 0.45 : 0.55)) * 18,
        oi: Math.round((0.4 + near) * (1.5 + prand(salt + 1)) * 2_000_000),
        chgOi: Math.round((prand(salt + 2) - 0.45) * 900_000),
        volume: Math.round((0.3 + near) * (1 + prand(salt + 3)) * 1_500_000),
        iv,
        bid: ltp - spread / 2,
        ask: ltp + spread / 2,
        bidQty: Math.round((1 + prand(salt + 4) * 9) * 75),
        askQty: Math.round((1 + prand(salt + 5) * 9) * 75),
        delta: g.delta,
        gamma: g.gamma,
        theta: g.theta,
        vega: g.vega,
      };
    };
    rows.push({ strike, call: quote("call"), put: quote("put") });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                           */
/* ------------------------------------------------------------------ */

const nf0 = new Intl.NumberFormat("en-IN");
const nf2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const compactOi = (n: number) =>
  Math.abs(n) >= 100_000
    ? `${(n / 100_000).toFixed(1)}L`
    : Math.abs(n) >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : nf0.format(n);

/* ------------------------------------------------------------------ */
/* Tick cell: restrained directional flash when a value changes         */
/* ------------------------------------------------------------------ */

function TickNum({
  value,
  format = nf2.format,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const prev = React.useRef(value);
  const [dir, setDir] = React.useState<"up" | "down" | null>(null);

  React.useEffect(() => {
    if (reduced || value === prev.current) {
      prev.current = value;
      return;
    }
    setDir(value > prev.current ? "up" : "down");
    prev.current = value;
    const t = setTimeout(() => setDir(null), 600);
    return () => clearTimeout(t);
  }, [value, reduced]);

  return (
    <span
      className={cn(
        "tabular-nums transition-colors duration-500",
        dir === "up" && "text-market-up",
        dir === "down" && "text-market-down",
        className
      )}
    >
      {format(value)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Option chain                                                         */
/* ------------------------------------------------------------------ */

export interface OptionOrder {
  side: "call" | "put";
  action: "buy" | "sell";
  strike: number;
  price: number;
}

export interface OptionChainProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "rows"> {
  rows: OptionChainRow[];
  spot: number;
  /** Lot size shown in the depth panel. Default 75 (NIFTY). */
  lotSize?: number;
  expiries?: string[];
  expiry?: string;
  onExpiryChange?: (expiry: string) => void;
  /** Start with Greek columns instead of OI/volume. */
  defaultShowGreeks?: boolean;
  /** Fewer columns for narrow containers. */
  compact?: boolean;
  onOrder?: (order: OptionOrder) => void;
  ref?: React.Ref<HTMLDivElement>;
}

interface ColumnDef {
  key: string;
  label: string;
  cell: (q: OptionQuote) => React.ReactNode;
}

export function OptionChain({
  rows,
  spot,
  lotSize = 75,
  expiries,
  expiry,
  onExpiryChange,
  defaultShowGreeks = false,
  compact = false,
  onOrder,
  className,
  ref,
  ...rest
}: OptionChainProps) {
  const reduced = useReducedMotion();
  const [showGreeks, setShowGreeks] = React.useState(defaultShowGreeks);
  const [expanded, setExpanded] = React.useState<number | null>(null);

  const atmStrike = React.useMemo(() => {
    let best = rows[0]?.strike ?? 0;
    for (const r of rows)
      if (Math.abs(r.strike - spot) < Math.abs(best - spot)) best = r.strike;
    return best;
  }, [rows, spot]);

  const maxOi = React.useMemo(
    () => Math.max(1, ...rows.flatMap((r) => [r.call.oi, r.put.oi])),
    [rows]
  );

  const columns: ColumnDef[] = React.useMemo(() => {
    if (compact)
      return [
        { key: "oi", label: "OI", cell: (q) => compactOi(q.oi) },
        { key: "ltp", label: "LTP", cell: (q) => <TickNum value={q.ltp} /> },
      ];
    if (showGreeks)
      return [
        { key: "delta", label: "Δ", cell: (q) => <TickNum value={q.delta} format={(n) => n.toFixed(2)} /> },
        { key: "gamma", label: "Γ", cell: (q) => <TickNum value={q.gamma} format={(n) => n.toFixed(4)} /> },
        { key: "theta", label: "Θ", cell: (q) => <TickNum value={q.theta} format={(n) => n.toFixed(2)} /> },
        { key: "vega", label: "V", cell: (q) => <TickNum value={q.vega} format={(n) => n.toFixed(2)} /> },
        { key: "ltp", label: "LTP", cell: (q) => <TickNum value={q.ltp} /> },
      ];
    return [
      { key: "oi", label: "OI", cell: (q) => compactOi(q.oi) },
      {
        key: "chgOi",
        label: "Chg OI",
        cell: (q) => (
          <span className={q.chgOi >= 0 ? "text-market-up" : "text-market-down"}>
            {q.chgOi >= 0 ? "+" : ""}
            {compactOi(q.chgOi)}
          </span>
        ),
      },
      { key: "volume", label: "Vol", cell: (q) => compactOi(q.volume) },
      { key: "iv", label: "IV", cell: (q) => `${(q.iv * 100).toFixed(1)}%` },
      { key: "ltp", label: "LTP", cell: (q) => <TickNum value={q.ltp} /> },
      {
        key: "chg",
        label: "Chg%",
        cell: (q) => (
          <TickNum
            value={q.chg}
            format={(n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`}
            className={q.chg >= 0 ? "text-market-up" : "text-market-down"}
          />
        ),
      },
    ];
  }, [compact, showGreeks]);

  const toggleRow = (strike: number) =>
    setExpanded((e) => (e === strike ? null : strike));

  const oiBar = (q: OptionQuote, side: "call" | "put") => {
    const pct = Math.round((q.oi / maxOi) * 100);
    const color = side === "call" ? "var(--bid)" : "var(--ask)";
    return {
      backgroundImage: `linear-gradient(to ${side === "call" ? "left" : "right"}, color-mix(in oklab, ${color} 26%, transparent) 0%, color-mix(in oklab, ${color} 9%, transparent) ${pct}%, transparent ${pct}%)`,
    };
  };

  return (
    <div
      ref={ref}
      data-slot="option-chain"
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-sm shadow-md",
        className
      )}
      {...rest}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Spot
          </span>
          <TickNum value={spot} className="text-sm font-semibold" />
        </div>
        {expiries && expiries.length > 0 ? (
          <div
            role="tablist"
            aria-label="Expiry"
            className="flex items-center gap-1 rounded-lg bg-muted p-0.5"
          >
            {expiries.map((e) => (
              <button
                key={e}
                role="tab"
                aria-selected={e === expiry}
                onClick={() => onExpiryChange?.(e)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors duration-200",
                  e === expiry
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        ) : null}
        {!compact ? (
          <button
            type="button"
            aria-pressed={showGreeks}
            onClick={() => setShowGreeks((g) => !g)}
            className={cn(
              "rounded-md border border-border px-2.5 py-1 text-xs font-medium transition-colors duration-200",
              showGreeks
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            Greeks
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-right text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th
                colSpan={columns.length}
                className="px-3 pb-1 pt-2 text-center font-medium text-bid"
              >
                Calls
              </th>
              <th className="px-3 pb-1 pt-2 text-center font-medium">Strike</th>
              <th
                colSpan={columns.length}
                className="px-3 pb-1 pt-2 text-center font-medium text-ask"
              >
                Puts
              </th>
            </tr>
            <tr className="border-b border-border text-[11px] text-muted-foreground">
              {columns.map((c) => (
                <th key={`c-${c.key}`} className="px-3 py-1.5 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-1.5 text-center font-medium">₹</th>
              {[...columns].reverse().map((c) => (
                <th key={`p-${c.key}`} className="px-3 py-1.5 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isAtm = row.strike === atmStrike;
              const callItm = row.strike < spot;
              const putItm = row.strike > spot;
              const isOpen = expanded === row.strike;
              return (
                <React.Fragment key={row.strike}>
                  <tr
                    tabIndex={0}
                    role="button"
                    aria-expanded={isOpen}
                    aria-label={`Strike ${row.strike}, ${isAtm ? "at the money, " : ""}call ${nf2.format(row.call.ltp)}, put ${nf2.format(row.put.ltp)}`}
                    onClick={() => toggleRow(row.strike)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleRow(row.strike);
                      }
                    }}
                    className={cn(
                      "cursor-pointer border-b border-border/60 transition-colors duration-150",
                      isAtm
                        ? "bg-accent/80 font-medium"
                        : "hover:bg-muted/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    )}
                  >
                    {columns.map((c, i) => (
                      <td
                        key={`c-${c.key}`}
                        className={cn(
                          "relative px-3 py-1.5",
                          callItm && "bg-bid/5"
                        )}
                      >
                        {i === 0 && !compact ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1 right-0 left-0"
                            style={oiBar(row.call, "call")}
                          />
                        ) : null}
                        <span className="relative">{c.cell(row.call)}</span>
                      </td>
                    ))}
                    <td
                      className={cn(
                        "px-3 py-1.5 text-center font-semibold tabular-nums",
                        isAtm && "text-foreground"
                      )}
                    >
                      {nf0.format(row.strike)}
                      {isAtm ? (
                        <span className="ml-1 rounded bg-primary px-1 py-px text-[9px] font-semibold uppercase text-primary-foreground">
                          ATM
                        </span>
                      ) : null}
                    </td>
                    {[...columns].reverse().map((c, i) => (
                      <td
                        key={`p-${c.key}`}
                        className={cn(
                          "relative px-3 py-1.5",
                          putItm && "bg-ask/5"
                        )}
                      >
                        {i === columns.length - 1 && !compact ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1 left-0 right-0"
                            style={oiBar(row.put, "put")}
                          />
                        ) : null}
                        <span className="relative">{c.cell(row.put)}</span>
                      </td>
                    ))}
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-border/60 bg-muted/30">
                      <td colSpan={columns.length * 2 + 1} className="p-0">
                        <DepthPanel
                          row={row}
                          lotSize={lotSize}
                          reduced={reduced}
                          onOrder={onOrder}
                        />
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
        Lot size {lotSize} · click a strike for depth and orders · simulated
        data
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Depth + order panel (expands in context under the strike row)        */
/* ------------------------------------------------------------------ */

function DepthPanel({
  row,
  lotSize,
  reduced,
  onOrder,
}: {
  row: OptionChainRow;
  lotSize: number;
  reduced: boolean;
  onOrder?: (order: OptionOrder) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (reduced) {
        gsap.set(ref.current, { height: "auto", opacity: 1 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
          clearProps: "height",
        }
      );
    },
    { scope: ref }
  );

  const side = (label: "call" | "put", q: OptionQuote) => (
    <div className="flex-1 rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            label === "call" ? "text-bid" : "text-ask"
          )}
        >
          {label} {nf0.format(row.strike)}
        </span>
        <span className="text-xs text-muted-foreground">
          Δ {q.delta.toFixed(2)} · Θ {q.theta.toFixed(2)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-[13px] tabular-nums">
        <div className="rounded-md bg-bid/10 px-2 py-1.5">
          <p className="text-[10px] uppercase text-muted-foreground">
            Bid × {q.bidQty}
          </p>
          <p className="font-medium text-bid">{nf2.format(q.bid)}</p>
        </div>
        <div className="rounded-md bg-ask/10 px-2 py-1.5">
          <p className="text-[10px] uppercase text-muted-foreground">
            Ask × {q.askQty}
          </p>
          <p className="font-medium text-ask">{nf2.format(q.ask)}</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            onOrder?.({ side: label, action: "buy", strike: row.strike, price: q.ask })
          }
          className="rounded-md bg-market-up px-2 py-1.5 text-xs font-semibold text-white transition-transform duration-100 active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Buy ({lotSize})
        </button>
        <button
          type="button"
          onClick={() =>
            onOrder?.({ side: label, action: "sell", strike: row.strike, price: q.bid })
          }
          className="rounded-md bg-market-down px-2 py-1.5 text-xs font-semibold text-white transition-transform duration-100 active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sell ({lotSize})
        </button>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="overflow-hidden">
      <div className="flex flex-col gap-3 p-3 sm:flex-row">
        {side("call", row.call)}
        {side("put", row.put)}
      </div>
    </div>
  );
}
