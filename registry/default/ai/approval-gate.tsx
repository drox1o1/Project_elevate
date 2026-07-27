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

export type ApprovalState =
  | "pending"
  | "approved"
  | "modified"
  | "rejected"
  | "expired";

export interface ApprovalGateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** What the agent wants to do, imperative. */
  action: string;
  /** The risky payload the human is approving — editable via Modify. */
  payload: string;
  details?: [string, string][];
  /** Seconds until the request expires. Default 60. */
  expiresInSec?: number;
  onDecision?: (state: ApprovalState, payload: string) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const STATE_META: Record<
  ApprovalState,
  { label: string; cls: string; border: string }
> = {
  pending: { label: "Awaiting approval", cls: "text-agent-waiting", border: "border-agent-waiting/50" },
  approved: { label: "Approved", cls: "text-success", border: "border-success/50" },
  modified: { label: "Approved with edits", cls: "text-success", border: "border-success/50" },
  rejected: { label: "Rejected", cls: "text-muted-foreground", border: "border-border" },
  expired: { label: "Expired — agent paused", cls: "text-destructive", border: "border-destructive/50" },
};

/* ------------------------------------------------------------------ */
/* Gate                                                                 */
/* ------------------------------------------------------------------ */

/**
 * The human approval gate: an agent's outward-facing action paused for a
 * person. The expiry bar drains in real time; Approve, Reject, or Modify
 * the payload and approve the edited version — every terminal state is
 * designed, including "nobody answered".
 */
export function ApprovalGate({
  action,
  payload,
  details = [],
  expiresInSec = 60,
  onDecision,
  className,
  ref,
  ...rest
}: ApprovalGateProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const barRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [state, setState] = React.useState<ApprovalState>("pending");
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(payload);
  const [remaining, setRemaining] = React.useState(expiresInSec);

  const decide = (next: ApprovalState) => {
    setState(next);
    setEditing(false);
    onDecision?.(next, draft);
  };

  /* Countdown: the bar drains linearly; hitting zero expires the gate. */
  React.useEffect(() => {
    if (state !== "pending") return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setState("expired");
          onDecision?.("expired", draft);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useGSAP(
    () => {
      if (!barRef.current) return;
      const pct = (remaining / expiresInSec) * 100;
      if (reduced) gsap.set(barRef.current, { width: `${pct}%` });
      else gsap.to(barRef.current, { width: `${pct}%`, duration: 1, ease: "none", overwrite: true });
    },
    { dependencies: [remaining, expiresInSec, reduced] }
  );

  const meta = STATE_META[state];
  const settled = state !== "pending";

  return (
    <div
      ref={rootRef}
      data-slot="approval-gate"
      className={cn(
        "w-full max-w-md rounded-3xl border bg-card p-5 shadow-md transition-colors duration-300",
        meta.border,
        className
      )}
      {...rest}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="type-overline text-muted-foreground">
            Agent requests approval
          </p>
          <p className="text-sm font-semibold leading-5 text-foreground">{action}</p>
        </div>
        <span className={cn("flex shrink-0 items-center gap-1.5 text-xs font-semibold", meta.cls)} aria-live="polite">
          {state === "pending" ? (
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-agent-waiting opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-agent-waiting" />
            </span>
          ) : null}
          {meta.label}
        </span>
      </div>

      {/* Payload */}
      <div className="mt-3">
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            aria-label="Edit the payload before approving"
            className="w-full rounded-lg border border-input bg-background p-2.5 type-meta leading-5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <blockquote
            className={cn(
              "rounded-xl border border-l-2 bg-muted/40 px-3.5 py-2.5 type-meta leading-5 shadow-xs",
              draft !== payload ? "border-l-info border-border/60 text-foreground" : "border-l-border border-border/60 text-foreground",
              state === "rejected" && "opacity-50"
            )}
          >
            {draft}
            {draft !== payload ? (
              <span className="mt-1 block type-caption font-medium text-info">
                edited by reviewer
              </span>
            ) : null}
          </blockquote>
        )}
      </div>

      {/* Details */}
      {details.length > 0 ? (
        <dl className="mt-2 flex flex-col gap-0.5 type-meta numeric">
          {details.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {/* Expiry / outcome */}
      {state === "pending" ? (
        <>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/40" aria-hidden="true">
            <span
              ref={barRef}
              className="block h-full rounded-full"
              style={{
                width: "100%",
                background: remaining / expiresInSec > 0.33
                  ? "linear-gradient(90deg, color-mix(in oklab, var(--agent-waiting) 55%, transparent), var(--agent-waiting))"
                  : "linear-gradient(90deg, color-mix(in oklab, var(--destructive) 55%, transparent), var(--destructive))",
              }}
            />
          </div>
          <p className="mt-1 type-caption numeric text-muted-foreground">
            Expires in {remaining}s — the agent stays paused, nothing is sent
            without a decision.
          </p>
          <div className="mt-3 flex gap-2">
            {editing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => { setDraft(payload); setEditing(false); }}>
                  Discard edits
                </Button>
                <Button size="sm" className="flex-1" onClick={() => decide("modified")}>
                  Approve edited version
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => decide("rejected")}>
                  Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  Modify
                </Button>
                <Button size="sm" className="flex-1 bg-success text-white shadow-sm hover:bg-success/90" onClick={() => decide("approved")}>
                  Approve
                </Button>
              </>
            )}
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-lg bg-muted/50 px-2.5 py-1.5 type-meta leading-4 text-muted-foreground">
          {state === "approved" && "The agent is executing the approved action."}
          {state === "modified" && "The agent is executing your edited version — the original was not sent."}
          {state === "rejected" && "Nothing was sent. The agent will report the rejection and stop this branch."}
          {state === "expired" && "No decision arrived in time. The action was not taken; the agent is waiting for a human to resume."}
        </p>
      )}
    </div>
  );
}
