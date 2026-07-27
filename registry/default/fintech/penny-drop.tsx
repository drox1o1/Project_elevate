"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export type PennyDropStatus = "idle" | "verifying" | "verified" | "mismatch" | "failed";

export interface PennyDropResult {
  /** Beneficiary name the bank returned for the account. */
  beneficiaryName: string;
  bank: string;
  /** Name-match score 0–1 vs the expected name, if one was supplied. */
  matchScore: number;
  status: Extract<PennyDropStatus, "verified" | "mismatch" | "failed">;
}

export interface PennyDropProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /** Name you expect the account to belong to; drives the match read. */
  expectedName?: string;
  /** Resolve the verification. Defaults to a deterministic demo. */
  onVerify?: (input: { account: string; ifsc: string }) => Promise<PennyDropResult>;
  ref?: React.Ref<HTMLDivElement>;
}

/** IFSC → bank name, first four letters. A tiny demo lookup. */
const IFSC_BANKS: Record<string, string> = {
  HDFC: "HDFC Bank",
  ICIC: "ICICI Bank",
  SBIN: "State Bank of India",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  YESB: "Yes Bank",
  PUNB: "Punjab National Bank",
};

function bankFromIfsc(ifsc: string): string | null {
  return IFSC_BANKS[ifsc.slice(0, 4).toUpperCase()] ?? null;
}

/** Simple token-overlap name similarity, 0–1. */
function nameScore(a: string, b: string): number {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  const x = norm(a);
  const y = new Set(norm(b));
  if (!x.length) return 0;
  const hit = x.filter((t) => y.has(t)).length;
  return hit / x.length;
}

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const DEMO_NAME = "ASHA VERMA";

/* ------------------------------------------------------------------ */
/* Stages                                                               */
/* ------------------------------------------------------------------ */

const STAGES = [
  { key: "init", label: "Initiating a ₹1 deposit", done: "₹1 credited to the account" },
  { key: "fetch", label: "Reading the account holder name", done: "Name returned by the bank" },
  { key: "match", label: "Matching the name", done: "Name match complete" },
] as const;

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

/**
 * Penny-drop bank verification: a ₹1 deposit confirms an account exists and
 * returns the registered holder name. The stages reveal in sequence, the
 * beneficiary name is fetched, and the match against the expected name is
 * scored — verified, or flagged as a mismatch.
 */
export function PennyDrop({
  expectedName,
  onVerify,
  className,
  ref,
  ...rest
}: PennyDropProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const stagesRef = React.useRef<HTMLOListElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [account, setAccount] = React.useState("");
  const [ifsc, setIfsc] = React.useState("");
  const [status, setStatus] = React.useState<PennyDropStatus>("idle");
  const [reached, setReached] = React.useState(-1); // last completed stage index
  const [result, setResult] = React.useState<PennyDropResult | null>(null);

  const bank = bankFromIfsc(ifsc);
  const accountValid = account.length >= 9 && account.length <= 18;
  const ifscValid = IFSC_RE.test(ifsc);
  const canVerify = accountValid && ifscValid && status === "idle";

  const defaultVerify = React.useCallback(
    async (): Promise<PennyDropResult> => {
      const beneficiaryName = DEMO_NAME;
      const score = expectedName ? nameScore(expectedName, beneficiaryName) : 1;
      return {
        beneficiaryName,
        bank: bank ?? "Your bank",
        matchScore: score,
        status: score >= 0.5 ? "verified" : "mismatch",
      };
    },
    [expectedName, bank]
  );

  const verify = async () => {
    if (!canVerify) return;
    setStatus("verifying");
    setReached(-1);
    setResult(null);
    const step = reduced ? 200 : 900;
    for (let i = 0; i < STAGES.length; i++) {
      await new Promise((r) => setTimeout(r, step));
      setReached(i);
    }
    try {
      const res = await (onVerify ?? defaultVerify)({ account, ifsc });
      await new Promise((r) => setTimeout(r, reduced ? 100 : 350));
      setResult(res);
      setStatus(res.status);
    } catch {
      setStatus("failed");
    }
  };

  const reset = () => {
    setStatus("idle");
    setReached(-1);
    setResult(null);
  };

  // Stage rows cascade in when verification starts.
  useGSAP(
    () => {
      if (status !== "verifying" && status !== "verified" && status !== "mismatch") return;
      const rows = gsap.utils.toArray<HTMLElement>(
        stagesRef.current?.querySelectorAll("[data-stage]") ?? []
      );
      if (!rows.length || reduced) return;
      gsap.fromTo(
        rows,
        { x: 8, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: "power3.out", stagger: 0.08, overwrite: true }
      );
    },
    { dependencies: [status], scope: rootRef }
  );

  const field =
    "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/60 hover:border-ring/30 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25";

  return (
    <div
      ref={rootRef}
      data-slot="penny-drop"
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border/60 bg-card p-5 shadow-md",
        className
      )}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="type-title text-foreground">Verify bank account</h3>
        <span className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-0.5 type-caption font-medium text-muted-foreground ring-1 ring-inset ring-border/50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /></svg>
          Penny drop
        </span>
      </div>

      {status === "idle" ? (
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
        >
          <label className="flex flex-col gap-1.5 type-meta font-medium text-muted-foreground">
            Account number
            <input
              inputMode="numeric"
              aria-label="Account number"
              placeholder="0000 0000 0000"
              value={account}
              onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 18))}
              className={cn(field, "font-mono numeric")}
            />
          </label>
          <label className="flex flex-col gap-1.5 type-meta font-medium text-muted-foreground">
            <span className="flex items-center justify-between">
              IFSC
              {bank ? (
                <span className="font-normal text-foreground">{bank}</span>
              ) : ifsc.length >= 4 && !bankFromIfsc(ifsc) ? (
                <span className="font-normal text-muted-foreground/70">Unknown bank</span>
              ) : null}
            </span>
            <input
              autoCapitalize="characters"
              aria-label="IFSC code"
              placeholder="HDFC0001234"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11))}
              className={cn(field, "font-mono uppercase tracking-wide", ifsc.length === 11 && !ifscValid && "border-destructive/60")}
            />
          </label>
          <button
            type="submit"
            disabled={!canVerify}
            className={cn(
              "mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground",
              "shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12),var(--elevation-sm)]",
              "transition-[transform,box-shadow,opacity] duration-200 ease-out-expo hover:-translate-y-px active:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
              "disabled:pointer-events-none disabled:opacity-50 motion-reduce:hover:translate-y-0"
            )}
          >
            Verify account
          </button>
          <p className="type-caption leading-4 text-muted-foreground">
            We deposit ₹1 to confirm the account is real and read back the registered
            name. Demo only.
          </p>
        </form>
      ) : (
        <div className="mt-4">
          {/* Account summary */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs shadow-xs">
            <span className="font-mono numeric text-foreground">
              ••{account.slice(-4)}
            </span>
            <span className="text-muted-foreground">{bank ?? ifsc}</span>
          </div>

          {/* Stages */}
          <ol ref={stagesRef} className="mt-3 flex flex-col">
            {STAGES.map((s, i) => {
              const done = reached >= i;
              const isCurrent = status === "verifying" && i === reached + 1;
              return (
                <li key={s.key} data-stage className="relative flex gap-3 pb-3 last:pb-0">
                  {i < STAGES.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[9px] top-5 h-[calc(100%-1.25rem)] w-0.5 rounded-full transition-colors duration-500"
                      style={{ background: done ? "color-mix(in oklab, var(--success) 45%, transparent)" : "var(--border)" }}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300",
                      done
                        ? "border-success bg-success text-white"
                        : isCurrent
                          ? "border-info bg-background"
                          : "border-border bg-background"
                    )}
                  >
                    {done ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
                    ) : isCurrent ? (
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-info opacity-60" />
                        <span className="relative inline-flex size-2 rounded-full bg-info" />
                      </span>
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className={cn("text-xs font-medium", done || isCurrent ? "text-foreground" : "text-muted-foreground")}>
                      {done ? s.done : s.label}
                      {isCurrent ? "…" : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Result */}
          {result ? (
            <div
              className={cn(
                "mt-2 rounded-2xl border p-3.5 shadow-xs transition-colors duration-300",
                result.status === "verified"
                  ? "border-success/40 bg-success/[0.06]"
                  : "border-warning/40 bg-warning/[0.06]"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="type-overline text-muted-foreground">
                  Account holder
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 type-caption font-semibold ring-1 ring-inset",
                    result.status === "verified"
                      ? "bg-success/12 text-success ring-success/25"
                      : "bg-warning/12 text-warning ring-warning/25"
                  )}
                >
                  {result.status === "verified" ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
                      Verified
                    </>
                  ) : (
                    "Name mismatch"
                  )}
                </span>
              </div>
              <p className="mt-1 text-base font-semibold text-foreground">{result.beneficiaryName}</p>
              <p className="type-meta text-muted-foreground">
                {result.bank} · ••{account.slice(-4)}
                {expectedName ? ` · ${Math.round(result.matchScore * 100)}% match to “${expectedName}”` : ""}
              </p>
              {result.status === "mismatch" ? (
                <p className="mt-1.5 type-meta leading-4 text-warning">
                  The registered name differs from what you entered. Confirm before sending money.
                </p>
              ) : null}
              <button
                type="button"
                onClick={reset}
                className="mt-3 type-meta font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Verify another account
              </button>
            </div>
          ) : status === "failed" ? (
            <div className="mt-2 rounded-2xl border border-destructive/40 bg-destructive/[0.06] p-3.5 text-xs text-destructive shadow-xs">
              <p className="font-medium">Verification failed</p>
              <p className="mt-0.5 type-meta leading-4 text-muted-foreground">
                The ₹1 deposit could not be placed. Check the account and IFSC, then retry.
              </p>
              <button type="button" onClick={reset} className="mt-2 type-meta font-medium text-foreground underline-offset-2 hover:underline">
                Try again
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
