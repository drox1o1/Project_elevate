"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

/* ------------------------------------------------------------------ */
/* Math                                                                 */
/* ------------------------------------------------------------------ */

export interface SipInputs {
  monthly: number;
  years: number;
  /** Expected annual return, %. */
  returnPct: number;
  /** Annual step-up of the contribution, %. */
  stepUpPct: number;
  /** Assumed inflation for the real-value line, %. */
  inflationPct: number;
}

export interface SipYearPoint {
  year: number;
  invested: number;
  value: number;
}

export function simulateSip({
  monthly,
  years,
  returnPct,
  stepUpPct,
}: Omit<SipInputs, "inflationPct">): SipYearPoint[] {
  const r = returnPct / 100 / 12;
  const points: SipYearPoint[] = [];
  let value = 0;
  let invested = 0;
  let contribution = monthly;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      value = value * (1 + r) + contribution;
      invested += contribution;
    }
    points.push({ year: y, invested, value });
    contribution *= 1 + stepUpPct / 100;
  }
  return points;
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const lakh = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${inr(n)}`;

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export interface SipSimulatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  defaults?: Partial<SipInputs>;
  /** Optional goal amount to mark on the chart. */
  goal?: number;
  ref?: React.Ref<HTMLDivElement>;
}

const W = 480;
const H = 170;
const PAD = { l: 8, r: 8, t: 12, b: 18 };

/**
 * SIP goal simulator: sliders drive a compounding projection; the growth
 * area redraws with a morphing path, the corpus rolls via NumberFlow and
 * the invested/growth split bar re-balances on every change.
 */
export function SipSimulator({
  defaults,
  goal,
  className,
  ref,
  ...rest
}: SipSimulatorProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [monthly, setMonthly] = React.useState(defaults?.monthly ?? 25_000);
  const [years, setYears] = React.useState(defaults?.years ?? 15);
  const [returnPct, setReturnPct] = React.useState(defaults?.returnPct ?? 12);
  const [stepUpPct, setStepUpPct] = React.useState(defaults?.stepUpPct ?? 5);
  const inflationPct = defaults?.inflationPct ?? 5;

  const points = React.useMemo(
    () => simulateSip({ monthly, years, returnPct, stepUpPct }),
    [monthly, years, returnPct, stepUpPct]
  );
  const final = points[points.length - 1];
  const growth = final.value - final.invested;
  const realValue = final.value / Math.pow(1 + inflationPct / 100, years);
  const growthShare = Math.round((growth / final.value) * 100);
  const goalYear = goal ? points.find((p) => p.value >= goal)?.year : undefined;

  /* Chart paths */
  const vMax = Math.max(final.value, goal ?? 0) * 1.05;
  const x = (year: number) => PAD.l + (year / years) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / vMax) * (H - PAD.t - PAD.b);
  const area = (key: "value" | "invested") =>
    `M${x(0)},${y(0)} ` +
    points.map((p) => `L${x(p.year)},${y(p[key])}`).join(" ") +
    ` L${x(years)},${y(0)} Z`;

  // Top edge of the value area, drawn as a glowing stroke.
  const valueLine =
    `M${x(0)},${y(0)} ` + points.map((p) => `L${x(p.year)},${y(p.value)}`).join(" ");

  const valueRef = React.useRef<SVGPathElement>(null);
  const investedRef = React.useRef<SVGPathElement>(null);
  const valueLineRef = React.useRef<SVGPathElement>(null);

  /* Paths morph to the new projection instead of snapping. */
  useGSAP(
    () => {
      const pairs: [SVGPathElement | null, string][] = [
        [valueRef.current, area("value")],
        [investedRef.current, area("invested")],
        [valueLineRef.current, valueLine],
      ];
      for (const [el, d] of pairs) {
        if (!el) continue;
        if (reduced) el.setAttribute("d", d);
        else gsap.to(el, { attr: { d }, duration: 0.5, ease: "power2.out", overwrite: true });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    { dependencies: [points, reduced, goal] }
  );

  const slider = (
    label: string,
    value: number,
    set: (v: number) => void,
    min: number,
    max: number,
    step: number,
    fmt: (v: number) => string
  ) => (
    <label className="flex flex-col gap-1 text-xs">
      <span className="flex justify-between text-muted-foreground">
        {label}
        <span className="font-medium numeric text-foreground">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => set(parseFloat(e.target.value))}
        className="accent-primary"
      />
    </label>
  );

  return (
    <div
      ref={rootRef}
      data-slot="sip-simulator"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
      {...rest}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="type-overline text-muted-foreground">
            Projected corpus · {years}y
          </p>
          <p className="type-metric text-foreground">
            <NumberFlow value={Math.round(final.value)} prefix="₹" locale="en-IN" trend />
          </p>
        </div>
        <div className="text-right type-meta text-muted-foreground">
          <p>
            Real value (at {inflationPct}% inflation):{" "}
            <span className="font-medium numeric text-foreground">{lakh(realValue)}</span>
          </p>
          {goal ? (
            <p>
              Goal {lakh(goal)}:{" "}
              {goalYear ? (
                <span className="font-medium text-success">reached in year {goalYear}</span>
              ) : (
                <span className="font-medium text-warning">not reached — raise SIP or horizon</span>
              )}
            </p>
          ) : null}
        </div>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Projection: ₹${inr(final.invested)} invested grows to ₹${inr(final.value)} over ${years} years`}
        className="mt-3 w-full"
      >
        <defs>
          <linearGradient id={`sip-growth-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--market-up)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--market-up)" stopOpacity={0.04} />
          </linearGradient>
          <linearGradient id={`sip-invested-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--info)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--info)" stopOpacity={0.35} />
          </linearGradient>
          <filter id={`sip-glow-${uid}`} x="-5%" y="-40%" width="110%" height="180%">
            <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="var(--market-up)" floodOpacity="0.35" />
          </filter>
        </defs>
        <path ref={valueRef} d={area("value")} fill={`url(#sip-growth-${uid})`} />
        <path ref={investedRef} d={area("invested")} fill={`url(#sip-invested-${uid})`} />
        <path
          ref={valueLineRef}
          d={valueLine}
          fill="none"
          stroke="var(--market-up)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#sip-glow-${uid})`}
        />
        {goal ? (
          <>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(Math.min(goal, vMax))}
              y2={y(Math.min(goal, vMax))}
              strokeDasharray="4 4"
              className="stroke-warning"
            />
            <text x={W - PAD.r} y={y(Math.min(goal, vMax)) - 4} textAnchor="end" className="fill-warning text-[9px] font-medium">
              goal
            </text>
          </>
        ) : null}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <text
            key={f}
            x={x(years * f)}
            y={H - 5}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] tabular-nums"
          >
            {Math.round(years * f)}y
          </text>
        ))}
      </svg>

      {/* Invested vs growth split */}
      <div className="mt-1 flex h-2 overflow-hidden rounded-full ring-1 ring-inset ring-border/40" aria-hidden="true">
        <span
          className="transition-all duration-500"
          style={{
            width: `${100 - growthShare}%`,
            background: "linear-gradient(90deg, color-mix(in oklab, var(--info) 70%, transparent), var(--info))",
          }}
        />
        <span
          className="flex-1"
          style={{
            background: "linear-gradient(90deg, color-mix(in oklab, var(--market-up) 55%, transparent), var(--market-up))",
          }}
        />
      </div>
      <div className="mt-1 flex justify-between type-meta text-muted-foreground">
        <span>
          Invested <span className="font-medium numeric text-foreground">{lakh(final.invested)}</span>
        </span>
        <span>
          Growth <span className="font-medium numeric text-market-up">{lakh(growth)}</span> ({growthShare}%)
        </span>
      </div>

      {/* Controls */}
      <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {slider("Monthly SIP", monthly, setMonthly, 1_000, 200_000, 1_000, (v) => `₹${inr(v)}`)}
        {slider("Horizon", years, setYears, 1, 35, 1, (v) => `${v} years`)}
        {slider("Expected return", returnPct, setReturnPct, 4, 18, 0.5, (v) => `${v}% p.a.`)}
        {slider("Annual step-up", stepUpPct, setStepUpPct, 0, 15, 1, (v) => `${v}%`)}
      </div>
      <p className="mt-3 type-caption leading-4 text-muted-foreground">
        Illustration with constant returns — actual returns vary. Not
        investment advice.
      </p>
    </div>
  );
}
