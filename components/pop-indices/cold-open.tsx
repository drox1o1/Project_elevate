"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { ConfidenceBadge } from "@/components/pop-indices/confidence-badge";
import { Grain } from "@/components/pop-indices/editorial";
import { IndexArtwork } from "@/components/pop-indices/index-artwork";
import type { Confidence, Motif } from "@/lib/pop-indices/types";

gsap.registerPlugin(ScrollTrigger);

/**
 * The cold open.
 *
 * A dark band in both themes — the scene half of the page, before analysis
 * starts. The line arrives alone; as the reader scrolls it settles upward and
 * the index's own series is drawn behind it as a large graphic, so the
 * transition from cultural memory to economic model happens literally: the
 * quote recedes and the data appears in its place.
 *
 * Pinning is desktop-only and short. A long pin on a phone is a scroll
 * hijack, not a narrative. Under reduced motion the section renders resolved.
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
  motif: Motif;
  /** The index's series, drawn as the band's artwork when there is no key art. */
  values: number[];
  /** Key art for the index, if it has any. */
  imageSrc?: string | null;
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
  motif,
  values,
  imageSrc,
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
      const art = root.querySelector<HTMLElement>("[data-cold-art]");
      const cue = root.querySelector<HTMLElement>("[data-cold-cue]");
      if (!quote || !body) return;

      // A photograph carries more weight than a hairline drawing, so it
      // resolves brighter. The artwork stays deliberately faint — it is a
      // texture behind the type, not an image in its own right.
      const artOpacity = imageSrc ? 0.62 : 0.32;

      if (reduced) {
        gsap.set([quote, body], { clearProps: "all" });
        gsap.set(body, { opacity: 1, y: 0 });
        if (art) gsap.set(art, { opacity: artOpacity, scale: 1 });
        if (cue) gsap.set(cue, { opacity: 0 });
        return;
      }

      const mm = gsap.matchMedia();

      gsap.fromTo(
        quote,
        { opacity: 0, y: 20, filter: "blur(12px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "power3.out",
          clearProps: "filter",
        }
      );

      mm.add("(min-width: 768px)", () => {
        gsap.set(body, { opacity: 0, y: 26 });
        if (art) gsap.set(art, { opacity: 0, scale: 0.88 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=60%",
            scrub: 0.6,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });
        tl.to(quote, { scale: 0.7, yPercent: -26, ease: "none" }, 0);
        if (cue) tl.to(cue, { opacity: 0, duration: 0.15 }, 0);
        if (art) tl.to(art, { opacity: artOpacity, scale: 1, ease: "none" }, 0.1);
        tl.to(body, { opacity: 1, y: 0, ease: "none" }, 0.4);
      });

      mm.add("(max-width: 767px)", () => {
        gsap.set(body, { opacity: 0, y: 16 });
        if (art) gsap.set(art, { opacity: imageSrc ? 0.4 : 0.24 });
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
    { dependencies: [reduced, imageSrc], scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-pop-cold={uid}
      className={cn(
        "relative isolate flex min-h-[66svh] flex-col justify-center overflow-hidden px-4 py-20 md:min-h-[82svh]",
        className
      )}
      style={
        {
          background: "#08080a",
          "--pop-accent": accent.dark,
        } as React.CSSProperties
      }
      aria-labelledby={`cold-open-${uid}`}
    >
      <Grain />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[30rem]"
        style={{
          background:
            "radial-gradient(56% 100% at 50% 0%, color-mix(in oklab, var(--pop-accent) 22%, transparent) 0%, transparent 100%)",
        }}
      />

      {/* Key art, or the series as a large graphic — arriving as the quote
          recedes, so the scene gives way to the thing being measured. */}
      {imageSrc ? (
        <div
          data-cold-art
          className="pointer-events-none absolute right-0 top-1/2 z-0 hidden h-[26rem] w-[26rem] -translate-y-1/2 overflow-hidden rounded-3xl opacity-0 md:block lg:right-8 lg:h-[30rem] lg:w-[30rem]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt="" className="size-full object-cover" />
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #08080a 0%, transparent 45%), linear-gradient(to top, #08080a 0%, transparent 40%)",
            }}
          />
        </div>
      ) : (
        <IndexArtwork
          values={values}
          motif={motif}
          weight="bold"
          data-cold-art
          className="pointer-events-none absolute -right-16 top-1/2 z-0 h-[30rem] w-[30rem] -translate-y-1/2 opacity-0 sm:-right-8 md:right-4 lg:right-16"
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <blockquote data-cold-quote className="origin-top-left">
          <p className="max-w-4xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            &ldquo;{dialogue}&rdquo;
          </p>
          {gloss ? (
            <footer className="mt-5 max-w-xl type-body text-white/50">{gloss}</footer>
          ) : null}
        </blockquote>

        <div data-cold-body className="mt-12 max-w-3xl">
          <h1
            id={`cold-open-${uid}`}
            className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[1.75rem]"
          >
            {indexName}
          </h1>
          <p className="mt-3 max-w-xl text-balance type-body leading-7 text-white/55">
            {subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <ConfidenceBadge level={confidence} />
            {!dialogueVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-0.5 font-mono type-caption uppercase tracking-[0.08em] text-warning">
                <span aria-hidden="true">!</span> Quote unverified
              </span>
            ) : null}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:flex-wrap">
            {meta.map((m) => (
              <div key={m.label} className="min-w-0">
                <dt className="type-caption uppercase tracking-[0.1em] text-white/40">
                  {m.label}
                </dt>
                <dd className="mt-1 type-label text-white numeric">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <span
          data-cold-cue
          aria-hidden="true"
          className="mt-12 hidden font-mono type-caption uppercase tracking-[0.2em] text-white/35 md:block"
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
