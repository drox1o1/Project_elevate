"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

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
      ? { label: "Approval likely", cls: "text-success", bar: "bg-success" }
      : foir <= foirLimit
        ? { label: "Borderline", cls: "text-warning", bar: "bg-warning" }
        : { label: "Unlikely at this size", cls: "text-risk-high", bar: "bg-risk-high" };

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
        <span className="font-medium tabular-nums text-foreground">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => set(parseInt(e.target.value, 10))}
        className="accent-primary"
      />
    </label>
  );

  return (
    <div
      ref={rootRef}
      data-slot="loan-eligibility"
      className={cn(
        "w-full max-w-md rounded-2xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      {/* Headline EMI */}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Monthly EMI
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
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
          className="relative h-2 overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-label="Fixed-obligation to income ratio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(foir * 100)}
        >
          <span
            data-foir
            className={cn("block h-full rounded-full", verdict.bar)}
            style={{ width: 0 }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-0.5 bg-foreground/60"
            style={{ left: `${foirLimit * 100}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
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
      <div className="mt-4 flex flex-col gap-3">
        {slider("Loan amount", amount, setAmount, 100_000, 3_000_000, 50_000, lakh)}
        {slider("Tenure", months, setMonths, 12, 84, 6, (v) => `${v} months`)}
        {slider("Monthly income", income, setIncome, 25_000, 400_000, 5_000, (v) => `₹${inr(v)}`)}
        {slider("Existing EMIs", obligations, setObligations, 0, 100_000, 1_000, (v) => `₹${inr(v)}`)}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">Credit score</span>
          <div className="flex gap-1" role="tablist" aria-label="Credit band">
            {BANDS.map((b) => (
              <button
                key={b.key}
                role="tab"
                aria-selected={band === b.key}
                onClick={() => setBand(b.key)}
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-medium tabular-nums transition-colors duration-200",
                  band === b.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                title={b.range}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cost breakdown */}
      <dl className="mt-4 flex flex-col gap-1 rounded-xl border border-border bg-background p-3 text-xs tabular-nums">
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
        <p className="text-[11px] font-medium text-foreground">You&apos;ll need</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {DOCUMENTS.map((d) => (
            <li
              key={d}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {d}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Indicative only — the lender&apos;s own bureau pull and policy decide.
      </p>
    </div>
  );
}
