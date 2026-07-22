"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface RiskFactor {
  label: string;
  /** Contribution weight, -1..1. Positive raises risk. */
  weight: number;
  detail?: string;
}

export interface ClinicalRiskProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  /** Risk score 0..100. */
  score: number;
  factors: RiskFactor[];
  missingData?: string[];
  recommendation?: string;
  onEscalate?: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_CARDIO_RISK: Pick<
  ClinicalRiskProps,
  "title" | "score" | "factors" | "missingData" | "recommendation"
> = {
  title: "10-year cardiovascular risk",
  score: 34,
  factors: [
    { label: "LDL trending down", weight: -0.35, detail: "158 → 101 mg/dL over 9 months" },
    { label: "HbA1c 6.1%", weight: 0.4, detail: "Pre-diabetic range" },
    { label: "Blood pressure 138/88", weight: 0.5, detail: "Stage-1 hypertension range" },
    { label: "Non-smoker", weight: -0.3 },
    { label: "Family history", weight: 0.45, detail: "Parent with early CAD" },
  ],
  missingData: ["Recent lipoprotein(a)", "Resting ECG"],
  recommendation:
    "Risk is moderate and modifiable: blood-pressure control and continued LDL reduction have the largest effect. Re-score after the missing tests.",
};

const riskBand = (score: number) =>
  score < 25
    ? { label: "Low", cls: "text-risk-low", stroke: "stroke-risk-low" }
    : score < 55
      ? { label: "Moderate", cls: "text-risk-medium", stroke: "stroke-risk-medium" }
      : { label: "High", cls: "text-risk-high", stroke: "stroke-risk-high" };

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

/**
 * A clinician-review risk summary: the gauge arc sweeps to the score,
 * factor bars grow from the center (protective left, adverse right) and
 * the copy stays explicitly decision-support, not diagnosis.
 */
export function ClinicalRisk({
  title,
  score,
  factors,
  missingData = [],
  recommendation,
  onEscalate,
  className,
  ref,
  ...rest
}: ClinicalRiskProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const arcRef = React.useRef<SVGPathElement>(null);
  const scoreRef = React.useRef<HTMLSpanElement>(null);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const band = riskBand(score);
  const maxW = Math.max(...factors.map((f) => Math.abs(f.weight)), 0.01);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const bars = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-factor]"));
      if (reduced) {
        if (arcRef.current) gsap.set(arcRef.current, { strokeDashoffset: 1 - score / 100 });
        if (scoreRef.current) scoreRef.current.textContent = String(score);
        gsap.set(bars, { scaleX: 1, opacity: 1 });
        return;
      }
      if (arcRef.current)
        gsap.fromTo(
          arcRef.current,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 1 - score / 100, duration: 1.1, ease: "power3.inOut" }
        );
      if (scoreRef.current) {
        const counter = { v: 0 };
        gsap.to(counter, {
          v: score,
          duration: 1.1,
          ease: "power3.inOut",
          onUpdate: () => {
            if (scoreRef.current) scoreRef.current.textContent = String(Math.round(counter.v));
          },
        });
      }
      gsap.fromTo(
        bars,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.08, delay: 0.5 }
      );
    },
    { dependencies: [score, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="clinical-risk"
      className={cn(
        "w-full max-w-md rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
      {...rest}
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      {/* Gauge */}
      <div className="mt-2 flex items-center gap-4">
        <div
          className="relative shrink-0"
          role="meter"
          aria-label={`${title}: ${score} of 100, ${band.label}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
        >
          <svg viewBox="0 0 100 62" className="w-32 overflow-visible">
            <defs>
              <linearGradient id={`gauge-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--risk-low)" />
                <stop offset="50%" stopColor="var(--risk-medium)" />
                <stop offset="100%" stopColor="var(--risk-high)" />
              </linearGradient>
            </defs>
            <path
              d="M10,55 A45,45 0 0 1 90,55"
              fill="none"
              strokeWidth={9}
              strokeLinecap="round"
              className="stroke-muted/70"
            />
            <path
              ref={arcRef}
              d="M10,55 A45,45 0 0 1 90,55"
              fill="none"
              strokeWidth={9}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
              stroke={`url(#gauge-${uid})`}
              style={{ filter: `drop-shadow(0 1px 4px color-mix(in oklab, ${band.label === "High" ? "var(--risk-high)" : band.label === "Moderate" ? "var(--risk-medium)" : "var(--risk-low)"} 45%, transparent))` }}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <span ref={scoreRef} className="text-2xl font-semibold tabular-nums text-foreground">
              0
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
        <div>
          <p className={cn("text-sm font-semibold", band.cls)}>{band.label} risk</p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            Decision support for clinician review — not a diagnosis.
          </p>
        </div>
      </div>

      {/* Factors: protective ← | → adverse */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>Protective</span>
          <span>Adverse</span>
        </div>
        <ul className="mt-1.5 flex flex-col gap-2">
          {factors.map((f) => {
            const adverse = f.weight > 0;
            const width = (Math.abs(f.weight) / maxW) * 50;
            return (
              <li key={f.label} className="text-xs">
                <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/70 ring-1 ring-inset ring-border/40">
                  <span aria-hidden="true" className="absolute inset-y-0 left-1/2 z-10 w-px bg-border" />
                  <span
                    data-factor
                    className={cn(
                      "absolute inset-y-0 rounded-full",
                      adverse ? "left-1/2 origin-left" : "right-1/2 origin-right"
                    )}
                    style={{
                      width: `${width}%`,
                      background: adverse
                        ? "linear-gradient(90deg, color-mix(in oklab, var(--risk-high) 55%, transparent), var(--risk-high))"
                        : "linear-gradient(270deg, color-mix(in oklab, var(--risk-low) 55%, transparent), var(--risk-low))",
                    }}
                  />
                </div>
                <div className="mt-0.5 flex justify-between gap-2">
                  <span className="font-medium text-foreground">{f.label}</span>
                  {f.detail ? (
                    <span className="text-right text-muted-foreground">{f.detail}</span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {missingData.length > 0 ? (
        <p className="mt-3 rounded-lg bg-muted/60 px-2.5 py-1.5 text-[11px] leading-4 text-muted-foreground">
          <span className="font-semibold text-foreground">Missing data:</span>{" "}
          {missingData.join(", ")} — the score has wider uncertainty until these
          are available.
        </p>
      ) : null}

      {recommendation ? (
        <p className="mt-2 text-[12px] leading-5 text-foreground">{recommendation}</p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onEscalate}>
          Send to clinician review
        </Button>
      </div>
    </div>
  );
}
