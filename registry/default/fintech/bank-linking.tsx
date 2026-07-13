"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { Badge } from "@/registry/default/ui/badge";
import { OTPInput } from "@/registry/default/fintech/otp-input";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface LinkableBank {
  id: string;
  name: string;
  /** Tailwind color class for the tile mark. */
  tone: string;
}

export interface LinkableAccount {
  id: string;
  label: string;
  masked: string;
  balance?: string;
}

export interface BankLinkingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onComplete"> {
  banks?: LinkableBank[];
  accounts?: LinkableAccount[];
  /** The demo OTP that succeeds. Any other code shows the error state. */
  validOtp?: string;
  /** Consent validity shown on the review screen, in months. */
  consentMonths?: number;
  onLinked?: (detail: { bank: string; accountIds: string[] }) => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_BANKS: LinkableBank[] = [
  { id: "hdfc", name: "HDFC Bank", tone: "bg-blue-600" },
  { id: "icici", name: "ICICI Bank", tone: "bg-orange-600" },
  { id: "sbi", name: "SBI", tone: "bg-sky-700" },
  { id: "axis", name: "Axis Bank", tone: "bg-rose-700" },
  { id: "kotak", name: "Kotak", tone: "bg-red-600" },
  { id: "yes", name: "Yes Bank", tone: "bg-indigo-600" },
];

export const DEMO_ACCOUNTS: LinkableAccount[] = [
  { id: "sav", label: "Savings", masked: "••6482", balance: "₹1,84,210" },
  { id: "sal", label: "Salary", masked: "••1039", balance: "₹52,904" },
];

const PERMISSIONS = [
  { key: "balance", label: "Account balance", detail: "Refreshed daily" },
  { key: "transactions", label: "Transactions", detail: "Last 12 months, then ongoing" },
  { key: "profile", label: "Account holder name", detail: "For verification only" },
] as const;

type Step = 0 | 1 | 2 | 3 | 4;

/* ------------------------------------------------------------------ */
/* Flow                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Account-aggregator style bank linking: pick a bank, review exactly what
 * is shared and for how long, confirm with OTP, choose accounts, and land
 * on a connection-health card with reauthentication date.
 */
export function BankLinking({
  banks = DEMO_BANKS,
  accounts = DEMO_ACCOUNTS,
  validOtp = "246810",
  consentMonths = 12,
  onLinked,
  className,
  ref,
  ...rest
}: BankLinkingProps) {
  const reduced = useReducedMotion();
  const [step, setStep] = React.useState<Step>(0);
  const [bank, setBank] = React.useState<LinkableBank | null>(null);
  const [otpError, setOtpError] = React.useState(false);
  const [otpAttempt, setOtpAttempt] = React.useState(0);
  const [verifying, setVerifying] = React.useState(false);
  const [picked, setPicked] = React.useState<string[]>(accounts.map((a) => a.id));
  const [linking, setLinking] = React.useState(false);

  const panelRef = React.useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!panelRef.current) return;
      if (reduced) {
        gsap.set(panelRef.current, { x: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        panelRef.current,
        { x: 24, opacity: 0, filter: "blur(6px)" },
        { x: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "power3.out", clearProps: "filter" }
      );
    },
    { dependencies: [step], scope: panelRef }
  );

  const submitOtp = async (code: string) => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    setVerifying(false);
    if (code !== validOtp) {
      setOtpError(true);
      // clear the cells for a fresh attempt once the shake has landed
      setTimeout(() => {
        setOtpError(false);
        setOtpAttempt((a) => a + 1);
      }, 1200);
      return;
    }
    setStep(3);
  };

  const finish = async () => {
    setLinking(true);
    await new Promise((r) => setTimeout(r, 1300));
    setLinking(false);
    setStep(4);
    if (bank) onLinked?.({ bank: bank.id, accountIds: picked });
  };

  const stepTitle = [
    "Choose your bank",
    "Review consent",
    "Verify it's you",
    "Select accounts",
    "Connected",
  ][step];

  return (
    <div
      ref={ref}
      data-slot="bank-linking"
      className={cn(
        "w-full max-w-sm rounded-2xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{stepTitle}</h3>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {Math.min(step + 1, 5)}/5
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / 5) * 100}%` }}
        />
      </div>

      <div ref={panelRef} className="mt-4">
        {step === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {banks.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setBank(b);
                  setStep(1);
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-3 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-[11px] font-bold text-white",
                    b.tone
                  )}
                >
                  {b.name[0]}
                </span>
                <span className="text-[11px] font-medium text-foreground">{b.name}</span>
              </button>
            ))}
          </div>
        ) : null}

        {step === 1 && bank ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{bank.name}</span> will share the
              following, read-only, for {consentMonths} months. You can revoke
              any time.
            </p>
            <ul className="flex flex-col gap-1.5">
              {PERMISSIONS.map((p) => (
                <li
                  key={p.key}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                >
                  <span className="font-medium text-foreground">{p.label}</span>
                  <span className="text-right text-muted-foreground">{p.detail}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] leading-4 text-muted-foreground">
              We never see your bank credentials — the OTP goes to the number
              your bank has on record.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                Agree & continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 && bank ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent by {bank.name}
              <span className="ml-1 rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                demo: {validOtp}
              </span>
            </p>
            <OTPInput key={otpAttempt} length={6} error={otpError} onComplete={submitOtp} />
            <p aria-live="polite" className="min-h-4 text-[11px]">
              {verifying ? (
                <span className="text-muted-foreground">Verifying…</span>
              ) : otpError ? (
                <span className="font-medium text-destructive">
                  That code didn&apos;t match — try again.
                </span>
              ) : null}
            </p>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Back
            </Button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-1.5">
              {accounts.map((a) => {
                const on = picked.includes(a.id);
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() =>
                        setPicked((p) =>
                          on ? p.filter((x) => x !== a.id) : [...p, a.id]
                        )
                      }
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                        on ? "border-primary bg-primary/5" : "border-border bg-background",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <span>
                        <span className="block text-sm font-medium text-foreground">
                          {a.label} {a.masked}
                        </span>
                        {a.balance ? (
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {a.balance}
                          </span>
                        ) : null}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full border-2 transition-colors duration-200",
                          on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        )}
                      >
                        {on ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Button
              className="w-full"
              disabled={picked.length === 0}
              loading={linking}
              onClick={finish}
            >
              Link {picked.length} account{picked.length === 1 ? "" : "s"}
            </Button>
          </div>
        ) : null}

        {step === 4 && bank ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 p-3">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-xs font-bold text-white",
                  bank.tone
                )}
              >
                {bank.name[0]}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{bank.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {picked.length} account{picked.length === 1 ? "" : "s"} · synced just now
                </p>
              </div>
              <Badge variant="success" pulse>
                Healthy
              </Badge>
            </div>
            <dl className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3 text-[11px] tabular-nums text-muted-foreground">
              <div className="flex justify-between">
                <dt>Consent valid until</dt>
                <dd className="text-foreground">
                  {new Date(Date.now() + consentMonths * 30 * 864e5).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Next auto-sync</dt>
                <dd className="text-foreground">Tomorrow, 6:00 AM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Reauthentication</dt>
                <dd className="text-foreground">Not needed for {consentMonths} months</dd>
              </div>
            </dl>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStep(0);
                setBank(null);
                setPicked(accounts.map((a) => a.id));
              }}
            >
              Link another bank
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
