"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { KineticHeading } from "@/registry/default/motion/kinetic-heading";
import { MagneticButton } from "@/registry/default/motion/magnetic-button";
import { Badge } from "@/registry/default/ui/badge";

/**
 * Hero choreography: the badge drops in, the kinetic headline plays its
 * char-split reveal, then the copy, CTAs and proof line rise in sequence
 * underneath — one GSAP timeline, one reduced-motion escape hatch.
 */
export function HeroIntro() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const items = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-hero]")
      );

      if (reduced) {
        gsap.set(items, { y: 0, opacity: 1, clearProps: "filter" });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", clearProps: "filter" },
      });
      tl.fromTo(
        '[data-hero="badge"]',
        { y: -12, opacity: 0, filter: "blur(6px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.5 }
      )
        // the headline's own char reveal starts via its delay prop (0.35s);
        // copy and CTAs rise while the last chars are still settling
        .fromTo(
          '[data-hero="copy"]',
          { y: 18, opacity: 0, filter: "blur(8px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55 },
          1.05
        )
        .fromTo(
          '[data-hero="cta"]',
          { y: 18, opacity: 0, filter: "blur(8px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55 },
          1.2
        )
        .fromTo(
          '[data-hero="proof"]',
          { opacity: 0, filter: "blur(4px)" },
          { opacity: 1, filter: "blur(0px)", duration: 0.6 },
          1.45
        );
    },
    { dependencies: [reduced], scope: rootRef }
  );

  return (
    <div ref={rootRef} className="flex flex-col items-center">
      <div data-hero="badge" className="mb-5 flex flex-col items-center gap-4 opacity-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-light.svg" alt="" className="pixelated h-9 w-auto dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.svg" alt="" className="pixelated hidden h-9 w-auto dark:block" />
        <Badge variant="outline" pulse className="font-pixel text-[10px] uppercase tracking-widest">
          Design engineering with AI
        </Badge>
      </div>
      <KineticHeading
        text="Interfaces your AI would not design by itself."
        className="font-pixel text-3xl leading-snug tracking-tight sm:text-4xl md:text-5xl"
        delay={0.35}
      />
      <p
        data-hero="copy"
        className="mt-6 max-w-2xl text-base text-muted-foreground opacity-0"
      >
        DUKU Labs gives developers and coding agents access to beautifully
        engineered React components, expressive motion and complete product
        workflows. Connect through MCP, describe what you are building and let
        Claude Code or Codex discover, customise and implement the right
        interface directly in your codebase.
      </p>
      <div data-hero="cta" className="mt-8 flex flex-wrap items-center justify-center gap-4 opacity-0">
        <Link href="/#access">
          <MagneticButton>Get free access</MagneticButton>
        </Link>
        <Link
          href="/connect"
          className="text-sm font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Connect to MCP
        </Link>
      </div>
      <p
        data-hero="proof"
        className="mt-6 font-pixel text-[10px] uppercase tracking-widest text-muted-foreground opacity-0"
      >
        Real products · every state · yours to customise
      </p>
    </div>
  );
}
