"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

const bandSpring = { type: "spring", stiffness: 480, damping: 38 } as const;

/** Custom range slider: designed track, gradient fill and a focus-ringed
 *  thumb over a hidden native input (keeps keyboard + a11y). */
function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="flex justify-between text-muted-foreground">
        {label}
        <span className="font-semibold numeric text-foreground">{format(value)}</span>
      </span>
      <span className="relative flex h-5 items-center">
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted ring-1 ring-inset ring-border/50" />
        <span
          className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, color-mix(in oklab, var(--primary) 45%, transparent), var(--primary))",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="peer absolute inset-0 z-20 w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
        <span
          className="pointer-events-none absolute top-1/2 z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-md peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
          style={{ left: `${pct}%` }}
        />
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Model + math                                                         */
/* ------------------------------------------------------------------ */

export interface LoanEligibilityProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Annual interest rate by credit band, %. */
  rates?: { excellent: number; good: number; fair: number };
  /** Processing fee, % of principal. */
  processingFeePct?: number;
  /** FOIR ceiling used for the approval read. Default 0.5. */
  foirLimit?: number;
  ref?: React.Ref<HTMLDivElement>;
}

export type CreditBand = "excellent" | "good" | "fair";

/** Standard amortised EMI. */
export function emi(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const lakh = (n: number) =>
  n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${inr(n)}`;

const BANDS: { key: CreditBand; label: string; range: string }[] = [
  { key: "excellent", label: "750+", range: "Excellent" },
  { key: "good", label: "700–749", range: "Good" },
  { key: "fair", label: "650–699", range: "Fair" },
];

const DOCUMENTS = [
  "PAN + Aadhaar",
  "3 months' salary slips",
  "6 months' bank statement",
  "Employment certificate",
];

/* ------------------------------------------------------------------ */
/* Composer                                                             */
/* ------------------------------------------------------------------ */

/**
 * Loan eligibility composer: amount/tenure/income/obligations sliders
 * drive the EMI, the FOIR meter shows exactly why the answer is what it
 * is, and the approval read moves between likely/borderline/unlikely
 * with the reason spelled out.
 */
export function LoanEligibility({
  rates = { excellent: 10.5, good: 12.25, fair: 14.5 },
  processingFeePct = 1.5,
  foirLimit = 0.5,
  className,
  ref,
  ...rest
}: LoanEligibilityProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [amount, setAmount] = React.useState(800_000);
  const [months, setMonths] = React.useState(48);
  const [income, setIncome] = React.useState(95_000);
  const [obligations, setObligations] = React.useState(12_000);
  const [band, setBand] = React.useState<CreditBand>("good");

  const rate = rates[band];
  const monthly = emi(amount, rate, months);
  const totalInterest = monthly * months - amount;
  const processingFee = (amount * processingFeePct) / 100;
  const foir = (monthly + obligations) / income;

  const verdict =
    foir <= foirLimit * 0.8
      ? { label: "Approval likely", cls: "text-success", hue: "var(--success)" }
      : foir <= foirLimit
        ? { label: "Borderline", cls: "text-warning", hue: "var(--warning)" }
        : { label: "Unlikely at this size", cls: "text-risk-high", hue: "var(--risk-high)" };

  // Max amount that keeps FOIR at the limit, for the suggestion line.
  const headroom = Math.max(0, income * foirLimit - obligations);
  const perRupee = emi(100_000, rate, months) / 100_000;
  const maxEligible = Math.floor(headroom / perRupee / 10_000) * 10_000;

  /* FOIR meter tweens to each new position. */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const fill = root.querySelector<HTMLElement>("[data-foir]");
      if (!fill) return;
      const pct = Math.min(100, foir * 100);
      if (reduced) gsap.set(fill, { width: `${pct}%` });
      else gsap.to(fill, { width: `${pct}%`, duration: 0.5, ease: "power3.out", overwrite: true });
    },
    { dependencies: [foir, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="loan-eligibility"
      className={cn(
        "w-full max-w-md rounded-3xl border border-border/60 bg-card p-5 shadow-md",
        className
      )}
      {...rest}
    >
      {/* Headline EMI */}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="type-overline text-muted-foreground">
            Monthly EMI
          </p>
          <p className="type-metric text-foreground">
            <NumberFlow value={Math.round(monthly)} prefix="₹" locale="en-IN" trend />
          </p>
        </div>
        <p className={cn("text-sm font-semibold", verdict.cls)} aria-live="polite">
          {verdict.label}
        </p>
      </div>

      {/* FOIR meter */}
      <div className="mt-2">
        <div
          className="relative h-2 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/40"
          role="meter"
          aria-label="Fixed-obligation to income ratio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(foir * 100)}
        >
          <span
            data-foir
            className="block h-full rounded-full"
            style={{
              width: 0,
              background: `linear-gradient(90deg, color-mix(in oklab, ${verdict.hue} 55%, transparent), ${verdict.hue})`,
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-y-0 z-10 w-0.5 bg-foreground/60"
            style={{ left: `${foirLimit * 100}%` }}
          />
        </div>
        <p className="mt-1 type-meta numeric text-muted-foreground">
          Obligations {(foir * 100).toFixed(0)}% of income · lenders cap near{" "}
          {(foirLimit * 100).toFixed(0)}%
          {foir > foirLimit && maxEligible > 0 ? (
            <span className="font-medium text-foreground">
              {" "}
              — {lakh(maxEligible)} would fit at this tenure
            </span>
          ) : null}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-5 flex flex-col gap-3.5">
        <Slider label="Loan amount" value={amount} onChange={setAmount} min={100_000} max={3_000_000} step={50_000} format={lakh} />
        <Slider label="Tenure" value={months} onChange={setMonths} min={12} max={84} step={6} format={(v) => `${v} months`} />
        <Slider label="Monthly income" value={income} onChange={setIncome} min={25_000} max={400_000} step={5_000} format={(v) => `₹${inr(v)}`} />
        <Slider label="Existing EMIs" value={obligations} onChange={setObligations} min={0} max={100_000} step={1_000} format={(v) => `₹${inr(v)}`} />
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">Credit score</span>
          <LayoutGroup id={uid}>
            <div className="isolate flex gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label="Credit band">
              {BANDS.map((b) => (
                <button
                  key={b.key}
                  role="tab"
                  aria-selected={band === b.key}
                  onClick={() => setBand(b.key)}
                  className={cn(
                    "relative rounded-lg px-2.5 py-1 type-meta font-medium numeric transition-colors duration-200",
                    band === b.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  title={b.range}
                >
                  {band === b.key ? (
                    <motion.span
                      layoutId={`band-${uid}`}
                      transition={reduced ? { duration: 0 } : bandSpring}
                      className="absolute inset-0 -z-10 rounded-lg bg-primary shadow-sm"
                    />
                  ) : null}
                  {b.label}
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* Cost breakdown */}
      <dl className="mt-5 flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-background/60 p-3.5 text-xs numeric shadow-xs">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Interest rate ({BANDS.find((b) => b.key === band)?.range})</dt>
          <dd className="text-foreground">{rate.toFixed(2)}% p.a.</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Total interest over {months}m</dt>
          <dd className="text-foreground">₹{inr(Math.round(totalInterest))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Processing fee ({processingFeePct}%)</dt>
          <dd className="text-foreground">₹{inr(Math.round(processingFee))}</dd>
        </div>
      </dl>

      {/* Documents */}
      <div className="mt-3">
        <p className="type-meta font-medium text-foreground">You&apos;ll need</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {DOCUMENTS.map((d) => (
            <li
              key={d}
              className="rounded-full bg-muted px-2.5 py-1 type-caption text-muted-foreground ring-1 ring-inset ring-border/50"
            >
              {d}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 type-caption text-muted-foreground">
        Indicative only — the lender&apos;s own bureau pull and policy decide.
      </p>
    </div>
  );
}
