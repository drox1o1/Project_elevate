"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { Badge } from "@/registry/default/ui/badge";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

export interface PricingCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  plan: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currencyPrefix?: string;
  features: string[];
  featured?: boolean;
  ctaLabel?: string;
  savingsLabel?: string;
  onSelect?: (billing: "monthly" | "yearly") => void;
  ref?: React.Ref<HTMLDivElement>;
}

function FeatureCheck({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = React.useState(false);
  React.useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    const t = setTimeout(() => setDrawn(true), delay);
    return () => clearTimeout(t);
  }, [delay, reduced]);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
      aria-hidden="true"
    >
      <path
        d="M5 13l4 4L19 7"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={drawn ? 0 : 1}
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
}

export function PricingCard({
  plan,
  description,
  monthlyPrice,
  yearlyPrice,
  currencyPrefix = "$",
  features,
  featured = false,
  ctaLabel = "Get started",
  savingsLabel = "Save 20%",
  onSelect,
  className,
  ref,
  ...rest
}: PricingCardProps) {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">(
    "monthly"
  );
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const springStandard = {
    type: "spring",
    stiffness: 380,
    damping: 32,
  } as const;

  // Feature rows cascade on mount.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const rows = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll('[data-slot="feature-row"]')
      );
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
          stagger: 0.05,
          delay: 0.1,
        }
      );
    },
    { scope: rootRef }
  );

  const price = billing === "monthly" ? monthlyPrice : yearlyPrice;

  return (
    <div
      ref={rootRef}
      data-slot="pricing-card"
      className={cn(
        "relative w-full max-w-sm rounded-3xl border bg-card p-6",
        featured
          ? "border-primary/30 shadow-lg ring-1 ring-primary/10"
          : "border-border/60 shadow-md",
        className
      )}
      {...rest}
    >
      {featured ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden rounded-t-3xl"
          >
            <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(70%_100%_at_50%_0%,hsl(var(--elevation-hue)/0.06),transparent)] dark:bg-[radial-gradient(70%_100%_at_50%_0%,hsl(0_0%_100%/0.06),transparent)]" />
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge>Most popular</Badge>
          </div>
        </>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <h3 className="type-title text-foreground">{plan}</h3>
        {/* billing toggle: two-option sliding pill */}
        <div
          data-slot="billing-toggle"
          role="tablist"
          aria-label="Billing period"
          className="relative isolate inline-flex items-center rounded-lg bg-muted p-0.5"
        >
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              role="tab"
              aria-selected={billing === b}
              onClick={() => {
                setBilling(b);
                onSelect?.(b);
              }}
              className={cn(
                "relative z-10 rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                "transition-colors duration-200",
                billing === b
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {billing === b ? (
                <motion.span
                  layoutId={`billing-pill-${plan}`}
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-md bg-background shadow-sm"
                  transition={reduced ? { duration: 0 } : springStandard}
                />
              ) : null}
              {b}
            </button>
          ))}
        </div>
      </div>

      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          <NumberFlow value={price} prefix={currencyPrefix} />
        </span>
        <span className="text-sm text-muted-foreground">
          /{billing === "monthly" ? "mo" : "yr"}
        </span>
        <AnimatePresence>
          {billing === "yearly" ? (
            <motion.span
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={
                reduced ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }
              }
            >
              <Badge variant="success">{savingsLabel}</Badge>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <ul className="mt-6 flex flex-col gap-2.5">
        {features.map((feature, i) => (
          <li
            key={feature}
            data-slot="feature-row"
            className="flex items-start gap-2.5 text-sm text-foreground opacity-0"
          >
            <FeatureCheck delay={150 + i * 50} />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button
          className="w-full"
          variant={featured ? "default" : "outline"}
          onClick={() => onSelect?.(billing)}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
