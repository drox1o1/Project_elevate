"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { StreamText } from "@/registry/default/ai/stream-text";
import { ThinkingIndicator } from "@/registry/default/ai/thinking-indicator";
import { Badge } from "@/registry/default/ui/badge";
import { SignupCard } from "@/registry/default/blocks/signup-card";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const PROMPT =
  "Add a signup flow with live validation, a password strength meter and a success morph. Use DUKU Labs.";

const MATCHES = [
  { name: "signup-card", confidence: "0.96" },
  { name: "field", confidence: "0.84" },
  { name: "otp-input", confidence: "0.73" },
];

/**
 * The hero's scripted agent session: prompt → MCP discovery → install →
 * the real, working SignupCard. Every artifact shown is real — the search
 * results mirror what the /mcp endpoint returns for this prompt.
 */
export function AgentDemo() {
  const reduced = useReducedMotion();
  // Step 0 prompt · 1 searching · 2 results · 3 inspect · 4 install · 5 render
  const [step, setStep] = React.useState(0);
  const [replayKey, setReplayKey] = React.useState(0);

  React.useEffect(() => {
    if (reduced) {
      setStep(5);
      return;
    }
    setStep(0);
  }, [reduced, replayKey]);

  const advance = React.useCallback(
    (to: number, delay: number) => {
      const t = setTimeout(() => setStep((s) => (s < to ? to : s)), delay);
      return () => clearTimeout(t);
    },
    []
  );

  React.useEffect(() => {
    if (reduced) return;
    if (step === 1) return advance(2, 1400);
    if (step === 2) return advance(3, 1300);
    if (step === 3) return advance(4, 1100);
    if (step === 4) return advance(5, 1200);
  }, [step, reduced, advance]);

  const fade = (visible: boolean) =>
    reduced
      ? { opacity: visible ? 1 : 0 }
      : undefined;

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-agent-active" aria-hidden="true" />
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

      <div key={replayKey} className="grid gap-6 p-5 lg:grid-cols-[1fr_auto]">
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
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={fade(true)}
              className="flex flex-col gap-2"
            >
              <span className="text-muted-foreground">
                → search_components ·{" "}
                <span className="text-foreground">3 matches</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {MATCHES.map((m, i) => (
                  <motion.span
                    key={m.name}
                    initial={reduced ? false : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={reduced ? undefined : { delay: 0.15 + i * 0.12 }}
                  >
                    <Badge variant="outline">
                      {m.name}
                      <span className="ml-1.5 text-muted-foreground">
                        {m.confidence}
                      </span>
                    </Badge>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ) : null}

          {step >= 3 ? (
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground"
            >
              → get_component signup-card ·{" "}
              <span className="text-foreground">
                props · states · motion spec · source
              </span>
            </motion.span>
          ) : null}

          {step >= 4 ? (
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="break-all text-muted-foreground"
            >
              $ npx shadcn@latest add labs.duku.design/r/signup-card.json
              {step >= 5 ? (
                <span className="ml-2 text-success">✓ installed</span>
              ) : null}
            </motion.span>
          ) : null}
        </div>

        <div className="flex items-start justify-center lg:w-[360px]">
          {step >= 5 ? (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? undefined : { duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              <SignupCard
                title="Create your account"
                onSubmit={() => wait(1100)}
                onOAuth={() => {}}
              />
            </motion.div>
          ) : (
            <div
              aria-hidden="true"
              className="hidden h-[420px] w-full rounded-2xl border border-dashed border-border lg:flex lg:items-center lg:justify-center"
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
