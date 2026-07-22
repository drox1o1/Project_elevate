"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { Spinner } from "@/registry/default/ui/spinner";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface SwapToken {
  symbol: string;
  name: string;
  /** USD price used for quoting. */
  usd: number;
  balance: number;
  /** Tailwind color class for the coin dot. */
  tone: string;
  /** ERC-20s need an approval transaction before the first swap. */
  needsApproval?: boolean;
}

export const DEFAULT_TOKENS: SwapToken[] = [
  { symbol: "USDT", name: "Tether USD", usd: 1, balance: 2450.75, tone: "bg-emerald-500", needsApproval: true },
  { symbol: "ETH", name: "Ether", usd: 3412.6, balance: 0.42, tone: "bg-indigo-500" },
  { symbol: "USDC", name: "USD Coin", usd: 1, balance: 830.1, tone: "bg-sky-500", needsApproval: true },
  { symbol: "WBTC", name: "Wrapped BTC", usd: 97540, balance: 0.012, tone: "bg-amber-500", needsApproval: true },
];

export interface SwapQuote {
  rate: number;
  priceImpact: number;
  gasUsd: number;
  route: string[];
}

export interface CryptoSwapProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  tokens?: SwapToken[];
  /** Called after the simulated on-chain confirmation. */
  onSwapped?: (detail: {
    from: string;
    to: string;
    amountIn: number;
    amountOut: number;
  }) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const fmt = (n: number, max = 6) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: max }).format(n);

function quote(from: SwapToken, to: SwapToken, amountIn: number): SwapQuote {
  const rate = from.usd / to.usd;
  const notional = amountIn * from.usd;
  const priceImpact = Math.min(9.9, (notional / 2_000_000) * 100);
  const direct =
    (from.symbol === "USDC" && to.symbol === "ETH") ||
    (from.symbol === "ETH" && to.symbol === "USDC");
  const route = direct
    ? [from.symbol, to.symbol]
    : from.symbol === "ETH" || to.symbol === "ETH"
      ? [from.symbol, "USDC", to.symbol === "ETH" ? "WETH" : to.symbol, ...(to.symbol === "ETH" ? ["ETH"] : [])]
      : [from.symbol, "USDC", to.symbol];
  return { rate, priceImpact, gasUsd: 2.6 + priceImpact * 0.4, route: [...new Set(route)] };
}

/* ------------------------------------------------------------------ */
/* Token select                                                         */
/* ------------------------------------------------------------------ */

function TokenSelect({
  tokens,
  value,
  exclude,
  onChange,
  label,
}: {
  tokens: SwapToken[];
  value: SwapToken;
  exclude: string;
  onChange: (t: SwapToken) => void;
  label: string;
}) {
  return (
    <div className="relative inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cn("size-4 rounded-full", value.tone)} />
      <select
        aria-label={label}
        value={value.symbol}
        onChange={(e) => {
          const t = tokens.find((x) => x.symbol === e.target.value);
          if (t) onChange(t);
        }}
        className="appearance-none rounded-md bg-transparent pr-4 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {tokens
          .filter((t) => t.symbol !== exclude)
          .map((t) => (
            <option key={t.symbol} value={t.symbol}>
              {t.symbol}
            </option>
          ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute right-0 size-3 text-muted-foreground"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Swap                                                                 */
/* ------------------------------------------------------------------ */

type Stage = "form" | "approving" | "swapping" | "done";

export function CryptoSwap({
  tokens = DEFAULT_TOKENS,
  onSwapped,
  className,
  ref,
  ...rest
}: CryptoSwapProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [from, setFrom] = React.useState(tokens[0]);
  const [to, setTo] = React.useState(tokens[1]);
  const [amount, setAmount] = React.useState("1000");
  const [slippage, setSlippage] = React.useState(0.5);
  const [feesOpen, setFeesOpen] = React.useState(false);
  const [approved, setApproved] = React.useState<Record<string, boolean>>({});
  const [stage, setStage] = React.useState<Stage>("form");
  const [txStep, setTxStep] = React.useState(0);

  const amountIn = parseFloat(amount) || 0;
  const q = quote(from, to, amountIn);
  const amountOut = amountIn * q.rate * (1 - q.priceImpact / 100);
  const minReceived = amountOut * (1 - slippage / 100);
  const insufficient = amountIn > from.balance;
  const needsApproval = !!from.needsApproval && !approved[from.symbol];

  const feesRef = React.useRef<HTMLDivElement>(null);
  const payRef = React.useRef<HTMLDivElement>(null);
  const recvRef = React.useRef<HTMLDivElement>(null);

  /* Fee breakdown expands fluidly. */
  useGSAP(
    () => {
      if (!feesRef.current) return;
      if (reduced) {
        gsap.set(feesRef.current, { height: feesOpen ? "auto" : 0, opacity: feesOpen ? 1 : 0 });
        return;
      }
      gsap.to(feesRef.current, {
        height: feesOpen ? "auto" : 0,
        opacity: feesOpen ? 1 : 0,
        duration: 0.35,
        ease: "power3.out",
      });
    },
    { dependencies: [feesOpen, reduced] }
  );

  /* Tokens physically exchange position on flip. */
  const flip = () => {
    const doSwap = () => {
      setFrom(to);
      setTo(from);
      setAmount(fmt(amountOut, to.usd > 100 ? 5 : 2).replace(/,/g, ""));
    };
    if (reduced || !payRef.current || !recvRef.current) {
      doSwap();
      return;
    }
    const dy = recvRef.current.offsetTop - payRef.current.offsetTop;
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set([payRef.current, recvRef.current], { y: 0 });
        doSwap();
      },
    });
    tl.to(payRef.current, { y: dy, duration: 0.35, ease: "power3.inOut" }, 0)
      .to(recvRef.current, { y: -dy, duration: 0.35, ease: "power3.inOut" }, 0);
  };

  const approve = async () => {
    setStage("approving");
    await new Promise((r) => setTimeout(r, 1400));
    setApproved((a) => ({ ...a, [from.symbol]: true }));
    setStage("form");
  };

  const swap = async () => {
    setStage("swapping");
    setTxStep(0);
    await new Promise((r) => setTimeout(r, 900));
    setTxStep(1);
    await new Promise((r) => setTimeout(r, 1400));
    setTxStep(2);
    setStage("done");
    onSwapped?.({ from: from.symbol, to: to.symbol, amountIn, amountOut });
  };

  const reset = () => {
    setStage("form");
    setTxStep(0);
    setAmount("");
  };

  const tokenCard = (
    which: "pay" | "receive",
    token: SwapToken,
    onToken: (t: SwapToken) => void
  ) => (
    <div
      ref={which === "pay" ? payRef : recvRef}
      className={cn(
        "rounded-2xl border bg-background/60 p-3.5 shadow-xs transition-colors duration-200",
        which === "pay" && insufficient ? "border-destructive/50" : "border-border/60"
      )}
    >
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{which === "pay" ? "You pay" : "You receive"}</span>
        <button
          type="button"
          onClick={which === "pay" ? () => setAmount(String(token.balance)) : undefined}
          disabled={which !== "pay"}
          className={cn(
            "tabular-nums",
            which === "pay" &&
              "underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          Bal {fmt(token.balance, 4)}
          {which === "pay" ? " · MAX" : ""}
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        {which === "pay" ? (
          <input
            inputMode="decimal"
            aria-label="Amount to pay"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.0"
            className="w-full min-w-0 bg-transparent text-2xl font-semibold tabular-nums text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none"
          />
        ) : (
          <span className="truncate text-2xl font-semibold tabular-nums text-foreground">
            {amountIn > 0 ? fmt(amountOut, token.usd > 100 ? 5 : 2) : "0.0"}
          </span>
        )}
        <TokenSelect
          tokens={tokens}
          value={token}
          exclude={which === "pay" ? to.symbol : from.symbol}
          onChange={onToken}
          label={which === "pay" ? "Pay token" : "Receive token"}
        />
      </div>
      <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
        ≈ ${fmt((which === "pay" ? amountIn : amountOut) * token.usd, 2)}
        {which === "pay" && insufficient ? (
          <span className="ml-2 font-medium text-destructive">
            Insufficient balance
          </span>
        ) : null}
      </p>
    </div>
  );

  return (
    <div
      ref={rootRef}
      data-slot="crypto-swap"
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border/60 bg-card p-5 shadow-md",
        className
      )}
      {...rest}
    >
      {stage !== "done" ? (
        <>
          <div className="relative flex flex-col gap-2">
            {tokenCard("pay", from, setFrom)}
            <button
              type="button"
              aria-label="Flip tokens"
              onClick={flip}
              className="group/flip absolute left-1/2 top-1/2 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-card bg-background text-muted-foreground shadow-md ring-1 ring-border/60 transition-[transform,color,box-shadow] duration-200 ease-out-expo hover:text-foreground hover:shadow-lg active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="size-4 transition-transform duration-300 ease-out-expo group-hover/flip:rotate-180 motion-reduce:group-hover/flip:rotate-0" aria-hidden="true">
                <path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" />
              </svg>
            </button>
            {tokenCard("receive", to, setTo)}
          </div>

          {/* Quote summary */}
          <button
            type="button"
            aria-expanded={feesOpen}
            onClick={() => setFeesOpen((o) => !o)}
            className="mt-3 flex w-full items-center justify-between rounded-lg px-1 py-1 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="tabular-nums">
              1 {from.symbol} = {fmt(q.rate, q.rate < 0.01 ? 6 : 4)} {to.symbol}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              ${q.gasUsd.toFixed(2)} gas
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={cn("size-3 transition-transform duration-300", feesOpen && "rotate-180")}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>
          <div ref={feesRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
            <dl className="flex flex-col gap-1.5 px-1 pb-1 pt-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Price impact</dt>
                <dd className={cn("tabular-nums", q.priceImpact > 2 ? "text-warning" : "text-foreground")}>
                  {q.priceImpact.toFixed(2)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Min received ({slippage}% slippage)</dt>
                <dd className="tabular-nums text-foreground">
                  {fmt(minReceived, 5)} {to.symbol}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Slippage</dt>
                <dd className="flex gap-1">
                  {[0.1, 0.5, 1].map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={slippage === s}
                      onClick={() => setSlippage(s)}
                      className={cn(
                        "rounded px-1.5 py-0.5 tabular-nums transition-colors duration-150",
                        slippage === s
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      {s}%
                    </button>
                  ))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Route</dt>
                <dd className="flex items-center gap-1">
                  {q.route.map((hop, i) => (
                    <React.Fragment key={hop}>
                      {i > 0 ? (
                        <span aria-hidden="true" className="text-muted-foreground">→</span>
                      ) : null}
                      <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-foreground">
                        {hop}
                      </span>
                    </React.Fragment>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-3">
            {needsApproval && amountIn > 0 && !insufficient ? (
              <Button
                className="w-full"
                loading={stage === "approving"}
                onClick={approve}
              >
                Approve {from.symbol}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={amountIn <= 0 || insufficient}
                loading={stage === "swapping"}
                onClick={swap}
              >
                {insufficient ? "Insufficient balance" : "Swap"}
              </Button>
            )}
            {needsApproval && amountIn > 0 && !insufficient ? (
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                One-time token approval, then the swap transaction.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <TxTimeline
          from={from}
          to={to}
          amountIn={amountIn}
          amountOut={amountOut}
          step={txStep}
          onReset={reset}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation timeline                                                */
/* ------------------------------------------------------------------ */

const TX_STEPS = ["Submitted", "Pending on-chain", "Confirmed"] as const;

function TxTimeline({
  from,
  to,
  amountIn,
  amountOut,
  step,
  onReset,
}: {
  from: SwapToken;
  to: SwapToken;
  amountIn: number;
  amountOut: number;
  step: number;
  onReset: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;
      if (reduced) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 14, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power3.out", clearProps: "filter" }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="flex flex-col gap-4 py-2">
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">
          {fmt(amountIn)} {from.symbol} → {fmt(amountOut, 5)} {to.symbol}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Swap complete · tx 0x3f8a…c21d
        </p>
      </div>
      <ol className="flex flex-col gap-0">
        {TX_STEPS.map((label, i) => {
          const done = step > i || (i === TX_STEPS.length - 1 && step >= i);
          const active = step === i && i < TX_STEPS.length - 1;
          return (
            <li key={label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px]",
                    done
                      ? "bg-success text-white"
                      : active
                        ? "bg-primary/15"
                        : "bg-muted"
                  )}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <Spinner size="sm" />
                  ) : null}
                </span>
                {i < TX_STEPS.length - 1 ? (
                  <span className={cn("my-0.5 h-5 w-px", done ? "bg-success" : "bg-border")} />
                ) : null}
              </div>
              <span
                className={cn(
                  "pt-0.5 text-sm",
                  done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <Button variant="outline" onClick={onReset}>
        New swap
      </Button>
    </div>
  );
}
