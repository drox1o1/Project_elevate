"use client";

import { PricingCard } from "@/registry/default/blocks/pricing-card";
import { NewsletterInput } from "@/registry/default/blocks/newsletter-input";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function PricingContent() {
  return (
    <>
      <div className="mt-12 grid justify-items-center gap-8 md:grid-cols-2">
        <PricingCard
          plan="Free"
          description="Kick the tires with the signature motion pieces."
          monthlyPrice={0}
          yearlyPrice={0}
          features={[
            "Kinetic Heading",
            "Magnetic Button",
            "Button (the state exemplar)",
            "Community support",
          ]}
          ctaLabel="Start free"
        />
        <PricingCard
          plan="Pro"
          description="The full 43-component catalog."
          monthlyPrice={49}
          yearlyPrice={470}
          features={[
            "All 43 components",
            "Registry access + updates",
            "Unlimited projects",
            "Priority support",
          ]}
          featured
        />
      </div>
      <div className="mt-20 flex flex-col items-center gap-3">
        <h2 className="text-lg font-semibold">Get release notes</h2>
        <NewsletterInput onSubmit={() => wait(1000)} />
      </div>
    </>
  );
}
