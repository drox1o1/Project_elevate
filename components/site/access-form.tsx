"use client";

import * as React from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import { Textarea } from "@/registry/default/ui/textarea";
import { Field } from "@/registry/default/ui/field";
import { CopyButton } from "@/registry/default/ui/kbd";

const PURPOSES = [
  "Fintech & markets",
  "Payments & banking",
  "Healthcare",
  "AI agents",
  "Enterprise ops",
  "Side project",
] as const;

const MCP_CMD = "claude mcp add duku-labs --transport http https://labs.duku.design/mcp";
const CLI_CMD = "npx shadcn@latest add https://labs.duku.design/r/kyc-flow.json";

/**
 * The lead magnet: everything is free while we're in beta — we just want
 * to know who's building what. Success morphs straight into the install
 * commands, so the reward for telling us is immediate.
 */
export function AccessForm({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);

  const [email, setEmail] = React.useState("");
  const [building, setBuilding] = React.useState("");
  const [purposes, setPurposes] = React.useState<string[]>([]);
  const [role, setRole] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; building?: string }>({});
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const togglePurpose = (p: string) =>
    setPurposes((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (building.trim().length < 3) next.building = "A sentence is plenty — what are you making?";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, building, purposes, role: role || undefined }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Something went wrong.");
      // Blur-morph the form into the reward panel.
      if (!reduced && rootRef.current) {
        await new Promise<void>((resolve) => {
          gsap.to(rootRef.current, {
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.25,
            ease: "power2.in",
            onComplete: resolve,
          });
        });
      }
      setDone(true);
      if (!reduced && rootRef.current) {
        gsap.fromTo(
          rootRef.current,
          { opacity: 0, filter: "blur(6px)", y: 10 },
          { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.4, ease: "power3.out", clearProps: "filter" }
        );
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      ref={rootRef}
      data-slot="access-form"
      className={cn("pixel-frame bg-card p-5 sm:p-6", className)}
    >
      {done ? (
        <div>
          <p className="font-pixel text-sm uppercase tracking-widest text-success">
            ▚ Access granted
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Everything below is yours — all {""}components, free while we&apos;re
            in beta. We&apos;ll email you when new domain packs land.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <p className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
              Connect your agent
            </p>
            <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-none border border-border bg-muted/50 py-1.5 pl-3 pr-1.5">
              <code className="whitespace-nowrap font-mono text-[12px] text-foreground">{MCP_CMD}</code>
              <CopyButton value={MCP_CMD} />
            </div>
            <p className="mt-1 font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
              Or install a component
            </p>
            <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-none border border-border bg-muted/50 py-1.5 pl-3 pr-1.5">
              <code className="whitespace-nowrap font-mono text-[12px] text-foreground">{CLI_CMD}</code>
              <CopyButton value={CLI_CMD} />
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" aria-label="Get free access">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" state={errors.email ? "error" : null} message={errors.email}>
              <Input
                type="email"
                value={email}
                invalid={!!errors.email}
                autoComplete="email"
                placeholder="you@company.com"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((x) => ({ ...x, email: undefined }));
                }}
              />
            </Field>
            <Field label="Role / company (optional)">
              <Input
                value={role}
                placeholder="Design engineer @ …"
                onChange={(e) => setRole(e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="What product are you building?"
            state={errors.building ? "error" : null}
            message={errors.building}
          >
            <Textarea
              value={building}
              rows={2}
              maxRows={5}
              invalid={!!errors.building}
              placeholder="A broking app with an options screen… a patient portal… an agent console…"
              onChange={(e) => {
                setBuilding(e.target.value);
                setErrors((x) => ({ ...x, building: undefined }));
              }}
            />
          </Field>

          <div>
            <p className="text-sm font-medium text-foreground">
              What do you want the library for?
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PURPOSES.map((p) => {
                const on = purposes.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={on}
                    onClick={() => togglePurpose(p)}
                    className={cn(
                      "border px-2.5 py-1 font-pixel text-[10px] uppercase tracking-wider transition-colors duration-150",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {serverError ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {serverError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-[36ch] text-[11px] leading-4 text-muted-foreground">
              Free while in beta. No card, no key — your answers shape which
              components we build next.
            </p>
            <Button type="submit" loading={pending}>
              Get free access
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
