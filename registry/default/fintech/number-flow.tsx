"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface NumberFlowProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "prefix"> {
  value: number;
  decimals?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
  /** Flash emerald/red on change direction. */
  trend?: boolean;
  ref?: React.Ref<HTMLSpanElement>;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface Cell {
  /** Stable key: distance from the right edge of the string. */
  key: number;
  char: string;
  isDigit: boolean;
  /** Index among digit cells, from the left (cascade order). */
  digitIndex: number;
}

function toCells(text: string): Cell[] {
  const cells: Cell[] = [];
  let digitIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isDigit = char >= "0" && char <= "9";
    cells.push({
      key: text.length - i,
      char,
      isDigit,
      digitIndex: isDigit ? digitIndex++ : -1,
    });
  }
  return cells;
}

function DigitColumn({
  digit,
  digitIndex,
  reduced,
}: {
  digit: number;
  digitIndex: number;
  reduced: boolean;
}) {
  const colRef = React.useRef<HTMLSpanElement>(null);
  const first = React.useRef(true);

  useGSAP(
    () => {
      const col = colRef.current;
      if (!col) return;
      const target = -digit * 10; // yPercent of the 10-digit stack
      if (reduced || first.current) {
        gsap.set(col, { yPercent: target });
        first.current = false;
        return;
      }
      gsap.to(col, {
        yPercent: target,
        duration: 0.6,
        ease: "power3.out",
        delay: digitIndex * 0.04,
      });
    },
    { dependencies: [digit, reduced] }
  );

  return (
    <span
      data-slot="digit"
      className="inline-block h-[1em] overflow-hidden align-baseline"
    >
      <span ref={colRef} className="flex flex-col leading-none">
        {DIGITS.map((d) => (
          <span key={d} className="block h-[1em]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export function NumberFlow({
  value,
  decimals = 0,
  locale = "en-US",
  prefix = "",
  suffix = "",
  trend = false,
  className,
  ref,
  ...rest
}: NumberFlowProps) {
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const rowRef = React.useRef<HTMLSpanElement>(null);
  const mirrorRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);
  const prevValue = React.useRef(value);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLSpanElement);

  const formatted = React.useMemo(
    () =>
      `${prefix}${new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)}${suffix}`,
    [value, decimals, locale, prefix, suffix]
  );
  const cells = React.useMemo(() => toCells(formatted), [formatted]);

  // Trend color flash for 0.6s on change.
  React.useEffect(() => {
    if (!trend || value === prevValue.current) {
      prevValue.current = value;
      return;
    }
    setFlash(value > prevValue.current ? "up" : "down");
    prevValue.current = value;
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [value, trend]);

  // Animate width to the measured mirror width.
  useGSAP(
    () => {
      const row = rowRef.current;
      const mirror = mirrorRef.current;
      if (!row || !mirror) return;
      const target = mirror.offsetWidth;
      if (reduced || row.style.width === "") {
        gsap.set(row, { width: target });
        return;
      }
      gsap.to(row, { width: target, duration: 0.3, ease: "power2.out" });
    },
    { dependencies: [formatted, reduced], scope: rootRef }
  );

  return (
    <span
      ref={rootRef}
      data-slot="number-flow"
      className={cn(
        "relative inline-block tabular-nums transition-colors duration-200",
        flash === "up" && "text-emerald-600 dark:text-emerald-400",
        flash === "down" && "text-red-600 dark:text-red-400",
        className
      )}
      {...rest}
    >
      {/* screen-reader value */}
      <span className="sr-only" aria-live="polite">
        {formatted}
      </span>
      {/* hidden mirror for width measurement */}
      <span
        ref={mirrorRef}
        aria-hidden="true"
        className="invisible absolute left-0 top-0 whitespace-pre tabular-nums"
      >
        {formatted}
      </span>
      <span
        ref={rowRef}
        aria-hidden="true"
        className="inline-flex overflow-hidden whitespace-pre align-baseline"
      >
        {cells.map((cell) =>
          cell.isDigit ? (
            <DigitColumn
              key={cell.key}
              digit={Number(cell.char)}
              digitIndex={cell.digitIndex}
              reduced={reduced}
            />
          ) : (
            // non-digit chars crossfade when they change
            <span
              key={`${cell.key}-${cell.char}`}
              className="inline-block h-[1em] animate-[duku-fade-in_0.3s_ease-out] leading-none"
            >
              {cell.char}
            </span>
          )
        )}
      </span>
    </span>
  );
}
