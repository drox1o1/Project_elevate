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

const ROLES = [
  "Owner",
  "Founder",
  "Designer",
  "Developer",
  "Product manager",
  "Engineering lead",
  "Student",
  "Other",
] as const;

const MCP_CMD = "claude mcp add duku-labs --transport http https://labs.duku.design/mcp";
const CLI_CMD = "npx shadcn@latest add https://labs.duku.design/r/kyc-flow.json";

/**
 * The identify step: DUKU Labs is open source and free — we just want to know
 * who's building. We take email, company and role (owner, designer, …), then
 * the form morphs straight into the connect commands, so the reward for
 * telling us is immediate. Success also records a shared identity in
 * localStorage so the MCP/install gates elsewhere step aside.
 */
export function AccessForm({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);

  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [role, setRole] = React.useState("");
  const [building, setBuilding] = React.useState("");
  const [purposes, setPurposes] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<{
    email?: string;
    company?: string;
    role?: string;
    building?: string;
  }>({});
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const togglePurpose = (p: string) =>
    setPurposes((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (company.trim().length < 2) next.company = "Company or project name.";
    if (!ROLES.includes(role as (typeof ROLES)[number])) next.role = "Select your role.";
    if (building.trim().length < 3) next.building = "A sentence is plenty — what are you making?";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, role, building, purposes, intent: "access-form" }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Something went wrong.");
      try {
        window.localStorage.setItem(
          "duku:identity",
          JSON.stringify({ email, company, role })
        );
      } catch {
        // Non-fatal: the reward still shows this session.
      }
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
            Everything is yours — the whole catalog and the MCP server, open
            source under MIT. We&apos;ll email you when new domain packs land.
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
            <Field label="Company / project" state={errors.company ? "error" : null} message={errors.company}>
              <Input
                value={company}
                invalid={!!errors.company}
                autoComplete="organization"
                placeholder="Acme, Inc."
                onChange={(e) => {
                  setCompany(e.target.value);
                  setErrors((x) => ({ ...x, company: undefined }));
                }}
              />
            </Field>
          </div>

          <Field label="Who are you?" state={errors.role ? "error" : null} message={errors.role}>
            <select
              value={role}
              aria-invalid={!!errors.role}
              onChange={(e) => {
                setRole(e.target.value);
                setErrors((x) => ({ ...x, role: undefined }));
              }}
              className={cn(
                "h-9 w-full rounded-none border bg-background px-3 text-sm text-foreground outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring",
                errors.role ? "border-destructive" : "border-input"
              )}
            >
              <option value="" disabled>
                Select your role…
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

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
              Open source, MIT. No card, no key — your answers shape which
              components we build next.
            </p>
            <Button type="submit" loading={pending}>
              Get the commands
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
