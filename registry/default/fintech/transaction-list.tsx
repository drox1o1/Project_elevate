"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export interface Transaction {
  id: string;
  title: string;
  subtitle?: string;
  /** Positive = credit (emerald), negative = debit. */
  amount: number;
  icon?: React.ReactNode;
}

export interface TransactionListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: Transaction[];
  loading?: boolean;
  locale?: string;
  currency?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const SKELETON_WIDTHS = [
  ["w-24", "w-16", "w-14"],
  ["w-32", "w-20", "w-12"],
  ["w-20", "w-14", "w-16"],
  ["w-28", "w-24", "w-12"],
  ["w-24", "w-16", "w-14"],
];

export function TransactionList({
  items,
  loading = false,
  locale = "en-IN",
  currency = "INR",
  className,
  ref,
  ...rest
}: TransactionListProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const format = React.useCallback(
    (n: number) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Math.abs(n)),
    [locale, currency]
  );

  // Rows cascade on scroll-in, once.
  useGSAP(
    () => {
      if (loading) return;
      const rows = gsap.utils.toArray<HTMLElement>(
        rootRef.current?.querySelectorAll('[data-slot="transaction-row"]') ?? []
      );
      if (!rows.length) return;
      if (reduced) {
        gsap.set(rows, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        rows,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.04,
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { dependencies: [loading, items, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="transaction-list"
      className={cn(
        "w-full divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm",
        className
      )}
      {...rest}
    >
      {loading
        ? SKELETON_WIDTHS.map((widths, i) => (
            <div
              key={i}
              data-slot="transaction-skeleton"
              className="flex animate-[duku-fade-in_0.25s_ease-out] items-center gap-3 px-4 py-3"
            >
              <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                <span className="absolute inset-0 animate-[duku-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    "relative h-3 overflow-hidden rounded bg-muted",
                    widths[0]
                  )}
                >
                  <span className="absolute inset-0 animate-[duku-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
                </span>
                <span
                  className={cn(
                    "relative h-2.5 overflow-hidden rounded bg-muted",
                    widths[1]
                  )}
                >
                  <span className="absolute inset-0 animate-[duku-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
                </span>
              </div>
              <span
                className={cn(
                  "relative h-3 overflow-hidden rounded bg-muted",
                  widths[2]
                )}
              >
                <span className="absolute inset-0 animate-[duku-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
              </span>
            </div>
          ))
        : items.map((tx) => {
            const credit = tx.amount >= 0;
            return (
              <div
                key={tx.id}
                data-slot="transaction-row"
                className="group flex items-center gap-3 px-4 py-3 opacity-0 transition-colors duration-200 hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset [&>svg]:size-4",
                    credit
                      ? "bg-market-up/10 text-market-up ring-market-up/20"
                      : "bg-muted text-muted-foreground ring-border/50"
                  )}
                >
                  {tx.icon ?? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {credit ? (
                        <path d="M12 19V5M5 12l7 7 7-7" />
                      ) : (
                        <>
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <path d="M2 10h20" />
                        </>
                      )}
                    </svg>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {tx.title}
                  </p>
                  {tx.subtitle ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {tx.subtitle}
                    </p>
                  ) : null}
                </div>
                <span
                  data-slot="amount"
                  className={cn(
                    "shrink-0 text-sm font-semibold numeric transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0",
                    credit ? "text-market-up" : "text-foreground"
                  )}
                >
                  {credit ? "+" : "−"}
                  {format(tx.amount)}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="-ml-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-60 -translate-x-1 motion-reduce:transition-none"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
            );
          })}
    </div>
  );
}
