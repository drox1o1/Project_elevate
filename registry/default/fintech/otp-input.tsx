"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/registry/default/lib/use-controllable-state";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface OTPInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value" | "defaultValue" | "maxLength"
  > {
  /** Number of cells: 4 or 6. Default 6. */
  length?: 4 | 6;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (code: string) => void;
  error?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

export function OTPInput({
  length = 6,
  value: valueProp,
  defaultValue = "",
  onChange,
  onComplete,
  error = false,
  className,
  disabled,
  ref,
  ...rest
}: OTPInputProps) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange,
  });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);
  const [flash, setFlash] = React.useState(false);
  const completedFor = React.useRef<string | null>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const complete = value.length === length;

  React.useEffect(() => {
    if (complete && completedFor.current !== value) {
      completedFor.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      onCompleteRef.current?.(value);
      return () => clearTimeout(t);
    }
    if (!complete) completedFor.current = null;
  }, [complete, value]);

  // Group shake when error turns on.
  const prevError = React.useRef(error);
  useGSAP(
    () => {
      const appeared = error && !prevError.current;
      prevError.current = error;
      if (!appeared || reduced || !rootRef.current) return;
      gsap.fromTo(
        rootRef.current,
        { x: 0 },
        {
          x: 0,
          duration: 0.4,
          ease: "none",
          keyframes: { x: [-6, 6, -4, 4, -2, 0] },
        }
      );
    },
    { dependencies: [error, reduced], scope: rootRef }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.currentTarget.value.replace(/\D/g, "").slice(0, length);
    setValue(digits);
  };

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div
      ref={rootRef}
      data-slot="otp-input"
      className={cn("relative inline-flex gap-2", className)}
    >
      {/* One real input drives everything (SR + autofill friendly). */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d*"
        aria-label={`One-time code, ${length} digits`}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className="absolute inset-0 z-10 cursor-default opacity-0 [caret-color:transparent]"
        {...rest}
      />
      {Array.from({ length }).map((_, i) => {
        const char = value[i] ?? "";
        const isActive = focused && i === activeIndex && !complete;
        return (
          <div
            key={i}
            data-slot="otp-cell"
            aria-hidden="true"
            className={cn(
              "flex h-[52px] w-11 items-center justify-center rounded-lg border border-input bg-background text-lg font-semibold tabular-nums",
              "transition-[color,border-color,box-shadow] duration-200",
              isActive && "border-ring ring-2 ring-ring/25",
              flash && "border-ring ring-2 ring-ring/25",
              error &&
                "border-destructive ring-destructive/25 text-destructive",
              disabled && "opacity-50"
            )}
          >
            {char ? (
              <span
                key={`${i}-${char}`}
                className={
                  reduced
                    ? undefined
                    : "animate-[duku-pop-in_0.25s_cubic-bezier(0.33,1,0.68,1)]"
                }
              >
                {char}
              </span>
            ) : isActive ? (
              <span className="h-6 w-[2px] animate-[duku-caret-blink_1.1s_steps(1)_infinite] bg-foreground" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
