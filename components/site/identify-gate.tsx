"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import { Field } from "@/registry/default/ui/field";

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

const STORAGE_KEY = "duku:identity";

interface Identity {
  email: string;
  company: string;
  role: string;
}

/**
 * DUKU Labs is open source and free — but the first time someone reaches for
 * the MCP connection or a component install command we ask who they are:
 * email, company and role. Once identified (persisted in localStorage) the
 * gate steps aside and reveals its children on every later visit.
 */
export function IdentifyGate({
  intent,
  title = "Tell us who you are",
  description = "DUKU Labs is open source and free. Before you connect, tell us who's building — it shapes what we ship next.",
  children,
  className,
}: {
  intent: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [ready, setReady] = React.useState(false);
  const [identified, setIdentified] = React.useState(false);

  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [role, setRole] = React.useState("");
  const [errors, setErrors] = React.useState<{
    email?: string;
    company?: string;
    role?: string;
  }>({});
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Identity>;
        if (parsed?.email && parsed?.company && parsed?.role) {
          setIdentified(true);
        }
      }
    } catch {
      // Ignore malformed/unavailable storage — fall back to the gate.
    }
    setReady(true);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (company.trim().length < 2) next.company = "Company or project name.";
    if (!ROLES.includes(role as (typeof ROLES)[number]))
      next.role = "Select your role.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, role, intent }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Something went wrong.");
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ email, company, role } satisfies Identity)
        );
      } catch {
        // Non-fatal: reveal for this session even if storage is blocked.
      }
      setIdentified(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  // Avoid a flash of the gate for already-identified visitors during hydration.
  if (!ready) {
    return <div className={cn("min-h-24", className)} aria-hidden />;
  }

  if (identified) return <>{children}</>;

  return (
    <div
      data-slot="identify-gate"
      className={cn("pixel-frame bg-card p-5 sm:p-6", className)}
    >
      <p className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
        ▚ Open source · MIT · free
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-4" aria-label={title}>
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
              "h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors",
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

        {serverError ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {serverError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[38ch] text-[11px] leading-4 text-muted-foreground">
            No card, no key. This just unlocks the copy-paste connection on this
            device.
          </p>
          <Button type="submit" loading={pending}>
            Reveal connection
          </Button>
        </div>
      </form>
    </div>
  );
}
