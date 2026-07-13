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

export interface ReconPair {
  id: string;
  ledger: { ref: string; desc: string; amount: number };
  statement: { ref: string; desc: string; amount: number };
  /** Match confidence 0–1. */
  confidence: number;
}

export interface ReconciliationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  pairs?: ReconPair[];
  /** Confidence at or above which "Accept all" applies. Default 0.95. */
  bulkThreshold?: number;
  onResolve?: (id: string, action: "accept" | "reject") => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_RECON: ReconPair[] = [
  {
    id: "r1",
    ledger: { ref: "INV-2041", desc: "Acme Corp · services", amount: 118_000 },
    statement: { ref: "NEFT-88123", desc: "ACME CORP PVT LTD", amount: 118_000 },
    confidence: 0.99,
  },
  {
    id: "r2",
    ledger: { ref: "INV-2044", desc: "Globex · retainer", amount: 90_000 },
    statement: { ref: "IMPS-11407", desc: "GLOBEX INDIA", amount: 90_000 },
    confidence: 0.97,
  },
  {
    id: "r3",
    ledger: { ref: "INV-2038", desc: "Initech · milestone 2", amount: 2_40_000 },
    statement: { ref: "RTGS-55019", desc: "INITECH SOLUTIONS", amount: 2_38_820 },
    confidence: 0.74,
  },
  {
    id: "r4",
    ledger: { ref: "INV-2047", desc: "Umbrella · onboarding", amount: 56_500 },
    statement: { ref: "UPI-99231", desc: "UMBRELA SVCS", amount: 56_500 },
    confidence: 0.88,
  },
];

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

/* ------------------------------------------------------------------ */
/* Workspace                                                            */
/* ------------------------------------------------------------------ */

/**
 * Two-sided reconciliation: suggested ledger↔statement matches with
 * confidence, amount differences called out to the rupee, accept/reject
 * per pair (accepted pairs collapse away), bulk-accept above a threshold
 * and a live matched meter.
 */
export function Reconciliation({
  pairs = DEMO_RECON,
  bulkThreshold = 0.95,
  onResolve,
  className,
  ref,
  ...rest
}: ReconciliationProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [resolved, setResolved] = React.useState<Record<string, "accept" | "reject">>({});
  const open = pairs.filter((p) => !resolved[p.id]);
  const accepted = Object.values(resolved).filter((v) => v === "accept").length;
  const matchedPct = Math.round((accepted / pairs.length) * 100);
  const bulkable = open.filter((p) => p.confidence >= bulkThreshold);

  const resolve = (id: string, action: "accept" | "reject") => {
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-pair="${id}"]`);
    const commit = () => {
      setResolved((r) => ({ ...r, [id]: action }));
      onResolve?.(id, action);
    };
    if (reduced || !el) {
      commit();
      return;
    }
    gsap.to(el, {
      x: action === "accept" ? 32 : -32,
      opacity: 0,
      height: 0,
      marginBottom: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: commit,
    });
  };

  const bulkAccept = () => {
    for (const p of bulkable) resolve(p.id, "accept");
  };

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const rows = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-pair]"));
      if (reduced) {
        gsap.set(rows, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        rows,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.08 }
      );
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="reconciliation"
      className={cn(
        "w-full max-w-2xl rounded-2xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      {/* Header + meter */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Bank reconciliation · July
        </h3>
        <Button
          size="sm"
          variant="outline"
          disabled={bulkable.length === 0}
          onClick={bulkAccept}
        >
          Accept all ≥{Math.round(bulkThreshold * 100)}% ({bulkable.length})
        </Button>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-label="Matched share"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={matchedPct}
      >
        <span
          className="block h-full rounded-full bg-success transition-all duration-500 ease-out"
          style={{ width: `${matchedPct}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
        {accepted}/{pairs.length} matched · {open.length} awaiting review
      </p>

      {/* Pairs */}
      <div className="mt-3 flex flex-col">
        {open.length === 0 ? (
          <div className="rounded-xl border border-success/40 bg-success/5 px-3 py-6 text-center">
            <p className="text-sm font-medium text-success">All matched</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Decisions are logged to the audit trail with your user and timestamp.
            </p>
          </div>
        ) : null}
        {open.map((p) => {
          const diff = p.statement.amount - p.ledger.amount;
          const high = p.confidence >= bulkThreshold;
          return (
            <div key={p.id} data-pair={p.id} className="mb-2 overflow-hidden">
              <div
                className={cn(
                  "rounded-xl border p-3",
                  diff !== 0 ? "border-warning/50" : "border-border"
                )}
              >
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
                  {/* Ledger side */}
                  <div className="min-w-0 rounded-lg bg-muted/50 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Ledger · {p.ledger.ref}
                    </p>
                    <p className="truncate text-xs font-medium text-foreground">{p.ledger.desc}</p>
                    <p className="font-mono text-sm tabular-nums text-foreground">₹{inr(p.ledger.amount)}</p>
                  </div>
                  {/* Confidence link */}
                  <div className="flex items-center justify-center">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                        high
                          ? "bg-success/15 text-success"
                          : p.confidence >= 0.8
                            ? "bg-warning/15 text-warning"
                            : "bg-risk-high/15 text-risk-high"
                      )}
                    >
                      {Math.round(p.confidence * 100)}%
                    </span>
                  </div>
                  {/* Statement side */}
                  <div className="min-w-0 rounded-lg bg-muted/50 px-2.5 py-2 sm:text-right">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Statement · {p.statement.ref}
                    </p>
                    <p className="truncate text-xs font-medium text-foreground">{p.statement.desc}</p>
                    <p className="font-mono text-sm tabular-nums text-foreground">₹{inr(p.statement.amount)}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] tabular-nums">
                    {diff === 0 ? (
                      <span className="text-muted-foreground">Amounts agree exactly</span>
                    ) : (
                      <span className="font-medium text-warning">
                        Δ ₹{inr(Math.abs(diff))} {diff < 0 ? "short" : "over"} — likely bank charges; verify before accepting
                      </span>
                    )}
                  </p>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => resolve(p.id, "reject")}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => resolve(p.id, "accept")}>
                      Accept match
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
