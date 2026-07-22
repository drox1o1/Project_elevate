"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Model + brand detection                                              */
/* ------------------------------------------------------------------ */

export type CardBrand = "visa" | "mastercard" | "amex" | "rupay" | "unknown";

export interface CardPaymentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /** Amount to charge, minor-unit agnostic; formatted with the currency. */
  amount: number;
  currency?: string;
  locale?: string;
  /** Called with the (demo) card details on a successful charge. */
  onPaid?: (detail: { brand: CardBrand; last4: string; amount: number }) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const BRAND_META: Record<
  CardBrand,
  { label: string; cvvLen: number; gaps: number[]; max: number; gradient: string }
> = {
  visa: { label: "VISA", cvvLen: 3, gaps: [4, 8, 12], max: 16, gradient: "linear-gradient(135deg, hsl(222 89% 40%), hsl(244 76% 58%))" },
  mastercard: { label: "Mastercard", cvvLen: 3, gaps: [4, 8, 12], max: 16, gradient: "linear-gradient(135deg, hsl(20 90% 45%), hsl(0 72% 45%))" },
  amex: { label: "AMEX", cvvLen: 4, gaps: [4, 10], max: 15, gradient: "linear-gradient(135deg, hsl(190 80% 38%), hsl(172 66% 40%))" },
  rupay: { label: "RuPay", cvvLen: 3, gaps: [4, 8, 12], max: 16, gradient: "linear-gradient(135deg, hsl(158 64% 34%), hsl(200 80% 42%))" },
  unknown: { label: "", cvvLen: 3, gaps: [4, 8, 12], max: 16, gradient: "linear-gradient(135deg, hsl(240 6% 22%), hsl(240 8% 34%))" },
};

function detectBrand(digits: string): CardBrand {
  if (/^3[47]/.test(digits)) return "amex";
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^(60|65|81|82|508)/.test(digits)) return "rupay";
  return "unknown";
}

function luhn(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0 && digits.length >= 15;
}

function group(digits: string, gaps: number[]): string {
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (gaps.includes(i) && i !== 0) out += " ";
    out += digits[i];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Brand marks                                                          */
/* ------------------------------------------------------------------ */

function BrandMark({ brand }: { brand: CardBrand }) {
  if (brand === "visa" || brand === "amex" || brand === "rupay") {
    return (
      <span className="text-sm font-bold italic tracking-tight text-white">
        {BRAND_META[brand].label}
      </span>
    );
  }
  if (brand === "mastercard") {
    return (
      <span className="flex items-center" aria-label="Mastercard">
        <span className="size-6 rounded-full bg-[hsl(0_72%_55%)]" />
        <span className="-ml-2.5 size-6 rounded-full bg-[hsl(38_92%_55%)] mix-blend-hard-light" />
      </span>
    );
  }
  return <span className="text-xs font-medium text-white/50">CARD</span>;
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

type Stage = "idle" | "processing" | "success";

/**
 * Add-card and pay: a live 3D card face detects the brand as you type,
 * flips to reveal the CVV strip when you focus the security field, and the
 * pay button runs a processing → paid morph. Luhn and expiry are validated
 * before the charge is allowed.
 */
export function CardPayment({
  amount,
  currency = "₹",
  locale = "en-IN",
  onPaid,
  className,
  ref,
  ...rest
}: CardPaymentProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [number, setNumber] = React.useState("");
  const [name, setName] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [flipped, setFlipped] = React.useState(false);
  const [stage, setStage] = React.useState<Stage>("idle");

  const brand = detectBrand(number);
  const meta = BRAND_META[brand];

  const setDigits = (raw: string) =>
    setNumber(raw.replace(/\D/g, "").slice(0, meta.max));

  const setExp = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 4);
    setExpiry(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  const [mm, yy] = expiry.split("/");
  const expiryValid =
    mm != null &&
    yy != null &&
    yy.length === 2 &&
    +mm >= 1 &&
    +mm <= 12 &&
    // not in the past (assume 20YY)
    new Date(2000 + +yy, +mm) > new Date();

  const numberValid = luhn(number);
  const cvvValid = cvv.length === meta.cvvLen;
  const canPay =
    numberValid && expiryValid && cvvValid && name.trim().length > 1 && stage === "idle";

  const format = (n: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(n);

  const pay = async () => {
    if (!canPay) return;
    setStage("processing");
    await new Promise((r) => setTimeout(r, reduced ? 400 : 1600));
    setStage("success");
    onPaid?.({ brand, last4: number.slice(-4), amount });
  };

  // Card display strings
  const displayNumber = React.useMemo(() => {
    const filled = number.padEnd(meta.max, "•");
    return group(filled, meta.gaps);
  }, [number, meta.max, meta.gaps]);

  const field =
    "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/60 hover:border-ring/30 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25";

  return (
    <div
      ref={rootRef}
      data-slot="card-payment"
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border/60 bg-card p-5 shadow-md",
        className
      )}
      {...rest}
    >
      {/* Live card face */}
      <div className="[perspective:1200px]">
        <motion.div
          className="relative aspect-[1.586/1] w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-4 text-white shadow-lg [backface-visibility:hidden]"
            style={{ background: meta.gradient }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative flex items-start justify-between">
              {/* chip */}
              <div className="grid h-7 w-9 grid-cols-3 grid-rows-3 gap-px overflow-hidden rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 p-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="rounded-[1px] bg-yellow-500/40" />
                ))}
              </div>
              <BrandMark brand={brand} />
            </div>
            <div className="relative font-mono text-lg tracking-[0.12em] tabular-nums text-white/95 [text-shadow:0_1px_2px_rgb(0_0_0/0.25)]">
              {displayNumber}
            </div>
            <div className="relative flex items-end justify-between text-[11px] uppercase tracking-wide">
              <span className="max-w-[65%] truncate">
                <span className="block text-[8px] text-white/50">Card holder</span>
                {name || "YOUR NAME"}
              </span>
              <span className="text-right">
                <span className="block text-[8px] text-white/50">Expires</span>
                {expiry || "MM/YY"}
              </span>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl text-white shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ background: meta.gradient }}
          >
            <div className="mt-4 h-9 w-full bg-black/70" />
            <div className="mt-4 px-4">
              <div className="flex h-8 items-center justify-end rounded bg-white px-2 font-mono text-sm tabular-nums text-zinc-900">
                {cvv.padEnd(meta.cvvLen, "•")}
              </div>
              <p className="mt-1 text-right text-[9px] text-white/60">CVV</p>
            </div>
            <div className="mt-auto flex items-center justify-between p-4 text-[9px] text-white/50">
              <span>Security code on the back of your card</span>
              <BrandMark brand={brand} />
            </div>
          </div>
        </motion.div>
      </div>

      {stage === "success" ? (
        <PaidState amount={amount} currency={currency} format={format} last4={number.slice(-4)} reduced={reduced} />
      ) : (
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void pay();
          }}
        >
          <label className="flex flex-col gap-1.5 text-[11px] font-medium text-muted-foreground">
            Card number
            <div className="relative">
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                aria-label="Card number"
                placeholder="1234 5678 9012 3456"
                value={group(number, meta.gaps)}
                onChange={(e) => setDigits(e.target.value)}
                className={cn(field, "font-mono tabular-nums", number && !numberValid && "border-destructive/60")}
              />
              {number && numberValid ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
              ) : null}
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-[11px] font-medium text-muted-foreground">
            Cardholder name
            <input
              autoComplete="cc-name"
              aria-label="Cardholder name"
              placeholder="Asha Verma"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s.]/g, "").toUpperCase())}
              className={field}
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1.5 text-[11px] font-medium text-muted-foreground">
              Expiry
              <input
                inputMode="numeric"
                autoComplete="cc-exp"
                aria-label="Expiry date"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExp(e.target.value)}
                className={cn(field, "font-mono tabular-nums", expiry.length === 5 && !expiryValid && "border-destructive/60")}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1.5 text-[11px] font-medium text-muted-foreground">
              CVV
              <input
                inputMode="numeric"
                autoComplete="cc-csc"
                aria-label="Security code"
                placeholder={"•".repeat(meta.cvvLen)}
                value={cvv}
                onFocus={() => setFlipped(true)}
                onBlur={() => setFlipped(false)}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, meta.cvvLen))}
                className={cn(field, "font-mono tabular-nums")}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!canPay && stage === "idle"}
            aria-disabled={!canPay}
            className={cn(
              "mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground",
              "shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12),var(--elevation-sm)]",
              "transition-[transform,box-shadow,opacity] duration-200 ease-out-expo",
              "hover:-translate-y-px active:translate-y-0 active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
              "disabled:pointer-events-none disabled:opacity-50 motion-reduce:hover:translate-y-0"
            )}
          >
            {stage === "processing" ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" className="size-4 animate-spin [animation-duration:0.8s]" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="60 200" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                </svg>
                Pay {currency}{format(amount)}
              </>
            )}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Encrypted. Demo only — do not enter a real card.
          </p>
        </form>
      )}
    </div>
  );
}

function PaidState({
  amount,
  currency,
  format,
  last4,
  reduced,
}: {
  amount: number;
  currency: string;
  format: (n: number) => string;
  last4: string;
  reduced: boolean;
}) {
  return (
    <motion.div
      className="mt-5 flex flex-col items-center gap-2 py-4 text-center"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-success/12 text-success ring-1 ring-inset ring-success/25">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
          <path
            d="M5 13l4 4L19 7"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={reduced ? 0 : 1}
            style={reduced ? undefined : { animation: "duku-draw 0.5s 0.1s ease-out forwards" }}
          />
        </svg>
      </span>
      <p className="text-sm font-semibold text-foreground">
        Paid {currency}
        {format(amount)}
      </p>
      <p className="text-[11px] text-muted-foreground">
        Charged to card ending {last4}. A receipt is on its way.
      </p>
      <style>{`@keyframes duku-draw { to { stroke-dashoffset: 0 } }`}</style>
    </motion.div>
  );
}
