import type { Metadata } from "next";
import Link from "next/link";
import { PricingContent } from "@/components/site/pricing-content";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20">
      <div className="pixel-frame mx-auto mb-10 max-w-2xl bg-card p-4 text-center">
        <p className="font-pixel text-xs uppercase tracking-widest text-success">
          ▚ Free while in beta
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Every component is free to integrate today —{" "}
          <Link
            href="/#access"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            grab access
          </Link>{" "}
          and tell us what you&apos;re building. The tiers below are what
          pricing will look like at 1.0.
        </p>
      </div>
      <h1 className="text-center font-pixel text-2xl uppercase tracking-wide sm:text-3xl">
        Simple pricing
      </h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Fifteen components free forever. The full catalog one-time, monthly or
        as a team licence.
      </p>
      <PricingContent />
    </main>
  );
}
