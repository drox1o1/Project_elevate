"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Badge } from "@/registry/default/ui/badge";

const filterSpring = { type: "spring", stiffness: 480, damping: 38 } as const;

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export type ExpenseCategory =
  | "food"
  | "transport"
  | "subscriptions"
  | "shopping"
  | "utilities"
  | "income";

export interface ExpenseItem {
  id: string;
  merchant: string;
  day: string;
  amount: number;
  category: ExpenseCategory;
  /** Nth consecutive monthly charge → subscription badge. */
  recurringMonth?: number;
  /** Marks an unusually large charge with the multiple vs usual. */
  unusualMultiple?: number;
  /** Refund linked to an earlier transaction id. */
  refundOf?: string;
}

export interface ExpenseFeedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items?: ExpenseItem[];
  currency?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_EXPENSES: ExpenseItem[] = [
  { id: "t1", merchant: "Swiggy", day: "Today", amount: -412, category: "food" },
  { id: "t2", merchant: "Netflix", day: "Today", amount: -649, category: "subscriptions", recurringMonth: 7 },
  { id: "t3", merchant: "Uber", day: "Today", amount: -284, category: "transport" },
  { id: "t4", merchant: "Croma", day: "Yesterday", amount: -42_499, category: "shopping", unusualMultiple: 9 },
  { id: "t5", merchant: "Salary · Acme Corp", day: "Yesterday", amount: 145_000, category: "income" },
  { id: "t6", merchant: "Spotify", day: "Yesterday", amount: -119, category: "subscriptions", recurringMonth: 14 },
  { id: "t7", merchant: "BESCOM", day: "Mon 8 Jul", amount: -1_840, category: "utilities" },
  { id: "t8", merchant: "Croma (refund)", day: "Mon 8 Jul", amount: 4_500, category: "shopping", refundOf: "t4" },
  { id: "t9", merchant: "Blinkit", day: "Mon 8 Jul", amount: -876, category: "food" },
];

const CATEGORY_META: Record<ExpenseCategory, { label: string; dot: string }> = {
  food: { label: "Food", dot: "bg-amber-500" },
  transport: { label: "Transport", dot: "bg-sky-500" },
  subscriptions: { label: "Subscriptions", dot: "bg-violet-500" },
  shopping: { label: "Shopping", dot: "bg-rose-500" },
  utilities: { label: "Utilities", dot: "bg-teal-500" },
  income: { label: "Income", dot: "bg-emerald-500" },
};

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.abs(n));

/* ------------------------------------------------------------------ */
/* Feed                                                                 */
/* ------------------------------------------------------------------ */

/**
 * An expense feed that understands itself: merchants are categorised,
 * subscriptions counted, unusual charges flagged with how unusual they
 * are, refunds linked back to the original transaction — and category
 * filters re-cascade the list.
 */
export function ExpenseFeed({
  items = DEMO_EXPENSES,
  currency = "₹",
  className,
  ref,
  ...rest
}: ExpenseFeedProps) {
  const reduced = useReducedMotion();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [filter, setFilter] = React.useState<ExpenseCategory | "all">("all");
  const [query, setQuery] = React.useState("");
  const [linked, setLinked] = React.useState<string | null>(null);

  const visible = items.filter(
    (i) =>
      (filter === "all" || i.category === filter) &&
      i.merchant.toLowerCase().includes(query.toLowerCase())
  );
  const days = [...new Set(visible.map((i) => i.day))];
  const usedCategories = [...new Set(items.map((i) => i.category))];

  /* Rows cascade in whenever the visible set changes. */
  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;
      const rows = gsap.utils.toArray<HTMLElement>(list.querySelectorAll("[data-row]"));
      if (reduced) {
        gsap.set(rows, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        rows,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out", stagger: 0.035, overwrite: true }
      );
    },
    { dependencies: [filter, query, reduced], scope: listRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="expense-feed"
      className={cn(
        "w-full max-w-md rounded-3xl border border-border/60 bg-card p-5 shadow-md",
        className
      )}
      {...rest}
    >
      {/* Search + filters */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search merchants…"
        aria-label="Search transactions"
        className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/60 hover:border-ring/30 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
      />
      <LayoutGroup id={uid}>
        <div className="isolate mt-2.5 flex flex-wrap gap-1.5">
          {(["all", ...usedCategories] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c as ExpenseCategory | "all")}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-3 py-1 type-meta font-medium transition-colors duration-200",
                filter === c ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {filter === c ? (
                <motion.span
                  layoutId={`ef-${uid}`}
                  transition={reduced ? { duration: 0 } : filterSpring}
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                />
              ) : (
                <span className="absolute inset-0 -z-10 rounded-full bg-muted" />
              )}
              {c !== "all" ? (
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", CATEGORY_META[c as ExpenseCategory].dot)}
                />
              ) : null}
              {c === "all" ? "All" : CATEGORY_META[c as ExpenseCategory].label}
            </button>
          ))}
        </div>
      </LayoutGroup>

      {/* Feed */}
      <div ref={listRef} className="mt-3 flex flex-col gap-3">
        {days.length === 0 ? (
          <p className="rounded-lg bg-muted/50 px-3 py-6 text-center text-xs text-muted-foreground">
            Nothing matches — clear the search or pick another category.
          </p>
        ) : null}
        {days.map((day) => (
          <div key={day}>
            <p className="px-1 type-overline text-muted-foreground">
              {day}
            </p>
            <ul className="mt-1 flex flex-col gap-1">
              {visible
                .filter((i) => i.day === day)
                .map((i) => {
                  const meta = CATEGORY_META[i.category];
                  const isLinkTarget = linked === i.id || (linked != null && i.refundOf === linked);
                  return (
                    <li key={i.id} data-row>
                      <div
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 shadow-xs transition-colors duration-300",
                          i.unusualMultiple
                            ? "border-warning/50 bg-warning/5"
                            : isLinkTarget
                              ? "border-info/60 bg-info/5"
                              : "border-border/60 bg-background/60"
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full type-caption font-bold text-white",
                            meta.dot
                          )}
                        >
                          {i.merchant[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {i.merchant}
                          </p>
                          <p className="flex flex-wrap items-center gap-1.5 type-caption text-muted-foreground">
                            {meta.label}
                            {i.recurringMonth ? (
                              <Badge variant="secondary" className="px-1 py-0 text-[9px]">
                                Subscription · month {i.recurringMonth}
                              </Badge>
                            ) : null}
                            {i.unusualMultiple ? (
                              <span className="font-medium text-warning">
                                {i.unusualMultiple}× your usual here
                              </span>
                            ) : null}
                            {i.refundOf ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setLinked((l) => (l === i.refundOf ? null : i.refundOf!))
                                }
                                className="font-medium text-info underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                refund — show original
                              </button>
                            ) : null}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 font-mono text-sm numeric",
                            i.amount > 0 ? "font-semibold text-market-up" : "text-foreground"
                          )}
                        >
                          {i.amount > 0 ? "+" : "−"}
                          {currency}
                          {inr(i.amount)}
                        </span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
