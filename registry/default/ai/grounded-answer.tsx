"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface AnswerSource {
  id: string;
  title: string;
  quote: string;
  meta: string;
}

export interface AnswerClaim {
  text: string;
  sourceIds: string[];
  /** Grounding confidence 0–1; low values render with a caution tint. */
  confidence: number;
  /** Set when sources disagree — surfaced, never averaged away. */
  contradiction?: string;
}

export interface GroundedAnswerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  question: string;
  claims?: AnswerClaim[];
  sources?: AnswerSource[];
  missingEvidence?: string[];
  onFeedback?: (helpful: boolean) => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_ANSWER: Pick<
  GroundedAnswerProps,
  "question" | "claims" | "sources" | "missingEvidence"
> = {
  question: "What is our refund SLA for UPI payments?",
  claims: [
    {
      text: "Refunds for UPI payments must be initiated within 24 hours of the customer request.",
      sourceIds: ["s1"],
      confidence: 0.95,
    },
    {
      text: "Once initiated, the credit reaches the customer in 5–7 working days.",
      sourceIds: ["s1", "s2"],
      confidence: 0.88,
      contradiction:
        "The 2023 help-centre page still says 3–5 days; the 2025 policy supersedes it.",
    },
    {
      text: "For failed (not refunded) UPI transactions, auto-reversal is required within T+1 day.",
      sourceIds: ["s3"],
      confidence: 0.72,
    },
  ],
  sources: [
    { id: "s1", title: "Refund policy v4 (2025)", quote: "UPI refunds: initiate ≤ 24h from request; settlement 5–7 working days.", meta: "policies/refunds.md · updated 12 Mar 2025" },
    { id: "s2", title: "Help centre — refunds", quote: "You'll usually see the money back in 3–5 business days.", meta: "help.acme.in/refunds · 2023, stale" },
    { id: "s3", title: "NPCI circular 129", quote: "Failed transactions shall be auto-reversed within T+1.", meta: "external · applies to failures, not refunds" },
  ],
  missingEvidence: ["No source covers refunds for international UPI (UPI One World)."],
};

/* ------------------------------------------------------------------ */
/* Answer                                                               */
/* ------------------------------------------------------------------ */

/**
 * An answer that shows its work: every claim carries citation chips that
 * light up the exact source and quote, contradictions are called out
 * inline instead of averaged away, and what the sources don't cover is
 * stated plainly.
 */
export function GroundedAnswer({
  question,
  claims = DEMO_ANSWER.claims!,
  sources = DEMO_ANSWER.sources!,
  missingEvidence = DEMO_ANSWER.missingEvidence!,
  onFeedback,
  className,
  ref,
  ...rest
}: GroundedAnswerProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [activeSource, setActiveSource] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<null | boolean>(null);
  const srcIndex = Object.fromEntries(sources.map((s, i) => [s.id, i + 1]));

  /* Claims blur in sequentially, like a considered answer. */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const rows = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-claim]"));
      if (reduced) {
        gsap.set(rows, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        rows,
        { y: 10, opacity: 0, filter: "blur(5px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "power3.out", stagger: 0.12, clearProps: "filter" }
      );
    },
    { scope: rootRef }
  );

  /* Selecting a citation pulses the matching source card. */
  const focusSource = (id: string) => {
    setActiveSource((s) => (s === id ? null : id));
    if (reduced || !rootRef.current) return;
    const card = rootRef.current.querySelector<HTMLElement>(`[data-source="${id}"]`);
    if (card)
      gsap.fromTo(card, { scale: 1 }, { scale: 1.02, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" });
  };

  return (
    <div
      ref={rootRef}
      data-slot="grounded-answer"
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border/60 bg-card p-5 shadow-md",
        className
      )}
      {...rest}
    >
      <p className="type-overline text-muted-foreground">
        Question
      </p>
      <p className="text-sm font-medium text-foreground">{question}</p>

      {/* Claims */}
      <div className="mt-3 flex flex-col gap-2">
        {claims.map((c, i) => (
          <div
            key={i}
            data-claim
            className={cn(
              "rounded-lg px-3 py-2 type-label leading-6",
              c.confidence < 0.8 ? "bg-warning/5" : "bg-muted/40"
            )}
          >
            <span className="text-foreground">{c.text}</span>{" "}
            {c.sourceIds.map((sid) => (
              <button
                key={sid}
                type="button"
                aria-pressed={activeSource === sid}
                aria-label={`Show source ${srcIndex[sid]}`}
                onClick={() => focusSource(sid)}
                className={cn(
                  "mx-0.5 inline-flex size-4 items-center justify-center rounded align-text-top text-[9px] font-semibold transition-colors duration-200",
                  activeSource === sid
                    ? "bg-primary text-primary-foreground"
                    : "bg-info/15 text-info hover:bg-info/25",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {srcIndex[sid]}
              </button>
            ))}
            <span
              className={cn(
                "ml-1 align-middle type-caption numeric",
                c.confidence < 0.8 ? "font-medium text-warning" : "text-muted-foreground"
              )}
            >
              {(c.confidence * 100).toFixed(0)}%
            </span>
            {c.contradiction ? (
              <p className="mt-1 border-l-2 border-warning pl-2 type-meta leading-4 text-warning">
                Sources disagree: {c.contradiction}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Missing evidence */}
      {missingEvidence.length > 0 ? (
        <p className="mt-2 rounded-lg border border-dashed border-border px-3 py-1.5 type-meta leading-4 text-muted-foreground">
          <span className="font-medium text-foreground">Not covered by any source:</span>{" "}
          {missingEvidence.join(" ")}
        </p>
      ) : null}

      {/* Sources */}
      <p className="mt-3 type-overline text-muted-foreground">
        Sources
      </p>
      <ol className="mt-1.5 flex flex-col gap-1.5">
        {sources.map((s) => (
          <li
            key={s.id}
            data-source={s.id}
            className={cn(
              "rounded-xl border px-3 py-2.5 shadow-xs transition-colors duration-300",
              activeSource === s.id ? "border-primary/50 bg-primary/[0.05]" : "border-border/60 bg-background/60"
            )}
          >
            <p className="flex items-baseline gap-1.5 text-xs font-medium text-foreground">
              <span className="flex size-4 shrink-0 items-center justify-center rounded bg-info/15 text-[9px] font-semibold text-info ring-1 ring-inset ring-info/20">
                {srcIndex[s.id]}
              </span>
              {s.title}
            </p>
            <p className="mt-0.5 type-meta italic leading-4 text-muted-foreground">
              “{s.quote}”
            </p>
            <p className="mt-0.5 type-caption text-muted-foreground">{s.meta}</p>
          </li>
        ))}
      </ol>

      {/* Feedback */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <span className="type-caption text-muted-foreground">
          Confidence is per claim, not per answer — low-confidence claims are tinted.
        </span>
        <div className="flex gap-1" aria-live="polite">
          {feedback === null ? (
            (["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-label={v === "yes" ? "Helpful" : "Not helpful"}
                onClick={() => {
                  setFeedback(v === "yes");
                  onFeedback?.(v === "yes");
                }}
                className="rounded-md border border-border px-2 py-1 type-meta text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {v === "yes" ? "Helpful" : "Not helpful"}
              </button>
            ))
          ) : (
            <span className="type-meta text-success">Thanks — recorded.</span>
          )}
        </div>
      </div>
    </div>
  );
}
