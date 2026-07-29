"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import {
  chartSummary,
  convertIncomeTime,
  formatCompactCurrency,
  formatMoney,
  formatPercent,
  incomeUnitFor,
  transformSeries,
  type ChartMode,
  type ChartPoint,
  type MoneyFormat,
} from "@/lib/pop-ppp/calc";
import type { ChartEvent, Series } from "@/lib/pop-ppp/types";

/**
 * The primary time-series chart (PRD §14.1).
 *
 * Reading modes rather than decoration: the same object, expressed as money
 * of the day, money of today, months of income, quantity bought, or
 * cumulative percentage. Switching mode answers a different question, which
 * is why the selector is part of the chart rather than a settings panel.
 *
 * Accessibility is not a layer on top — the SVG is a single focusable image
 * with a text summary, arrow keys walk the series, and the focused
 * observation is announced through a live region. Imputed segments are
 * dashed and provisional points are hollow, so an estimate never renders as
 * an observation.
 *
 * Motion ownership: Motion owns the mode indicator and the value transition.
 * There is no scroll-driven animation here — a chart that animates before
 * its axes can be read is a chart nobody can read.
 */

const MODE_LABELS: Record<ChartMode, string> = {
  nominal: "Nominal",
  real: "Inflation adjusted",
  income: "Relative to income",
  quantity: "Quantity bought",
  percent: "Percentage change",
};

const MODE_HELP: Record<ChartMode, string> = {
  nominal: "Value in the currency of the day, unadjusted.",
  real: "Every year restated in the latest year's money using CPI.",
  income: "How much average earning time the object costs.",
  quantity: "How much of the underlying unit the base-year outlay buys.",
  percent: "Cumulative change against the base year.",
};

export interface IndexChartProps {
  title: string;
  priceSeries: Series;
  unitFactor: number;
  baseYear: number;
  /**
   * How money is written for this index. Carries the "$ millions" case, so a
   * $8.60M-per-WAR figure never renders as `$8.60`.
   */
  moneyFormat: MoneyFormat;
  currencySymbol: string;
  locale?: string;
  cpiSeries?: Series;
  incomeSeries?: Series;
  /** Second line, shown in nominal mode only. */
  comparisonSeries?: Series;
  comparisonUnitFactor?: number;
  events?: ChartEvent[];
  /** Unit label used by the "quantity bought" mode. */
  quantityUnit?: string;
  accent: { light: string; dark: string };
  className?: string;
}

const PAD = { top: 24, right: 16, bottom: 34, left: 62 };

export function IndexChart({
  title,
  priceSeries,
  unitFactor,
  baseYear,
  moneyFormat,
  currencySymbol,
  locale = "en-IN",
  cpiSeries,
  incomeSeries,
  comparisonSeries,
  comparisonUnitFactor = 1,
  events = [],
  quantityUnit,
  accent,
  className,
}: IndexChartProps) {
  const reduced = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(720);
  const [mode, setMode] = React.useState<ChartMode>("nominal");
  const [cursor, setCursor] = React.useState<number | null>(null);
  const [showEvents, setShowEvents] = React.useState(true);

  const height = width < 520 ? 240 : 300;

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* --- available modes -------------------------------------------------- */

  const modes = React.useMemo(() => {
    const list: ChartMode[] = ["nominal"];
    if (cpiSeries) list.push("real");
    if (incomeSeries) list.push("income");
    list.push("quantity", "percent");
    return list;
  }, [cpiSeries, incomeSeries]);

  /* --- data ------------------------------------------------------------ */

  const rawPoints = React.useMemo(
    () =>
      transformSeries(
        { series: priceSeries, unitFactor, baseYear, cpi: cpiSeries, income: incomeSeries },
        mode
      ),
    [priceSeries, unitFactor, baseYear, cpiSeries, incomeSeries, mode]
  );

  /**
   * Income mode picks its unit from the largest value in view — months for a
   * gold chain, hours for a kilogram of okra — so the axis carries readable
   * numbers instead of three leading zeroes.
   */
  const incomeUnit = React.useMemo(
    () =>
      mode === "income" && rawPoints.length > 0
        ? incomeUnitFor(Math.max(...rawPoints.map((p) => p.value)))
        : "months",
    [mode, rawPoints]
  );

  const points = React.useMemo(
    () =>
      mode === "income"
        ? rawPoints.map((p) => ({
            ...p,
            value: convertIncomeTime(p.value, incomeUnit),
          }))
        : rawPoints,
    [mode, rawPoints, incomeUnit]
  );

  const comparison = React.useMemo(() => {
    if (mode !== "nominal" || !comparisonSeries) return null;
    return transformSeries(
      { series: comparisonSeries, unitFactor: comparisonUnitFactor, baseYear },
      "nominal"
    );
  }, [mode, comparisonSeries, comparisonUnitFactor, baseYear]);

  /* --- formatting ------------------------------------------------------ */

  const formatValue = React.useCallback(
    (n: number) => {
      switch (mode) {
        case "income":
          return `${n.toLocaleString(locale, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} ${incomeUnit}`;
        case "quantity":
          return `${n.toLocaleString(locale, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}${quantityUnit ? ` ${quantityUnit}` : ""}`;
        case "percent":
          return formatPercent(n);
        default:
          return formatMoney(moneyFormat, n);
      }
    },
    [mode, moneyFormat, locale, quantityUnit, incomeUnit]
  );

  const formatTick = React.useCallback(
    (n: number) => {
      switch (mode) {
        case "income":
          return n.toLocaleString(locale, { maximumFractionDigits: 1 });
        case "quantity":
          return n.toLocaleString(locale, { maximumFractionDigits: 1 });
        case "percent":
          return `${Math.round(n)}%`;
        default:
          // Series already quoted in millions are small numbers — compacting
          // them again would turn $8.60M into $8.6.
          return moneyFormat.kind === "millions"
            ? formatMoney(moneyFormat, n)
            : formatCompactCurrency(n, currencySymbol, locale);
      }
    },
    [mode, moneyFormat, currencySymbol, locale]
  );

  /* --- scales ---------------------------------------------------------- */

  const scale = React.useMemo(() => {
    const all = [...points, ...(comparison ?? [])];
    const years = points.map((p) => p.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    let minV = Math.min(...all.map((p) => p.value));
    let maxV = Math.max(...all.map((p) => p.value));
    // Percentage mode is read against zero, so zero must be on the axis.
    if (mode === "percent") minV = Math.min(0, minV);
    if (minV === maxV) {
      minV -= 1;
      maxV += 1;
    }
    const span = maxV - minV;
    const lo = mode === "percent" ? minV : Math.max(0, minV - span * 0.12);
    const hi = maxV + span * 0.12;

    const innerW = width - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    const x = (year: number) =>
      PAD.left + ((year - minYear) / Math.max(1, maxYear - minYear)) * innerW;
    const y = (v: number) =>
      PAD.top + (1 - (v - lo) / (hi - lo)) * innerH;

    return { x, y, minYear, maxYear, lo, hi, innerW, innerH };
  }, [points, comparison, width, height, mode]);

  /** Four horizontal gridlines, on values the reader can name. */
  const yTicks = React.useMemo(() => {
    const { lo, hi } = scale;
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => lo + ((hi - lo) * i) / count);
  }, [scale]);

  const xTicks = React.useMemo(() => {
    const { minYear, maxYear } = scale;
    const span = maxYear - minYear;
    const step = width < 520 ? Math.ceil(span / 4) : Math.ceil(span / 7);
    const out: number[] = [];
    for (let y = minYear; y <= maxYear; y += step) out.push(y);
    if (out[out.length - 1] !== maxYear) out.push(maxYear);
    return out;
  }, [scale, width]);

  /**
   * Split the line into segments so a gap in the data reads as a gap.
   * A segment touching an imputed point is dashed (PRD §26).
   */
  const segments = React.useMemo(() => {
    const out: { d: string; dashed: boolean }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      // A jump of more than one year is a real hole in the series.
      const gap = b.year - a.year > 1;
      out.push({
        d: `M ${scale.x(a.year)} ${scale.y(a.value)} L ${scale.x(b.year)} ${scale.y(b.value)}`,
        dashed: gap || a.imputed || b.imputed,
      });
    }
    return out;
  }, [points, scale]);

  const areaPath = React.useMemo(() => {
    if (points.length < 2) return "";
    const top = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${scale.x(p.year)} ${scale.y(p.value)}`)
      .join(" ");
    const baseline = scale.y(mode === "percent" ? 0 : scale.lo);
    return `${top} L ${scale.x(points[points.length - 1].year)} ${baseline} L ${scale.x(points[0].year)} ${baseline} Z`;
  }, [points, scale, mode]);

  const comparisonPath = React.useMemo(() => {
    if (!comparison || comparison.length < 2) return "";
    return comparison
      .map((p, i) => `${i === 0 ? "M" : "L"} ${scale.x(p.year)} ${scale.y(p.value)}`)
      .join(" ");
  }, [comparison, scale]);

  /* --- interaction ----------------------------------------------------- */

  const nearestIndex = React.useCallback(
    (clientX: number) => {
      const svg = wrapRef.current?.querySelector("svg");
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const px = clientX - rect.left;
      let best = 0;
      let bestDist = Infinity;
      points.forEach((p, i) => {
        const d = Math.abs(scale.x(p.year) - px);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    },
    [points, scale]
  );

  const onPointer = (e: React.PointerEvent) => {
    const i = nearestIndex(e.clientX);
    if (i != null) setCursor(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = points.length - 1;
    const cur = cursor ?? last;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = Math.min(last, cur + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, cur - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else if (e.key === "Escape") {
      setCursor(null);
      return;
    }
    if (next != null) {
      e.preventDefault();
      setCursor(next);
    }
  };

  const activePoint: ChartPoint | null = cursor != null ? points[cursor] : null;
  const activeComparison =
    activePoint && comparison
      ? comparison.find((c) => c.year === activePoint.year) ?? null
      : null;

  const summary = React.useMemo(
    () => chartSummary(title, points, formatValue),
    [title, points, formatValue]
  );

  const baseOnChart = points.find((p) => p.year === baseYear) ?? null;
  const latest = points[points.length - 1] ?? null;
  const visibleEvents = showEvents
    ? events.filter((ev) => points.some((p) => p.year === ev.year))
    : [];

  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <figure
      className={cn("m-0", className)}
      style={
        {
          "--pop-accent": accent.light,
        } as React.CSSProperties
      }
    >
      {/* Accent flips with the theme without a second component. */}
      <style>{`.dark [data-pop-chart="${uid}"]{--pop-accent:${accent.dark}}`}</style>

      <div data-pop-chart={uid}>
        {/* --- controls --- */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div
            role="radiogroup"
            aria-label="Reading mode"
            className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1"
          >
            {modes.map((m) => {
              const on = m === mode;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  title={MODE_HELP[m]}
                  onClick={() => setMode(m)}
                  className={cn(
                    "relative rounded-md px-2.5 py-1 type-caption font-medium transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on ? "text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {on ? (
                    <motion.span
                      layoutId={`pop-mode-${uid}`}
                      className="absolute inset-0 rounded-md bg-foreground"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  ) : null}
                  <span className="relative">{MODE_LABELS[m]}</span>
                </button>
              );
            })}
          </div>

          {events.length > 0 ? (
            <label className="flex cursor-pointer items-center gap-1.5 type-caption text-muted-foreground">
              <input
                type="checkbox"
                checked={showEvents}
                onChange={(e) => setShowEvents(e.target.checked)}
                className="size-3.5 accent-[var(--pop-accent)]"
              />
              Event markers
            </label>
          ) : null}
        </div>

        <p className="mb-3 type-meta text-muted-foreground">{MODE_HELP[mode]}</p>

        {/* --- plot --- */}
        <div ref={wrapRef} className="relative w-full">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            tabIndex={0}
            aria-label={summary}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={() => setCursor(null)}
            onKeyDown={onKeyDown}
            onBlur={() => setCursor(null)}
            className="block w-full touch-pan-y rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <defs>
              <linearGradient id={`pop-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--pop-accent)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--pop-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* gridlines + y axis */}
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={scale.y(t)}
                  y2={scale.y(t)}
                  stroke="var(--border)"
                  strokeWidth={1}
                  opacity={0.7}
                />
                <text
                  x={PAD.left - 8}
                  y={scale.y(t)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground font-mono text-[10px] numeric"
                >
                  {formatTick(t)}
                </text>
              </g>
            ))}

            {/* zero rule, when the axis crosses it */}
            {mode === "percent" && scale.lo < 0 ? (
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={scale.y(0)}
                y2={scale.y(0)}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
              />
            ) : null}

            {/* x axis */}
            {xTicks.map((yr) => (
              <text
                key={yr}
                x={scale.x(yr)}
                y={height - PAD.bottom + 16}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[10px] numeric"
              >
                {yr}
              </text>
            ))}

            {/* base-year marker */}
            {baseOnChart ? (
              <g>
                <line
                  x1={scale.x(baseYear)}
                  x2={scale.x(baseYear)}
                  y1={PAD.top}
                  y2={height - PAD.bottom}
                  stroke="var(--muted-foreground)"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                  opacity={0.8}
                />
                <text
                  x={scale.x(baseYear) + 5}
                  y={PAD.top - 8}
                  className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.08em]"
                >
                  Base {baseYear}
                </text>
              </g>
            ) : null}

            {/* event annotations */}
            {visibleEvents.map((ev) => (
              <g key={`${ev.year}-${ev.label}`}>
                <line
                  x1={scale.x(ev.year)}
                  x2={scale.x(ev.year)}
                  y1={height - PAD.bottom}
                  y2={height - PAD.bottom - 8}
                  stroke="var(--muted-foreground)"
                  strokeWidth={1.5}
                />
                <title>{`${ev.year}: ${ev.label}`}</title>
              </g>
            ))}

            {/* area + line */}
            <path d={areaPath} fill={`url(#pop-fill-${uid})`} />

            {comparisonPath ? (
              <path
                d={comparisonPath}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                opacity={0.9}
              />
            ) : null}

            {segments.map((s, i) => (
              <path
                key={i}
                d={s.d}
                fill="none"
                stroke="var(--pop-accent)"
                strokeWidth={2.25}
                strokeLinecap="round"
                strokeDasharray={s.dashed ? "4 4" : undefined}
              />
            ))}

            {/* latest observation — hollow when provisional */}
            {latest ? (
              <circle
                cx={scale.x(latest.year)}
                cy={scale.y(latest.value)}
                r={4}
                fill={latest.provisional ? "var(--background)" : "var(--pop-accent)"}
                stroke="var(--pop-accent)"
                strokeWidth={2}
              />
            ) : null}

            {/* crosshair */}
            {activePoint ? (
              <g>
                <line
                  x1={scale.x(activePoint.year)}
                  x2={scale.x(activePoint.year)}
                  y1={PAD.top}
                  y2={height - PAD.bottom}
                  stroke="var(--pop-accent)"
                  strokeWidth={1}
                  opacity={0.5}
                />
                <circle
                  cx={scale.x(activePoint.year)}
                  cy={scale.y(activePoint.value)}
                  r={5}
                  fill="var(--background)"
                  stroke="var(--pop-accent)"
                  strokeWidth={2.5}
                />
              </g>
            ) : null}
          </svg>

          {/* tooltip — locks in place on tap, follows focus on keyboard */}
          {activePoint ? (
            <div
              className={cn(
                "pointer-events-none absolute z-10 min-w-[10rem] rounded-lg border border-border bg-popover p-2.5 shadow-popover",
                "transition-[left,top] duration-100"
              )}
              style={{
                left: Math.min(
                  Math.max(scale.x(activePoint.year) - 80, 4),
                  Math.max(4, width - 172)
                ),
                top: Math.max(4, scale.y(activePoint.value) - 84),
              }}
            >
              <p className="font-mono type-caption uppercase tracking-[0.08em] text-muted-foreground">
                {activePoint.year}
                {activePoint.year === baseYear ? " · base year" : ""}
              </p>
              <p className="mt-0.5 type-title text-foreground numeric">
                {formatValue(activePoint.value)}
              </p>
              {activeComparison ? (
                <p className="mt-1 type-caption text-muted-foreground numeric">
                  {comparisonSeries?.label}: {formatValue(activeComparison.value)}
                </p>
              ) : null}
              {activePoint.imputed ? (
                <p className="mt-1 type-caption text-warning">
                  No verified observation — interpolated between adjacent years.
                </p>
              ) : null}
              {activePoint.provisional ? (
                <p className="mt-1 type-caption text-warning">
                  Provisional. Not yet a final published figure.
                </p>
              ) : null}
              {visibleEvents
                .filter((ev) => ev.year === activePoint.year)
                .map((ev) => (
                  <p key={ev.label} className="mt-1 type-caption text-muted-foreground">
                    {ev.label}
                  </p>
                ))}
            </div>
          ) : null}
        </div>

        {/* keyboard hint + live announcement */}
        <p className="mt-2 type-caption text-muted-foreground">
          Focus the chart and use ← → to walk the series, Home and End for the
          ends, Escape to clear.
        </p>
        <p aria-live="polite" className="sr-only">
          {activePoint
            ? `${activePoint.year}: ${formatValue(activePoint.value)}${
                activePoint.imputed ? ", interpolated" : ""
              }${activePoint.provisional ? ", provisional" : ""}`
            : ""}
        </p>

        {/* legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 type-caption text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4"
              style={{ background: "var(--pop-accent)" }}
            />
            {priceSeries.label}
          </span>
          {comparisonPath && comparisonSeries ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0 w-4 border-t border-dashed border-muted-foreground" />
              {comparisonSeries.label}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0 w-4 border-t-2 border-dashed border-[var(--pop-accent)]" />
            Interpolated
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full border-2 border-[var(--pop-accent)] bg-background" />
            Provisional
          </span>
        </div>

        {/* the text equivalent, visible rather than hidden */}
        <figcaption className="mt-4 border-t border-border pt-3 type-meta leading-6 text-muted-foreground">
          {summary}
        </figcaption>
      </div>
    </figure>
  );
}
