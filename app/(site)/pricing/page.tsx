import type { Metadata } from "next";
import { PricingContent } from "@/components/site/pricing-content";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20">
      <h1 className="text-center text-3xl font-semibold tracking-tight">
        Simple pricing
      </h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Three components free forever. Everything else with a license key.
      </p>
      <PricingContent />
    </main>
  );
}
