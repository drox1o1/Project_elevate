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

export type ToolCallStatus = "ok" | "error" | "denied";

export interface InspectedToolCall {
  id: string;
  tool: string;
  /** Human summary of what the call did. */
  summary: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
  durationMs: number;
  status: ToolCallStatus;
  permission: "allowed" | "asked" | "denied";
  retryOf?: string;
}

export interface ToolCallInspectorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  calls?: InspectedToolCall[];
  onRetry?: (id: string) => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_TOOL_CALLS: InspectedToolCall[] = [
  {
    id: "c1",
    tool: "search_orders",
    summary: "Found order #8412 for asha@example.com",
    args: { email: "asha@example.com", status: "paid" },
    result: { id: 8412, total: 2499, currency: "INR" },
    durationMs: 312,
    status: "ok",
    permission: "allowed",
  },
  {
    id: "c2",
    tool: "payments.refund",
    summary: "First refund attempt hit a gateway timeout",
    args: { txn: "txn_9f2c", amount: 2499, reason: "customer_request" },
    error: "504 gateway timeout after 8000ms",
    durationMs: 8000,
    status: "error",
    permission: "asked",
  },
  {
    id: "c3",
    tool: "payments.refund",
    summary: "Retry succeeded — refund refund_51ab initiated",
    args: { txn: "txn_9f2c", amount: 2499, reason: "customer_request" },
    result: { refund: "refund_51ab", state: "initiated" },
    durationMs: 1240,
    status: "ok",
    permission: "asked",
    retryOf: "c2",
  },
  {
    id: "c4",
    tool: "db.delete_customer",
    summary: "Blocked: destructive call outside the approved scope",
    args: { id: 8412 },
    durationMs: 4,
    status: "denied",
    permission: "denied",
  },
];

const STATUS_META: Record<ToolCallStatus, { cls: string; label: string }> = {
  ok: { cls: "bg-success/15 text-success", label: "ok" },
  error: { cls: "bg-destructive/15 text-destructive", label: "error" },
  denied: { cls: "bg-warning/15 text-warning", label: "denied" },
};

/* ------------------------------------------------------------------ */
/* Inspector                                                            */
/* ------------------------------------------------------------------ */

/**
 * A transcript of what the agent actually did: every tool call with its
 * permission, duration bar, and a human ↔ raw toggle — the raw view is
 * the exact JSON, the human view is what you'd tell a teammate.
 */
export function ToolCallInspector({
  calls = DEMO_TOOL_CALLS,
  onRetry,
  className,
  ref,
  ...rest
}: ToolCallInspectorProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [raw, setRaw] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const maxMs = Math.max(...calls.map((c) => c.durationMs), 1);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const rows = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-call]"));
      const bars = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-duration]"));
      if (reduced) {
        gsap.set(rows, { y: 0, opacity: 1 });
        for (const bar of bars) gsap.set(bar, { width: `${Number(bar.dataset.duration) * 100}%` });
        return;
      }
      gsap.fromTo(
        rows,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", stagger: 0.07 }
      );
      for (const bar of bars) {
        gsap.fromTo(
          bar,
          { width: 0 },
          { width: `${Number(bar.dataset.duration) * 100}%`, duration: 0.6, ease: "power3.out", delay: 0.3 }
        );
      }
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="tool-call-inspector"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Tool calls <span className="text-muted-foreground">({calls.length})</span>
        </h3>
        <div className="flex rounded-lg bg-muted p-0.5" role="tablist" aria-label="View mode">
          {(["human", "raw"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={(v === "raw") === raw}
              onClick={() => setRaw(v === "raw")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors duration-200",
                (v === "raw") === raw
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calls */}
      <ul className="mt-3 flex flex-col gap-1.5">
        {calls.map((c) => {
          const meta = STATUS_META[c.status];
          const open = openId === c.id;
          return (
            <li key={c.id} data-call>
              <div
                className={cn(
                  "rounded-xl border bg-background",
                  c.status === "error"
                    ? "border-destructive/40"
                    : c.status === "denied"
                      ? "border-warning/40"
                      : "border-border"
                )}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId((o) => (o === c.id ? null : c.id))}
                  className="w-full px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <div className="flex items-center gap-2">
                    <code className="truncate font-mono text-xs font-semibold text-foreground">
                      {c.tool}
                    </code>
                    <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase", meta.cls)}>
                      {meta.label}
                    </span>
                    {c.permission === "asked" ? (
                      <span className="rounded bg-info/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-info">
                        user approved
                      </span>
                    ) : null}
                    {c.retryOf ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
                        retry
                      </span>
                    ) : null}
                    <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                      {c.durationMs >= 1000 ? `${(c.durationMs / 1000).toFixed(1)}s` : `${c.durationMs}ms`}
                    </span>
                  </div>
                  {/* duration bar */}
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <span
                      data-duration={c.durationMs / maxMs}
                      className={cn(
                        "block h-full rounded-full",
                        c.status === "error" ? "bg-destructive" : c.status === "denied" ? "bg-warning" : "bg-primary"
                      )}
                      style={{ width: 0 }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
                    {raw ? (
                      <code className="font-mono">{JSON.stringify(c.args)}</code>
                    ) : (
                      c.summary
                    )}
                  </p>
                </button>

                {open ? <CallDetail call={c} raw={raw} reduced={reduced} onRetry={onRetry} /> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CallDetail({
  call,
  raw,
  reduced,
  onRetry,
}: {
  call: InspectedToolCall;
  raw: boolean;
  reduced: boolean;
  onRetry?: (id: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      if (reduced) {
        gsap.set(ref.current, { height: "auto", opacity: 1 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power3.out", clearProps: "height" }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="overflow-hidden">
      <div className="border-t border-border px-3 py-2">
        {raw ? (
          <pre className="overflow-x-auto rounded-lg bg-muted/60 p-2 font-mono text-[10px] leading-4 text-foreground">
            {JSON.stringify(
              { tool: call.tool, args: call.args, ...(call.result ? { result: call.result } : {}), ...(call.error ? { error: call.error } : {}) },
              null,
              2
            )}
          </pre>
        ) : (
          <div className="flex flex-col gap-1 text-[11px] leading-4">
            {call.result != null ? (
              <p className="text-foreground">
                <span className="font-medium">Result:</span>{" "}
                {typeof call.result === "object" ? JSON.stringify(call.result) : String(call.result)}
              </p>
            ) : null}
            {call.error ? (
              <p className="text-destructive">
                <span className="font-medium">Error:</span> {call.error}
              </p>
            ) : null}
            {call.status === "denied" ? (
              <p className="text-warning">
                Denied by policy before execution — no side effects occurred.
              </p>
            ) : null}
          </div>
        )}
        {call.status === "error" ? (
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={() => onRetry?.(call.id)}>
              Retry call
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
