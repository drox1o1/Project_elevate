"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { ConfidenceBadge } from "@/components/pop-ppp/confidence-badge";
import type { Confidence } from "@/lib/pop-ppp/types";

gsap.registerPlugin(ScrollTrigger);

/**
 * The cold open (PRD §A).
 *
 * The page starts with the line and nothing else. As the reader scrolls, the
 * dialogue settles upward and the indexed object arrives underneath it — the
 * transition from cultural memory to economic model, which is the whole
 * premise of the section stated once in motion.
 *
 * Pinning is desktop-only and short: a long pin on a phone is a scroll
 * hijack, not a narrative. Under reduced motion the section renders in its
 * resolved state and the scroll behaves normally.
 *
 * Motion ownership: GSAP.
 */

export interface ColdOpenProps {
  dialogue: string;
  gloss?: string;
  dialogueVerified: boolean;
  indexName: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  confidence: Confidence;
  accent: { light: string; dark: string };
  className?: string;
}

export function ColdOpen({
  dialogue,
  gloss,
  dialogueVerified,
  indexName,
  subtitle,
  meta,
  confidence,
  accent,
  className,
}: ColdOpenProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const quote = root.querySelector<HTMLElement>("[data-cold-quote]");
      const body = root.querySelector<HTMLElement>("[data-cold-body]");
      const cue = root.querySelector<HTMLElement>("[data-cold-cue]");
      if (!quote || !body) return;

      if (reduced) {
        gsap.set([quote, body], { clearProps: "all" });
        gsap.set(body, { opacity: 1, y: 0 });
        if (cue) gsap.set(cue, { opacity: 0 });
        return;
      }

      const mm = gsap.matchMedia();

      // Entrance is the same everywhere: the line arrives, once.
      gsap.fromTo(
        quote,
        { opacity: 0, y: 18, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power3.out",
          clearProps: "filter",
        }
      );

      mm.add("(min-width: 768px)", () => {
        gsap.set(body, { opacity: 0, y: 24 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=55%",
            scrub: 0.6,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });
        tl.to(quote, { scale: 0.72, yPercent: -22, ease: "none" }, 0);
        if (cue) tl.to(cue, { opacity: 0, duration: 0.15 }, 0);
        tl.to(body, { opacity: 1, y: 0, ease: "none" }, 0.35);
      });

      // Phones get the reveal without the pin.
      mm.add("(max-width: 767px)", () => {
        gsap.set(body, { opacity: 0, y: 16 });
        gsap.to(body, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: { trigger: body, start: "top 88%", once: true },
        });
        if (cue) gsap.set(cue, { opacity: 0 });
      });

      return () => mm.revert();
    },
    { dependencies: [reduced], scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-pop-cold={uid}
      className={cn(
        "relative flex min-h-[62svh] flex-col justify-center overflow-hidden px-4 py-16 md:min-h-[78svh]",
        className
      )}
      style={{ "--pop-accent": accent.light } as React.CSSProperties}
      aria-labelledby={`cold-open-${uid}`}
    >
      <style>{`.dark [data-pop-cold="${uid}"]{--pop-accent:${accent.dark}}`}</style>

      {/* A radial gradient rather than a blurred ellipse: a large `blur-3xl`
          surface bands visibly on wide viewports and reads as an artifact. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--pop-accent) 14%, transparent) 0%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl">
        <blockquote data-cold-quote className="origin-top-left">
          <p className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            &ldquo;{dialogue}&rdquo;
          </p>
          {gloss ? (
            <footer className="mt-4 type-body text-muted-foreground">{gloss}</footer>
          ) : null}
        </blockquote>

        <div data-cold-body className="mt-10 max-w-3xl md:mt-12">
          <h1
            id={`cold-open-${uid}`}
            className="type-metric text-foreground sm:text-[1.75rem]"
          >
            {indexName}
          </h1>
          <p className="mt-2 max-w-xl text-balance type-body leading-6 text-muted-foreground">
            {subtitle}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <ConfidenceBadge level={confidence} />
            {!dialogueVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-0.5 font-mono type-caption uppercase tracking-[0.08em] text-warning">
                <span aria-hidden="true">!</span> Quote unverified
              </span>
            ) : null}
          </div>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                  {m.label}
                </dt>
                <dd className="mt-0.5 type-label text-foreground numeric">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <span
          data-cold-cue
          aria-hidden="true"
          className="mt-10 hidden font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground md:block"
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
