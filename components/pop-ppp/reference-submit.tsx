"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import { Textarea } from "@/registry/default/ui/textarea";
import { Field } from "@/registry/default/ui/field";

/**
 * Reference submission (PRD §6).
 *
 * The form asks for the thing that actually decides whether a reference can
 * become an index: the measurable object, quantity or transaction. Asking for
 * it up front is not friction — a scene without a measurable unit cannot
 * clear the qualification framework, and saying so here is more honest than
 * collecting suggestions we will silently drop.
 */

export function ReferenceSubmit({ className }: { className?: string }) {
  const [reference, setReference] = React.useState("");
  const [measurable, setMeasurable] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<{
    reference?: string;
    measurable?: string;
  }>({});
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (reference.trim().length < 3) next.reference = "A film and a line is enough.";
    if (measurable.trim().length < 3)
      next.measurable = "Name the object, quantity or transaction.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/pop-ppp/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          measurable,
          email: email || undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Something went wrong.");
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div
        className={cn("rounded-xl border border-border bg-card p-5 sm:p-6", className)}
      >
        <p className="type-title text-success">Logged for research.</p>
        <p className="mt-2 max-w-prose type-body leading-6 text-muted-foreground">
          It goes into the queue against the same five tests every index has to
          pass: recognition, specificity, data availability, economic meaning
          and narrative contrast. Most references fail on data availability —
          that is usually where a good idea dies.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Suggest a reference"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:p-6",
        className
      )}
    >
      <Field
        label="Which scene?"
        state={errors.reference ? "error" : null}
        message={errors.reference}
      >
        <Input
          value={reference}
          invalid={!!errors.reference}
          placeholder="Film, character, the line if you remember it"
          onChange={(e) => {
            setReference(e.target.value);
            setErrors((x) => ({ ...x, reference: undefined }));
          }}
        />
      </Field>

      <Field
        label="What exactly should be measured?"
        state={errors.measurable ? "error" : null}
        message={errors.measurable}
      >
        <Textarea
          value={measurable}
          rows={2}
          maxRows={5}
          invalid={!!errors.measurable}
          placeholder="An object, a quantity or a transaction — “50 tolas of gold”, not “his lifestyle”."
          onChange={(e) => {
            setMeasurable(e.target.value);
            setErrors((x) => ({ ...x, measurable: undefined }));
          }}
        />
      </Field>

      <Field label="Email (optional)">
        <Input
          type="email"
          value={email}
          autoComplete="email"
          placeholder="If you want to know when it publishes"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      {serverError ? (
        <p role="alert" className="type-meta font-medium text-destructive">
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[40ch] type-caption leading-5 text-muted-foreground">
          Submissions are read, not published. There is no open comment feed in
          this release.
        </p>
        <Button type="submit" loading={pending}>
          Submit reference
        </Button>
      </div>
    </form>
  );
}
