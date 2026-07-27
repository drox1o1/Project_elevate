"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface BiomarkerReading {
  date: string; // ISO date
  value: number;
}

export interface BiomarkerEvent {
  date: string;
  label: string;
}

export interface BiomarkerTrendProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  unit: string;
  readings: BiomarkerReading[];
  /** Laboratory reference range in primary units. */
  range: { low: number; high: number };
  /** Personal baseline (median of historical normals). */
  baseline?: number;
  events?: BiomarkerEvent[];
  /** Optional secondary unit, e.g. mmol/L for a mg/dL marker. */
  altUnit?: { unit: string; factor: number };
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_LDL: Omit<BiomarkerTrendProps, keyof React.HTMLAttributes<HTMLDivElement>> = {
  name: "LDL cholesterol",
  unit: "mg/dL",
  range: { low: 50, high: 130 },
  baseline: 112,
  altUnit: { unit: "mmol/L", factor: 0.02586 },
  readings: [
    { date: "2025-01-14", value: 118 },
    { date: "2025-03-02", value: 127 },
    { date: "2025-05-20", value: 149 },
    { date: "2025-07-11", value: 158 },
    { date: "2025-09-05", value: 141 },
    { date: "2025-11-19", value: 122 },
    { date: "2026-01-24", value: 108 },
    { date: "2026-04-02", value: 101 },
  ],
  events: [{ date: "2025-08-01", label: "Statin started" }],
};

const short = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });

/* ------------------------------------------------------------------ */
/* Explorer                                                             */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 220;
const PAD = { l: 40, r: 12, t: 14, b: 26 };

export function BiomarkerTrend({
  name,
  unit,
  readings,
  range,
  baseline,
  events = [],
  altUnit,
  className,
  ref,
  ...rest
}: BiomarkerTrendProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const areaRef = React.useRef<SVGPathElement>(null);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [useAlt, setUseAlt] = React.useState(false);
  const [selected, setSelected] = React.useState<number | null>(
    readings.length - 1
  );

  const factor = useAlt && altUnit ? altUnit.factor : 1;
  const displayUnit = useAlt && altUnit ? altUnit.unit : unit;
  const decimals = useAlt && altUnit ? 2 : 0;
  const fmtVal = (v: number) => (v * factor).toFixed(decimals);

  const t0 = new Date(readings[0].date).getTime();
  const t1 = new Date(readings[readings.length - 1].date).getTime();
  const values = readings.map((r) => r.value);
  const vMin = Math.min(...values, range.low) * 0.9;
  const vMax = Math.max(...values, range.high) * 1.06;

  const x = (iso: string) =>
    PAD.l + ((new Date(iso).getTime() - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
  const y = (v: number) =>
    H - PAD.b - ((v - vMin) / (vMax - vMin)) * (H - PAD.t - PAD.b);

  const line = readings
    .map((r, i) => `${i === 0 ? "M" : "L"}${x(r.date).toFixed(1)},${y(r.value).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(readings[readings.length - 1].date).toFixed(1)},${(H - PAD.b).toFixed(1)} L${x(readings[0].date).toFixed(1)},${(H - PAD.b).toFixed(1)} Z`;

  /* The trend draws itself once, then the area fades up beneath it. */
  useGSAP(
    () => {
      const p = pathRef.current;
      const a = areaRef.current;
      if (!p) return;
      const len = p.getTotalLength();
      if (reduced) {
        gsap.set(p, { strokeDasharray: "none", strokeDashoffset: 0 });
        if (a) gsap.set(a, { opacity: 1 });
        return;
      }
      if (a) gsap.set(a, { opacity: 0 });
      gsap.fromTo(
        p,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }
      );
      if (a) gsap.to(a, { opacity: 1, duration: 0.6, delay: 0.7 });
    },
    { dependencies: [reduced], scope: rootRef }
  );

  const sel = selected != null ? readings[selected] : null;
  const selAbnormal = sel != null && (sel.value > range.high || sel.value < range.low);
  const latest = readings[readings.length - 1];
  const prev = readings[readings.length - 2];
  const trendPct = prev ? ((latest.value - prev.value) / prev.value) * 100 : 0;

  return (
    <div
      ref={rootRef}
      data-slot="biomarker-trend"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
      {...rest}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="type-title text-foreground">{name}</h3>
          <p className="type-meta text-muted-foreground">
            Lab range {fmtVal(range.low)}–{fmtVal(range.high)} {displayUnit}
            {baseline ? ` · your baseline ${fmtVal(baseline)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium numeric",
              trendPct <= 0 ? "text-success" : "text-warning"
            )}
          >
            {trendPct >= 0 ? "▲" : "▼"} {Math.abs(trendPct).toFixed(1)}% vs last
          </span>
          {altUnit ? (
            <button
              type="button"
              aria-pressed={useAlt}
              onClick={() => setUseAlt((a) => !a)}
              className="rounded-md border border-border px-2 py-0.5 type-meta font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {displayUnit}
            </button>
          ) : null}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${name} trend: ${readings.length} readings from ${short(readings[0].date)} to ${short(latest.date)}`}
          className="min-w-[420px]"
        >
          <defs>
            <linearGradient id={`bm-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--info)" stopOpacity={0.24} />
              <stop offset="100%" stopColor="var(--info)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`bm-band-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--success)" stopOpacity={0.16} />
              <stop offset="100%" stopColor="var(--success)" stopOpacity={0.05} />
            </linearGradient>
            <filter id={`bm-glow-${uid}`} x="-10%" y="-40%" width="120%" height="180%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor="var(--info)" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* reference band */}
          <rect
            x={PAD.l}
            width={W - PAD.l - PAD.r}
            y={y(range.high)}
            height={y(range.low) - y(range.high)}
            rx={6}
            fill={`url(#bm-band-${uid})`}
          />
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(range.high)}
            y2={y(range.high)}
            className="stroke-success/25"
            strokeDasharray="3 3"
          />
          <text x={PAD.l + 4} y={y(range.high) + 11} className="fill-success text-[9px] font-medium">
            in range
          </text>

          {/* baseline */}
          {baseline ? (
            <>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y(baseline)}
                y2={y(baseline)}
                strokeDasharray="4 4"
                className="stroke-muted-foreground/50"
              />
              <text
                x={W - PAD.r - 2}
                y={y(baseline) - 3}
                textAnchor="end"
                className="fill-muted-foreground text-[9px]"
              >
                baseline
              </text>
            </>
          ) : null}

          {/* events */}
          {events.map((e) => (
            <g key={e.date}>
              <line
                x1={x(e.date)}
                x2={x(e.date)}
                y1={PAD.t}
                y2={H - PAD.b}
                className="stroke-info/50"
                strokeDasharray="2 3"
              />
              <text
                x={x(e.date) + 3}
                y={PAD.t + 8}
                className="fill-info text-[9px] font-medium"
              >
                {e.label}
              </text>
            </g>
          ))}

          {/* axis labels */}
          {[range.low, range.high].map((v) => (
            <text
              key={v}
              x={PAD.l - 5}
              y={y(v) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[9px] tabular-nums"
            >
              {fmtVal(v)}
            </text>
          ))}
          {readings.map((r, i) =>
            i % 2 === 0 ? (
              <text
                key={r.date}
                x={x(r.date)}
                y={H - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px]"
              >
                {short(r.date)}
              </text>
            ) : null
          )}

          {/* trend area + line */}
          <path ref={areaRef} d={area} fill={`url(#bm-area-${uid})`} opacity={0} />
          <path
            ref={pathRef}
            d={line}
            fill="none"
            stroke="var(--info)"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#bm-glow-${uid})`}
          />

          {/* points */}
          {readings.map((r, i) => {
            const abnormal = r.value > range.high || r.value < range.low;
            const isSel = selected === i;
            return (
              <circle
                key={r.date}
                cx={x(r.date)}
                cy={y(r.value)}
                r={isSel ? 6 : 4}
                tabIndex={0}
                role="button"
                aria-label={`${short(r.date)}: ${fmtVal(r.value)} ${displayUnit}${abnormal ? ", outside range" : ""}`}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(i);
                  }
                }}
                className={cn(
                  "cursor-pointer transition-all duration-200 focus-visible:outline-none",
                  abnormal ? "fill-risk-high stroke-card" : "fill-info stroke-card",
                  isSel && "stroke-2"
                )}
                strokeWidth={isSel ? 2.5 : 1.5}
                style={
                  isSel
                    ? {
                        filter: `drop-shadow(0 0 5px color-mix(in oklab, ${abnormal ? "var(--risk-high)" : "var(--info)"} 60%, transparent))`,
                      }
                    : undefined
                }
              />
            );
          })}
        </svg>
      </div>

      {/* Selected reading */}
      {sel ? (
        <div
          className={cn(
            "mt-2 rounded-xl border p-3 text-sm transition-colors duration-300",
            selAbnormal ? "border-risk-high/40 bg-risk-high/5" : "border-border bg-background"
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold numeric text-foreground">
              {fmtVal(sel.value)} {displayUnit}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(sel.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="mt-1 type-meta leading-5 text-muted-foreground">
            {selAbnormal ? (
              <>
                Above the laboratory range. Single readings vary with fasting
                state and lab method — the trend matters more than one point.
                Discuss persistent elevation with your clinician; this view is
                informational, not a diagnosis.
              </>
            ) : (
              <>
                Within the laboratory range
                {baseline
                  ? sel.value <= baseline
                    ? " and at or below your personal baseline."
                    : ", slightly above your personal baseline."
                  : "."}
              </>
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
