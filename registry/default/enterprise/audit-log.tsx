"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Badge } from "@/registry/default/ui/badge";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export type AuditAction = "created" | "updated" | "deleted" | "accessed";

export interface AuditEvent {
  id: string;
  actor: string;
  action: AuditAction;
  resource: string;
  timestamp: string;
  ip?: string;
  device?: string;
  /** Field-level before/after for updated events. */
  changes?: { field: string; before: string; after: string }[];
  /** Hash-chain integrity of this entry. */
  integrity?: "verified" | "tampered";
}

export interface AuditLogProps extends React.HTMLAttributes<HTMLDivElement> {
  events?: AuditEvent[];
  onExport?: (visible: AuditEvent[]) => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_AUDIT: AuditEvent[] = [
  {
    id: "e1",
    actor: "priya@acme.in",
    action: "updated",
    resource: "customer/8412 · credit limit",
    timestamp: "Today 14:32",
    ip: "10.4.1.22",
    device: "Chrome · macOS",
    changes: [
      { field: "credit_limit", before: "₹2,00,000", after: "₹3,50,000" },
      { field: "review_note", before: "—", after: "Raised after 12m clean history" },
    ],
    integrity: "verified",
  },
  {
    id: "e2",
    actor: "svc-billing",
    action: "created",
    resource: "invoice/INV-2051",
    timestamp: "Today 13:05",
    ip: "10.4.9.8",
    device: "API key · billing-svc",
    integrity: "verified",
  },
  {
    id: "e3",
    actor: "rahul@acme.in",
    action: "deleted",
    resource: "webhook/stripe-legacy",
    timestamp: "Today 11:47",
    ip: "10.4.1.9",
    device: "Firefox · Windows",
    changes: [{ field: "endpoint", before: "https://old.acme.in/hooks", after: "—" }],
    integrity: "tampered",
  },
  {
    id: "e4",
    actor: "priya@acme.in",
    action: "accessed",
    resource: "report/pnl-q2 (export)",
    timestamp: "Yesterday 18:20",
    ip: "10.4.1.22",
    device: "Chrome · macOS",
    integrity: "verified",
  },
];

const ACTION_META: Record<AuditAction, string> = {
  created: "bg-success/15 text-success",
  updated: "bg-info/15 text-info",
  deleted: "bg-destructive/15 text-destructive",
  accessed: "bg-muted text-muted-foreground",
};

/* ------------------------------------------------------------------ */
/* Explorer                                                             */
/* ------------------------------------------------------------------ */

/**
 * Tamper-evident audit trail: actor, action chip, resource and device per
 * event; updated events expand into a field-level before→after diff; a
 * broken hash chain is impossible to miss.
 */
export function AuditLog({
  events = DEMO_AUDIT,
  onExport,
  className,
  ref,
  ...rest
}: AuditLogProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [actionFilter, setActionFilter] = React.useState<AuditAction | "all">("all");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const visible = events.filter((e) => actionFilter === "all" || e.action === actionFilter);
  const tampered = events.some((e) => e.integrity === "tampered");

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const rows = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-event]"));
      if (reduced) {
        gsap.set(rows, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        rows,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out", stagger: 0.05, overwrite: true }
      );
    },
    { dependencies: [actionFilter, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="audit-log"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Audit log</h3>
        <div className="flex items-center gap-2">
          {tampered ? (
            <Badge variant="destructive" pulse>
              Chain integrity broken
            </Badge>
          ) : (
            <Badge variant="success">Chain verified</Badge>
          )}
          <button
            type="button"
            onClick={() => onExport?.(visible)}
            className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Export {visible.length}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(["all", "created", "updated", "deleted", "accessed"] as const).map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={actionFilter === a}
            onClick={() => setActionFilter(a)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors duration-200",
              actionFilter === a
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Events */}
      <ul className="mt-3 flex flex-col gap-1.5">
        {visible.map((e) => {
          const open = openId === e.id;
          const expandable = (e.changes?.length ?? 0) > 0 || e.ip;
          return (
            <li key={e.id} data-event>
              <div
                className={cn(
                  "rounded-xl border transition-colors duration-300",
                  e.integrity === "tampered" ? "border-destructive/60 bg-destructive/5" : "border-border bg-background"
                )}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  disabled={!expandable}
                  onClick={() => setOpenId((o) => (o === e.id ? null : e.id))}
                  className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                      ACTION_META[e.action]
                    )}
                  >
                    {e.action}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground">
                      {e.resource}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {e.actor} · {e.timestamp}
                      {e.integrity === "tampered" ? (
                        <span className="ml-1 font-semibold text-destructive">
                          · hash mismatch with previous entry
                        </span>
                      ) : null}
                    </span>
                  </span>
                  {expandable ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-muted-foreground transition-transform duration-300",
                        open && "rotate-180"
                      )}
                    >
                      ▾
                    </span>
                  ) : null}
                </button>
                {open ? <EventDetail event={e} reduced={reduced} /> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EventDetail({ event, reduced }: { event: AuditEvent; reduced: boolean }) {
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
      <div className="border-t border-border px-2.5 py-2">
        {event.changes?.length ? (
          <dl className="flex flex-col gap-1">
            {event.changes.map((c) => (
              <div key={c.field} className="grid grid-cols-[auto_1fr] items-baseline gap-x-2 text-[11px]">
                <dt className="font-mono text-muted-foreground">{c.field}</dt>
                <dd className="flex flex-wrap items-baseline gap-1 font-mono tabular-nums">
                  <span className="rounded bg-destructive/10 px-1 text-destructive line-through decoration-destructive/50">
                    {c.before}
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground">→</span>
                  <span className="rounded bg-success/10 px-1 text-success">{c.after}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {event.ip ? (
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {event.ip} · {event.device}
          </p>
        ) : null}
      </div>
    </div>
  );
}
