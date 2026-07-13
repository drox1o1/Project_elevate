"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export type EvidenceSource = "transactions" | "emails" | "access-logs";

export interface InvestigationEvent {
  id: string;
  time: string;
  title: string;
  actor: string;
  source: EvidenceSource;
  /** Analyst confidence in this event's interpretation, 0–1. */
  confidence: number;
  evidence: string[];
  note?: string;
  /** Days of unexplained silence before this event. */
  gapDaysBefore?: number;
}

export interface InvestigationTimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  events?: InvestigationEvent[];
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_INVESTIGATION: InvestigationEvent[] = [
  {
    id: "i1",
    time: "3 Jun · 09:14",
    title: "Vendor 'Meridian Supplies' created",
    actor: "r.kapoor",
    source: "access-logs",
    confidence: 0.95,
    evidence: ["Admin console session 8f2c", "Vendor record v-2291 creation log"],
  },
  {
    id: "i2",
    time: "3 Jun · 09:31",
    title: "Bank details set to a personal account",
    actor: "r.kapoor",
    source: "access-logs",
    confidence: 0.9,
    evidence: ["Field change: payee IFSC → HDFC0004xx", "Account holder ≠ vendor name"],
    note: "Same session as vendor creation — 17 minutes apart.",
  },
  {
    id: "i3",
    time: "11 Jun · 18:02",
    title: "First invoice approved under dual-control threshold",
    actor: "r.kapoor",
    source: "transactions",
    confidence: 0.85,
    evidence: ["INV-0093 · ₹49,500 (threshold ₹50,000)", "Approval chain skipped second signer"],
    gapDaysBefore: 8,
  },
  {
    id: "i4",
    time: "12 Jun · 08:47",
    title: "Email to accounts requesting expedited payment",
    actor: "r.kapoor",
    source: "emails",
    confidence: 0.65,
    evidence: ["Mail thread 'Meridian — urgent clearance'"],
    note: "Language matches two prior expedite requests; motive unclear.",
  },
  {
    id: "i5",
    time: "27 Jun · 14:20",
    title: "Three further invoices, all just under threshold",
    actor: "system",
    source: "transactions",
    confidence: 0.92,
    evidence: ["INV-0107 ₹49,900", "INV-0112 ₹48,750", "INV-0118 ₹49,500"],
    gapDaysBefore: 15,
  },
];

const SOURCE_META: Record<EvidenceSource, { label: string; cls: string }> = {
  "transactions": { label: "Transactions", cls: "bg-info/15 text-info" },
  "emails": { label: "Emails", cls: "bg-warning/15 text-warning" },
  "access-logs": { label: "Access logs", cls: "bg-success/15 text-success" },
};

/* ------------------------------------------------------------------ */
/* Timeline                                                             */
/* ------------------------------------------------------------------ */

/**
 * A case timeline for investigators: events carry actor, source,
 * confidence and expandable evidence; unexplained gaps are first-class
 * (a dashed void with the day count), and source filters re-cascade the
 * thread.
 */
export function InvestigationTimeline({
  title = "Case 2214 · vendor fraud",
  events = DEMO_INVESTIGATION,
  className,
  ref,
  ...rest
}: InvestigationTimelineProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [filter, setFilter] = React.useState<EvidenceSource | "all">("all");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const visible = events.filter((e) => filter === "all" || e.source === filter);
  const actors = [...new Set(events.map((e) => e.actor))];

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
        { y: 14, opacity: 0, filter: "blur(5px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.07,
          overwrite: true,
          clearProps: "filter",
        }
      );
    },
    { dependencies: [filter, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="investigation-timeline"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-[11px] text-muted-foreground">
          {actors.length} actors · {events.length} events
        </span>
      </div>

      {/* Source filter */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(["all", "transactions", "emails", "access-logs"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-200",
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {s === "all" ? "All sources" : SOURCE_META[s].label}
          </button>
        ))}
      </div>

      {/* Events */}
      <ol className="mt-4 flex flex-col">
        {visible.map((e, i) => {
          const open = openId === e.id;
          const src = SOURCE_META[e.source];
          return (
            <li key={e.id} data-event className="relative flex gap-3 pb-1">
              {/* rail */}
              <div className="flex w-4 flex-col items-center">
                <span
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-card",
                    e.confidence >= 0.85 ? "bg-primary" : "bg-warning"
                  )}
                />
                {i < visible.length - 1 ? (
                  <span className="w-px flex-1 bg-border" aria-hidden="true" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 pb-3">
                {/* gap marker */}
                {e.gapDaysBefore && filter === "all" ? (
                  <p className="mb-2 rounded-md border border-dashed border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {e.gapDaysBefore} days with no recorded activity
                  </p>
                ) : null}

                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId((o) => (o === e.id ? null : e.id))}
                  className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <p className="text-[10px] tabular-nums text-muted-foreground">{e.time}</p>
                  <p className="text-sm font-medium leading-5 text-foreground">{e.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                      {e.actor}
                    </span>
                    <span className={cn("rounded px-1.5 py-0.5 font-medium", src.cls)}>
                      {src.label}
                    </span>
                    <span className="text-muted-foreground">
                      confidence {(e.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="h-1 w-12 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          e.confidence >= 0.85 ? "bg-primary" : "bg-warning"
                        )}
                        style={{ width: `${e.confidence * 100}%` }}
                      />
                    </span>
                  </p>
                </button>

                {open ? (
                  <EvidencePanel event={e} reduced={reduced} />
                ) : (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {e.evidence.length} evidence item{e.evidence.length > 1 ? "s" : ""} — click to review
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {visible.length === 0 ? (
        <p className="rounded-lg bg-muted/50 px-3 py-6 text-center text-xs text-muted-foreground">
          No events from this source.
        </p>
      ) : null}

      <p className="mt-1 border-t border-border pt-2 text-[10px] text-muted-foreground">
        Amber dots and bars mark lower-confidence interpretations. Gaps are
        shown, not hidden — absence of evidence is part of the case.
      </p>
    </div>
  );
}

function EvidencePanel({
  event,
  reduced,
}: {
  event: InvestigationEvent;
  reduced: boolean;
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
      <ul className="mt-1.5 flex flex-col gap-1 rounded-lg border border-border bg-background p-2.5">
        {event.evidence.map((ev) => (
          <li key={ev} className="flex items-start gap-1.5 text-[11px] text-foreground">
            <span aria-hidden="true" className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground" />
            {ev}
          </li>
        ))}
        {event.note ? (
          <li className="mt-1 border-t border-border pt-1.5 text-[11px] italic text-muted-foreground">
            Analyst note: {event.note}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
