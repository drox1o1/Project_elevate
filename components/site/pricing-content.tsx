"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/registry/default/ui/badge";
import { Button } from "@/registry/default/ui/button";
import { NumberFlow } from "@/registry/default/fintech/number-flow";
import { NewsletterInput } from "@/registry/default/blocks/newsletter-input";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface Tier {
  plan: string;
  description: string;
  price: number;
  priceNote: string;
  altPrice?: string;
  features: string[];
  ctaLabel: string;
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    plan: "Open",
    description: "The core primitives and signature motion, free forever.",
    price: 0,
    priceNote: "free forever",
    features: [
      "Core primitives (15 components)",
      "Selected motion components",
      "Personal and commercial use",
      "MCP discovery and search",
      "Community support",
    ],
    ctaLabel: "Start free",
  },
  {
    plan: "Pro",
    description: "The full catalog for individuals and indie products.",
    price: 149,
    priceNote: "one-time",
    altPrice: "or $19/month",
    features: [
      "All 43 components, source included",
      "Advanced workflows as they release",
      "All themes",
      "MCP implementation tools",
      "Regular releases",
    ],
    ctaLabel: "Get Pro",
    featured: true,
  },
  {
    plan: "Team",
    description: "One licence for the whole product team.",
    price: 499,
    priceNote: "per year",
    features: [
      "Team licence",
      "Shared private registry",
      "Version pinning",
      "Priority support",
      "Product-specific presets",
    ],
    ctaLabel: "Get Team",
  },
];

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
      className="mt-0.5 size-3.5 shrink-0 text-success"
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

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? undefined
          : { duration: 0.4, ease: "easeOut", delay: index * 0.08 }
      }
      className={cn(
        "relative flex w-full max-w-sm flex-col rounded-2xl border bg-card p-6 shadow-sm",
        tier.featured ? "border-primary" : "border-border"
      )}
    >
      {tier.featured ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>Most popular</Badge>
        </div>
      ) : null}

      <h3 className="text-sm font-semibold text-foreground">{tier.plan}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          <NumberFlow value={tier.price} prefix="$" />
        </span>
        <span className="text-sm text-muted-foreground">{tier.priceNote}</span>
      </div>
      <p className="mt-1 min-h-4 text-xs text-muted-foreground">
        {tier.altPrice ?? ""}
      </p>

      <ul className="mt-5 flex flex-1 flex-col gap-2.5">
        {tier.features.map((feature, i) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-foreground"
          >
            <FeatureCheck delay={200 + index * 80 + i * 50} />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button
          className="w-full"
          variant={tier.featured ? "default" : "outline"}
        >
          {tier.ctaLabel}
        </Button>
      </div>
    </motion.div>
  );
}

export function PricingContent() {
  return (
    <>
      <div className="mt-12 grid items-stretch justify-items-center gap-8 md:grid-cols-3">
        {TIERS.map((tier, i) => (
          <TierCard key={tier.plan} tier={tier} index={i} />
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-5 text-muted-foreground">
        Every tier installs components as source you own. The strongest
        components are not all behind a subscription — Pro is available
        one-time so indie developers are not locked into recurring billing.
      </p>
      <div className="mt-20 flex flex-col items-center gap-3">
        <h2 className="text-lg font-semibold">Get release notes</h2>
        <NewsletterInput onSubmit={() => wait(1000)} />
      </div>
    </>
  );
}
