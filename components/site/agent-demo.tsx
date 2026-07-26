"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { StreamText } from "@/registry/default/ai/stream-text";
import { ThinkingIndicator } from "@/registry/default/ai/thinking-indicator";
import { Badge } from "@/registry/default/ui/badge";
import {
  OptionChain,
  generateOptionChain,
} from "@/registry/default/fintech/option-chain";

const PROMPT =
  "Add a NIFTY option chain with live Greeks, an expiry switch and an order ticket. Use DUKU Labs.";

const MATCHES = [
  { name: "option-chain", confidence: "0.97" },
  { name: "greeks-panel", confidence: "0.82" },
  { name: "order-ticket", confidence: "0.74" },
];

/** GSAP mount entrance: rise from below, optional back-out pop. */
function Rise({
  children,
  className,
  delay = 0,
  y = 12,
  pop = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  pop?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;
      if (reduced) {
        gsap.set(ref.current, {
          y: 0,
          scale: 1,
          opacity: 1,
          clearProps: "filter",
        });
        return;
      }
      gsap.fromTo(
        ref.current,
        pop
          ? { scale: 0.7, opacity: 0, filter: "blur(5px)" }
          : { y, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: pop ? 0.45 : 0.4,
          ease: pop ? "back.out(2)" : "power3.out",
          delay,
          clearProps: "filter",
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={cn("opacity-0", className)}>
      {children}
    </div>
  );
}

/** The house check-draw, GSAP-drawn when the install line lands. */
function CheckDraw() {
  const ref = React.useRef<SVGPathElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current) return;
    if (reduced) {
      gsap.set(ref.current, { strokeDashoffset: 0 });
      return;
    }
    gsap.fromTo(
      ref.current,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.45, ease: "power2.out", delay: 0.15 }
    );
  });

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline size-3.5 text-success"
      aria-hidden="true"
    >
      <path
        ref={ref}
        d="M5 13l4 4L19 7"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
      />
    </svg>
  );
}

/**
 * The hero's scripted agent session: prompt → MCP discovery → install →
 * the real, working OptionChain. Every artifact shown is real — the search
 * results mirror what the /mcp endpoint returns for this prompt, and the
 * chain's premiums and Greeks are computed with Black-Scholes.
 */
export function AgentDemo() {
  const reduced = useReducedMotion();
  // Step 0 prompt · 1 searching · 2 results · 3 inspect · 4 install · 5 render
  const [step, setStep] = React.useState(0);
  const [replayKey, setReplayKey] = React.useState(0);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Live-ticking NIFTY spot so the rendered chain reads as "for real".
  const [spot, setSpot] = React.useState(24_812.4);
  const [expiry, setExpiry] = React.useState("17 Jul");
  const dte = { "17 Jul": 4, "24 Jul": 11, "31 Jul": 18 }[expiry] ?? 7;

  React.useEffect(() => {
    if (reduced || step < 5) return;
    const id = setInterval(() => {
      setSpot((s) => +(s + (Math.random() - 0.5) * 18).toFixed(2));
    }, 1600);
    return () => clearInterval(id);
  }, [reduced, step]);

  const rows = React.useMemo(
    () => generateOptionChain({ spot, span: 4, dte }),
    [spot, dte]
  );

  React.useEffect(() => {
    setStep(reduced ? 5 : 0);
  }, [reduced, replayKey]);

  React.useEffect(() => {
    if (reduced) return;
    const delays: Record<number, number> = { 1: 1400, 2: 1300, 3: 1100, 4: 1200 };
    const ms = delays[step];
    if (!ms) return;
    const t = setTimeout(() => setStep((s) => (s < step + 1 ? step + 1 : s)), ms);
    return () => clearTimeout(t);
  }, [step, reduced]);

  // The composed interface settles in with weight: rise + soft scale.
  useGSAP(
    () => {
      if (step < 5 || !cardRef.current) return;
      if (reduced) {
        gsap.set(cardRef.current, {
          y: 0,
          scale: 1,
          opacity: 1,
          clearProps: "filter",
        });
        return;
      }
      gsap.fromTo(
        cardRef.current,
        { y: 24, scale: 0.97, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.6,
          ease: "power3.out",
          clearProps: "filter",
        }
      );
    },
    { dependencies: [step, reduced] }
  );

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-agent-active opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-agent-active" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Coding agent · connected to duku-labs MCP
          </span>
        </div>
        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Replay
        </button>
      </div>

      <div key={replayKey} className="grid gap-6 p-5">
        <div className="flex min-w-0 flex-col gap-4 font-mono text-[13px] leading-6">
          <div className="rounded-lg bg-muted/60 px-3.5 py-2.5 text-foreground">
            {reduced ? (
              <span>{PROMPT}</span>
            ) : (
              <StreamText
                text={PROMPT}
                speed={55}
                onComplete={() => setStep((s) => (s < 1 ? 1 : s))}
              />
            )}
          </div>

          {step >= 1 && step < 2 ? (
            <ThinkingIndicator label="search_components" />
          ) : null}

          {step >= 2 ? (
            <div className="flex flex-col gap-2">
              <Rise>
                <span className="text-muted-foreground">
                  → search_components ·{" "}
                  <span className="text-foreground">3 matches</span>
                </span>
              </Rise>
              <div className="flex flex-wrap gap-2">
                {MATCHES.map((m, i) => (
                  <Rise key={m.name} pop delay={0.15 + i * 0.12}>
                    <Badge variant="outline">
                      {m.name}
                      <span className="ml-1.5 text-muted-foreground">
                        {m.confidence}
                      </span>
                    </Badge>
                  </Rise>
                ))}
              </div>
            </div>
          ) : null}

          {step >= 3 ? (
            <Rise>
              <span className="text-muted-foreground">
                → get_component option-chain ·{" "}
                <span className="text-foreground">
                  props · states · motion spec · source
                </span>
              </span>
            </Rise>
          ) : null}

          {step >= 4 ? (
            <Rise>
              <span className="break-all text-muted-foreground">
                $ npx shadcn@latest add labs.duku.design/r/option-chain.json
                {step >= 5 ? (
                  <span className="ml-2 whitespace-nowrap text-success">
                    <CheckDraw /> installed
                  </span>
                ) : null}
              </span>
            </Rise>
          ) : null}
        </div>

        <div className="flex items-start justify-center">
          {step >= 5 ? (
            <div ref={cardRef} className="w-full min-w-0 opacity-0">
              <OptionChain
                rows={rows}
                spot={spot}
                expiries={["17 Jul", "24 Jul", "31 Jul"]}
                expiry={expiry}
                onExpiryChange={setExpiry}
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="hidden h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-border lg:flex"
            >
              <span className="text-xs text-muted-foreground">
                Working interface renders here
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
