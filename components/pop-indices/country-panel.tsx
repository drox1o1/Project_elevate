"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import type { CountryPrice } from "@/lib/pop-indices/types";

/**
 * The cross-country panel (PRD: "the burger should remain visually identical
 * while the currency, local price, tax treatment, wage affordability and menu
 * naming change around it").
 *
 * The interaction is the argument. The unit in the middle never moves — same
 * artwork, same patty, same index — and everything arranged around it swaps.
 * That is purchasing-power parity stated as a control: hold the good constant,
 * vary the economy, and read the difference.
 *
 * The one country where the product genuinely does not exist is on the panel
 * too. A standardised basket that quietly substitutes a different product
 * where the real one is missing is no longer standardised.
 */

export interface CountryPanelProps {
  countries: CountryPrice[];
  /** US price in USD — the denominator for the implied PPP rate. */
  usPrice: number;
  className?: string;
}

interface Reading {
  c: CountryPrice;
  /** Menu price converted at the market rate. */
  usd: number;
  /** Minutes of median-wage work per unit. */
  minutes: number;
  /** Local currency per USD implied by the two menu prices. */
  impliedRate: number;
  /** Percent over- (+) or under- (−) valued against the market rate. */
  valuation: number;
}

function read(c: CountryPrice, usPrice: number): Reading {
  const impliedRate = c.price / usPrice;
  return {
    c,
    usd: c.price / c.fxPerUsd,
    minutes: (c.price / c.medianHourlyWage) * 60,
    impliedRate,
    valuation: (impliedRate / c.fxPerUsd - 1) * 100,
  };
}

function money(c: CountryPrice, v: number) {
  const decimals = c.currency === "JPY" || c.currency === "INR" ? 0 : 2;
  return `${c.symbol}${v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function Stat({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="type-caption uppercase tracking-[0.08em] text-white/45">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-mono text-lg numeric sm:text-xl",
          accent ? "text-[var(--pop-accent)]" : "text-white"
        )}
      >
        {value}
      </dd>
      {note ? <p className="mt-0.5 type-caption text-white/40">{note}</p> : null}
    </div>
  );
}

export function CountryPanel({ countries, usPrice, className }: CountryPanelProps) {
  const reduced = useReducedMotion();
  const [code, setCode] = React.useState(countries[0]?.code ?? "US");
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  const readings = React.useMemo(
    () => countries.map((c) => read(c, usPrice)),
    [countries, usPrice]
  );
  const active = readings.find((r) => r.c.code === code) ?? readings[0];
  const available = readings.filter((r) => !r.c.unavailable);
  const maxMinutes = Math.max(...available.map((r) => r.minutes));

  const spring = reduced
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 380, damping: 34 } as const);

  return (
    <div className={cn("w-full", className)}>
      {/* --- country switcher --- */}
      <div
        role="radiogroup"
        aria-label="Country"
        className="flex flex-wrap gap-1 rounded-xl border border-white/12 bg-white/[0.04] p-1"
      >
        {readings.map((r) => {
          const on = r.c.code === code;
          return (
            <button
              key={r.c.code}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setCode(r.c.code)}
              className={cn(
                "relative rounded-lg px-3 py-1.5 font-mono type-caption uppercase tracking-[0.08em] transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                on ? "text-black" : "text-white/55 hover:text-white"
              )}
            >
              {on ? (
                <motion.span
                  layoutId={`pop-country-${uid}`}
                  className="absolute inset-0 rounded-lg bg-white"
                  transition={spring}
                />
              ) : null}
              <span className="relative">
                {r.c.code}
                {r.c.unavailable ? <span className="ml-1 opacity-60">—</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- the constant, and everything that is not --- */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
        <div>
          <p className="font-mono type-caption uppercase tracking-[0.14em] text-white/45">
            The unit never changes
          </p>
          {/* The name on the menu is the only thing about the product that does. */}
          <p
            aria-live="polite"
            className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-3xl"
          >
            {active.c.localName}
          </p>
          <p className="mt-2 type-meta text-white/50">
            {active.c.country} · {active.c.currency}
          </p>

          {active.c.unavailable ? (
            <div className="mt-6 rounded-xl border border-warning/40 bg-warning/10 p-4">
              <p className="type-title text-warning">Not sold in this market</p>
              <p className="mt-1.5 type-meta leading-6 text-white/60">{active.c.note}</p>
            </div>
          ) : (
            <>
              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5">
                <Stat label="Menu price" value={money(active.c, active.c.price)} accent />
                <Stat
                  label="At market rate"
                  value={`$${active.usd.toFixed(2)}`}
                  note={`${active.c.fxPerUsd} ${active.c.currency}/USD`}
                />
                <Stat
                  label="Minutes of work"
                  value={`${active.minutes.toFixed(1)} min`}
                  note="At median gross hourly wage"
                />
                <Stat
                  label="Implied PPP rate"
                  value={`${active.impliedRate.toFixed(3)}`}
                  note={`${active.c.currency} per USD, from the two menu prices`}
                />
              </dl>

              <div className="mt-6 rounded-xl border border-white/12 bg-white/[0.04] p-4">
                <p className="type-caption uppercase tracking-[0.08em] text-white/45">
                  Against the market rate
                </p>
                <p
                  className={cn(
                    "mt-1 font-mono text-xl numeric",
                    active.valuation >= 0 ? "text-market-up" : "text-market-down"
                  )}
                >
                  {active.valuation >= 0 ? "+" : "−"}
                  {Math.abs(active.valuation).toFixed(1)}%
                </p>
                <p className="mt-1.5 type-meta leading-6 text-white/55">
                  {active.c.code === "US"
                    ? "The base of the comparison, by definition."
                    : active.valuation >= 0
                      ? `The ${active.c.currency} looks overvalued against the dollar on this burger.`
                      : `The ${active.c.currency} looks undervalued against the dollar on this burger.`}
                </p>
              </div>

              {active.c.note ? (
                <p className="mt-4 type-meta leading-6 text-white/45">{active.c.note}</p>
              ) : null}
            </>
          )}
        </div>

        {/* --- the comparison that needs no exchange rate --- */}
        <div className="min-w-0">
          <p className="font-mono type-caption uppercase tracking-[0.14em] text-white/45">
            Minutes of work per burger
          </p>
          <p className="mt-2 max-w-sm type-meta leading-6 text-white/50">
            The only column here that compares cleanly without an exchange rate.
            Switzerland has the dearest burger in dollars and one of the
            cheapest in working time.
          </p>

          <ul className="mt-5 flex flex-col gap-3">
            {available
              .slice()
              .sort((a, b) => a.minutes - b.minutes)
              .map((r) => {
                const on = r.c.code === code;
                return (
                  <li key={r.c.code}>
                    <button
                      type="button"
                      onClick={() => setCode(r.c.code)}
                      className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          className={cn(
                            "type-label transition-colors duration-200",
                            on ? "text-white" : "text-white/55 group-hover:text-white/80"
                          )}
                        >
                          {r.c.country}
                        </span>
                        <span className="font-mono type-meta text-white/70 numeric">
                          {r.minutes.toFixed(1)} min
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.span
                          className="block h-full rounded-full"
                          style={{
                            background: on
                              ? "var(--pop-accent)"
                              : "rgb(255 255 255 / 0.35)",
                          }}
                          initial={false}
                          animate={{ width: `${(r.minutes / maxMinutes) * 100}%` }}
                          transition={spring}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
          </ul>

          <p className="mt-6 type-caption leading-5 text-white/35">
            European and Japanese prices include VAT or consumption tax; US
            prices exclude sales tax. Wages are gross of tax and social
            contributions, which would reorder several rows on a take-home
            basis.
          </p>
        </div>
      </div>
    </div>
  );
}
