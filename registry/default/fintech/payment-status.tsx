"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Spinner } from "@/registry/default/ui/spinner";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export type PaymentScenario = "success" | "failed" | "refunded";

export interface PaymentStatusProps
  extends React.HTMLAttributes<HTMLDivElement> {
  amount: number;
  currency?: string;
  reference: string;
  method?: string;
  /** Which lifecycle to play. Default "success". */
  scenario?: PaymentScenario;
  /** Replays the timeline when this changes. */
  playKey?: React.Key;
  /** ms between stage transitions. Default 1000. */
  speed?: number;
  onSettled?: (scenario: PaymentScenario) => void;
  ref?: React.Ref<HTMLDivElement>;
}

interface Stage {
  key: string;
  label: string;
  detail: string;
  state: "done" | "active" | "pending" | "failed" | "refund";
}

const BASE_STAGES = [
  { key: "initiated", label: "Initiated", detail: "Payment request created" },
  { key: "authorised", label: "Authorised", detail: "Issuer approved the charge" },
  { key: "captured", label: "Captured", detail: "Funds reserved for settlement" },
  { key: "settled", label: "Settled", detail: "Funds credited to your account" },
] as const;

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

/**
 * One payment, its whole lifecycle: stages light up in sequence with
 * check-draws; failures stop the rail in red with a reason; refunds play
 * a second branch back to the customer.
 */
export function PaymentStatus({
  amount,
  currency = "₹",
  reference,
  method = "UPI",
  scenario = "success",
  playKey,
  speed = 1000,
  onSettled,
  className,
  ref,
  ...rest
}: PaymentStatusProps) {
  const reduced = useReducedMotion();
  // progress: number of completed base stages; then refund stages
  const failAt = 2; // capture fails in the failed scenario
  const totalBase = BASE_STAGES.length;
  const [progress, setProgress] = React.useState(0);
  const [refundProgress, setRefundProgress] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setProgress(reduced ? totalBase : 0);
    setRefundProgress(0);
    if (reduced) {
      if (scenario === "failed") setProgress(failAt);
      if (scenario === "refunded") setRefundProgress(2);
      onSettled?.(scenario);
      return;
    }
    (async () => {
      const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
      const target = scenario === "failed" ? failAt : totalBase;
      for (let i = 1; i <= target; i++) {
        await wait(speed);
        if (cancelled) return;
        setProgress(i);
      }
      if (scenario === "refunded") {
        for (let i = 1; i <= 2; i++) {
          await wait(speed);
          if (cancelled) return;
          setRefundProgress(i);
        }
      }
      onSettled?.(scenario);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, playKey, speed, reduced]);

  const stages: Stage[] = BASE_STAGES.map((s, i) => {
    if (scenario === "failed" && i === failAt)
      return {
        ...s,
        label: "Capture failed",
        detail: "Issuer declined: insufficient funds (05)",
        state: progress >= failAt ? "failed" : progress === i ? "active" : "pending",
      };
    if (scenario === "failed" && i > failAt) return { ...s, state: "pending" };
    return {
      ...s,
      state: progress > i ? "done" : progress === i ? "active" : "pending",
    };
  });

  const refundStages: Stage[] =
    scenario === "refunded"
      ? [
          { key: "refund-init", label: "Refund initiated", detail: "Full amount reversed by merchant", state: refundProgress > 0 ? "refund" : progress >= totalBase && refundProgress === 0 ? "active" : "pending" },
          { key: "refund-done", label: "Refunded", detail: "5–7 working days to the source account", state: refundProgress > 1 ? "refund" : refundProgress === 1 ? "active" : "pending" },
        ]
      : [];

  const headline =
    scenario === "failed" && progress >= failAt
      ? { text: "Payment failed", tone: "text-destructive" }
      : scenario === "refunded" && refundProgress > 1
        ? { text: "Refunded", tone: "text-info" }
        : progress >= totalBase && scenario === "success"
          ? { text: "Settled", tone: "text-success" }
          : { text: "Processing", tone: "text-muted-foreground" };

  return (
    <div
      ref={ref}
      data-slot="payment-status"
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border/60 bg-card p-5 shadow-md",
        className
      )}
      {...rest}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="type-metric numeric text-foreground">
            {currency}
            {new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(amount)}
          </p>
          <p className="mt-0.5 type-meta text-muted-foreground">
            {reference} · {method}
          </p>
        </div>
        <span className={cn("flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ring-border/50", headline.tone)} aria-live="polite">
          {headline.text}
        </span>
      </div>

      <ol className="mt-4 flex flex-col">
        {[...stages, ...refundStages].map((s, i, all) => (
          <StageRow key={s.key} stage={s} last={i === all.length - 1} />
        ))}
      </ol>

      {scenario === "failed" && progress >= failAt ? (
        <p className="mt-2 rounded-lg bg-destructive/10 px-2.5 py-1.5 type-meta leading-4 text-destructive">
          No funds were captured. The authorisation hold releases
          automatically within 24 hours — safe to retry with another method.
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stage row                                                            */
/* ------------------------------------------------------------------ */

function StageRow({ stage, last }: { stage: Stage; last: boolean }) {
  const ref = React.useRef<HTMLLIElement>(null);
  const checkRef = React.useRef<SVGPathElement>(null);
  const reduced = useReducedMotion();
  const settled = stage.state === "done" || stage.state === "failed" || stage.state === "refund";

  useGSAP(
    () => {
      if (!checkRef.current || !settled) return;
      if (reduced) {
        gsap.set(checkRef.current, { strokeDashoffset: 0 });
        return;
      }
      gsap.fromTo(
        checkRef.current,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }
      );
    },
    { dependencies: [settled, reduced], scope: ref }
  );

  return (
    <li ref={ref} className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "relative flex size-5 items-center justify-center rounded-full transition-colors duration-300",
            stage.state === "done" && "bg-success text-white",
            stage.state === "refund" && "bg-info text-white",
            stage.state === "failed" && "bg-destructive text-white",
            stage.state === "active" && "bg-primary/10",
            stage.state === "pending" && "bg-muted"
          )}
        >
          {settled ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true">
              {stage.state === "failed" ? (
                <path ref={checkRef} d="M18 6 6 18M6 6l12 12" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
              ) : (
                <path ref={checkRef} d="M5 13l4 4L19 7" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
              )}
            </svg>
          ) : stage.state === "active" ? (
            <Spinner size="sm" />
          ) : null}
        </span>
        {!last ? (
          <span
            className={cn(
              "my-0.5 min-h-4 w-px flex-1 transition-colors duration-500",
              stage.state === "done" ? "bg-success/50" : stage.state === "refund" ? "bg-info/50" : "bg-border"
            )}
          />
        ) : null}
      </div>
      <div className="pb-3">
        <p
          className={cn(
            "text-sm leading-5",
            stage.state === "pending" ? "text-muted-foreground" : "font-medium text-foreground",
            stage.state === "failed" && "text-destructive"
          )}
        >
          {stage.label}
        </p>
        <p className="type-meta leading-4 text-muted-foreground">{stage.detail}</p>
      </div>
    </li>
  );
}
