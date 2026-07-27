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

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  /** Day index (0-based) the course starts/ends within the visible window. */
  startDay: number;
  endDay: number;
  /** Adherence per day: taken, missed or upcoming. Index = day - startDay. */
  adherence: ("taken" | "missed" | "upcoming")[];
  /** Days until refill runs out, if low. */
  refillInDays?: number;
}

export interface MedicationInteraction {
  a: string;
  b: string;
  note: string;
}

export interface MedicationTimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  medications: Medication[];
  interactions?: MedicationInteraction[];
  /** Days in the visible window. Default 28. */
  windowDays?: number;
  /** 0-based index of "today" within the window. Default 20. */
  today?: number;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_MEDICATIONS: Medication[] = [
  {
    name: "Metformin",
    dose: "500 mg",
    frequency: "2× daily",
    startDay: 0,
    endDay: 27,
    adherence: Array.from({ length: 28 }, (_, i) =>
      i > 20 ? "upcoming" : i === 6 || i === 14 ? "missed" : "taken"
    ),
  },
  {
    name: "Atorvastatin",
    dose: "10 mg",
    frequency: "1× nightly",
    startDay: 4,
    endDay: 27,
    adherence: Array.from({ length: 24 }, (_, i) =>
      i + 4 > 20 ? "upcoming" : i === 9 ? "missed" : "taken"
    ),
    refillInDays: 4,
  },
  {
    name: "Vitamin D3",
    dose: "60k IU",
    frequency: "weekly",
    startDay: 0,
    endDay: 27,
    adherence: Array.from({ length: 28 }, (_, i) =>
      i % 7 !== 0 ? "upcoming" : i > 20 ? "upcoming" : "taken"
    ),
  },
];

export const DEMO_INTERACTIONS: MedicationInteraction[] = [
  {
    a: "Metformin",
    b: "Atorvastatin",
    note: "Generally safe together; monitor for muscle pain and report it early.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

/**
 * A month of medication at a glance: course bars grow in, adherence dots
 * cascade (missed doses in warning), refills flag before they run out and
 * interactions link the two rows they concern.
 */
export function MedicationTimeline({
  medications,
  interactions = [],
  windowDays = 28,
  today = 20,
  className,
  ref,
  ...rest
}: MedicationTimelineProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const [selected, setSelected] = React.useState<string | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const bars = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-course]"));
      const dots = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-dose]"));
      if (reduced) {
        gsap.set(bars, { scaleX: 1, opacity: 1 });
        gsap.set(dots, { scale: 1, opacity: 1 });
        return;
      }
      gsap.fromTo(
        bars,
        { scaleX: 0, opacity: 0, transformOrigin: "left center" },
        { scaleX: 1, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.12 }
      );
      gsap.fromTo(
        dots,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.008, delay: 0.35 }
      );
    },
    { dependencies: [reduced, medications], scope: rootRef }
  );

  const pct = (day: number) => (day / (windowDays - 1)) * 100;
  const adherenceStats = (m: Medication) => {
    const past = m.adherence.filter((a) => a !== "upcoming");
    const taken = past.filter((a) => a === "taken").length;
    return { taken, past: past.length, pct: past.length ? Math.round((taken / past.length) * 100) : 100 };
  };

  return (
    <div
      ref={rootRef}
      data-slot="medication-timeline"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="type-title text-foreground">Medications · last 4 weeks</h3>
        <span className="type-meta text-muted-foreground">tap a row for details</span>
      </div>

      <div className="relative mt-4 flex flex-col gap-5">
        {/* today line */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 top-1 w-px"
          style={{
            left: `${pct(today)}%`,
            background: "linear-gradient(180deg, var(--info), color-mix(in oklab, var(--info) 20%, transparent))",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-info"
          style={{ left: `${pct(today)}%`, boxShadow: "0 0 6px color-mix(in oklab, var(--info) 70%, transparent)" }}
        />
        <span
          className="absolute -top-1 -translate-x-1/2 text-[9px] font-medium uppercase text-info"
          style={{ left: `${pct(today)}%` }}
        >
          today
        </span>

        {medications.map((m) => {
          const stats = adherenceStats(m);
          const isSel = selected === m.name;
          return (
            <button
              key={m.name}
              type="button"
              aria-pressed={isSel}
              onClick={() => setSelected((s) => (s === m.name ? null : m.name))}
              className={cn(
                "group rounded-lg p-1 pt-2 text-left transition-colors duration-200",
                isSel ? "bg-muted/70" : "hover:bg-muted/40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <div className="flex items-baseline justify-between gap-2 px-1">
                <span className="text-xs font-medium text-foreground">
                  {m.name} <span className="text-muted-foreground">{m.dose} · {m.frequency}</span>
                </span>
                <span
                  className={cn(
                    "type-meta numeric",
                    stats.pct >= 90 ? "text-success" : stats.pct >= 75 ? "text-warning" : "text-risk-high"
                  )}
                >
                  {stats.pct}% adherence
                </span>
              </div>
              {/* course bar + dose dots */}
              <div className="relative mt-1.5 h-5 px-1">
                <span
                  data-course
                  aria-hidden="true"
                  className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${pct(m.startDay)}%`,
                    width: `${pct(m.endDay) - pct(m.startDay)}%`,
                    background: "linear-gradient(90deg, color-mix(in oklab, var(--info) 22%, transparent), color-mix(in oklab, var(--success) 18%, transparent))",
                  }}
                />
                {m.adherence.map((a, i) => {
                  const day = m.startDay + i;
                  if (day >= windowDays) return null;
                  return (
                    <span
                      key={day}
                      data-dose
                      aria-hidden="true"
                      className={cn(
                        "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                        a === "taken" && "bg-success ring-2 ring-success/20",
                        a === "missed" && "bg-warning ring-2 ring-warning/30",
                        a === "upcoming" && "border border-border bg-background"
                      )}
                      style={{ left: `${pct(day)}%` }}
                    />
                  );
                })}
                {m.refillInDays != null ? (
                  <Badge
                    variant="outline"
                    pulse
                    className="absolute -top-1 right-0 text-[9px] text-warning"
                  >
                    Refill in {m.refillInDays}d
                  </Badge>
                ) : null}
              </div>
              {isSel ? (
                <p className="mt-1 px-1 type-meta leading-4 text-muted-foreground">
                  {stats.taken}/{stats.past} doses taken.{" "}
                  {m.adherence.includes("missed")
                    ? "Missed doses shown in amber — don't double up; take the next scheduled dose."
                    : "No missed doses in this window."}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      {interactions.length > 0 ? (
        <div className="mt-4 flex flex-col gap-1.5">
          {interactions.map((ix) => (
            <p
              key={`${ix.a}-${ix.b}`}
              className="rounded-lg border border-info/30 bg-info/5 px-2.5 py-1.5 type-meta leading-4 text-foreground"
            >
              <span className="font-semibold">{ix.a} + {ix.b}:</span> {ix.note}
            </p>
          ))}
        </div>
      ) : null}
      <p className="mt-3 type-caption text-muted-foreground">
        Legend: green taken · amber missed · hollow upcoming. Informational —
        follow your prescriber&apos;s instructions.
      </p>
    </div>
  );
}
