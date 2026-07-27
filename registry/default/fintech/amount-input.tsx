"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/registry/default/lib/use-controllable-state";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import {
  countDigitsBefore,
  formatAsYouType,
  parseFormatted,
  restoreCaret,
  type NumberFormatStyle,
} from "@/registry/default/lib/format-number";

export interface AmountInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value" | "defaultValue" | "prefix" | "size"
  > {
  value?: string;
  defaultValue?: string;
  onChange?: (formatted: string, raw: number | null) => void;
  numberFormat?: NumberFormatStyle;
  prefix?: string;
  suffix?: string;
  /** Min font size px. Default 20. */
  minSize?: number;
  /** Max font size px. Default 64. */
  maxSize?: number;
  ref?: React.Ref<HTMLInputElement>;
}

export function AmountInput({
  value: valueProp,
  defaultValue = "",
  onChange,
  numberFormat = "us",
  prefix = "",
  suffix = "",
  minSize = 20,
  maxSize = 64,
  className,
  placeholder = "0",
  disabled,
  ref,
  ...rest
}: AmountInputProps) {
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: (formatted) => {
      const raw = parseFormatted(formatted, numberFormat);
      onChangeRef.current?.(
        formatted,
        raw === "" || raw === "." ? null : parseFloat(raw)
      );
    },
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scalerRef = React.useRef<HTMLDivElement>(null);
  const mirrorRef = React.useRef<HTMLSpanElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pendingCaret = React.useRef<number | null>(null);
  const fontProxy = React.useRef({ size: maxSize });
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Re-group the existing value when the format style switches (e.g. the
  // user toggles US → EU → Indian). Without this the stored string keeps
  // its old grouping until the next keystroke.
  const prevFormat = React.useRef(numberFormat);
  React.useEffect(() => {
    if (prevFormat.current === numberFormat) return;
    const raw = parseFormatted(value, prevFormat.current);
    prevFormat.current = numberFormat;
    if (raw !== "") setValue(formatAsYouType(raw, numberFormat));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberFormat]);

  // Restore the caret after React re-renders the formatted value.
  React.useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && pendingCaret.current != null) {
      if (document.activeElement === input) {
        restoreCaret(input, pendingCaret.current);
      }
      pendingCaret.current = null;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const caret = input.selectionStart ?? input.value.length;
    const digitsBefore = countDigitsBefore(input.value, caret);
    const raw = parseFormatted(input.value, numberFormat);
    const formatted = formatAsYouType(raw, numberFormat);
    pendingCaret.current = digitsBefore;
    setValue(formatted);
  };

  const shake = React.useCallback(() => {
    if (reduced || !containerRef.current) return;
    gsap.fromTo(
      containerRef.current,
      { x: 0 },
      {
        x: 0,
        duration: 0.4,
        ease: "none",
        keyframes: { x: [-6, 6, -4, 4, -2, 0] },
      }
    );
  }, [reduced]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length > 1) return;
    const decimalChars = numberFormat === "eu" ? [",", "."] : ["."];
    const isDigit = e.key >= "0" && e.key <= "9";
    const isDecimal =
      decimalChars.includes(e.key) &&
      !parseFormatted(e.currentTarget.value, numberFormat).includes(".");
    if (!isDigit && !isDecimal) {
      e.preventDefault();
      return;
    }
    if (isDecimal && e.key !== ".") {
      // normalize locale decimal char to "." for internal raw handling
      e.preventDefault();
      const input = e.currentTarget;
      const caret = input.selectionStart ?? input.value.length;
      const digitsBefore = countDigitsBefore(input.value, caret);
      const raw = parseFormatted(input.value, numberFormat) + ".";
      pendingCaret.current = digitsBefore;
      setValue(formatAsYouType(raw, numberFormat));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (/[^\d.,\s]/.test(text)) {
      e.preventDefault();
      shake();
    }
  };

  // Auto-scale: fit the mirror (rendered at maxSize) into the container.
  const fit = React.useCallback(() => {
    const container = containerRef.current;
    const scaler = scalerRef.current;
    const mirror = mirrorRef.current;
    if (!container || !scaler || !mirror) return;
    const available = container.clientWidth;
    const needed = mirror.offsetWidth || 1;
    const target = Math.max(
      minSize,
      Math.min(maxSize, maxSize * (available / needed))
    );
    if (reduced) {
      fontProxy.current.size = target;
      scaler.style.fontSize = `${target}px`;
      return;
    }
    gsap.to(fontProxy.current, {
      size: target,
      duration: 0.15,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        scaler.style.fontSize = `${fontProxy.current.size}px`;
      },
    });
  }, [minSize, maxSize, reduced]);

  useGSAP(
    () => {
      fit();
    },
    { dependencies: [value, fit], scope: containerRef }
  );

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(container);
    return () => ro.disconnect();
  }, [fit]);

  const empty = value === "";
  const mirrorText = `${prefix}${empty ? placeholder : value}${suffix}`;

  return (
    <div
      ref={containerRef}
      data-slot="amount-input"
      className={cn("relative w-full", disabled && "opacity-50", className)}
    >
      {/* hidden mirror rendered at maxSize for fit measurement */}
      <span
        ref={mirrorRef}
        aria-hidden="true"
        className="invisible absolute left-0 top-0 whitespace-pre font-semibold numeric"
        style={{ fontSize: maxSize }}
      >
        {mirrorText}
      </span>
      <div
        ref={scalerRef}
        data-slot="scaler"
        className="flex items-baseline font-semibold numeric"
        style={{ fontSize: maxSize }}
      >
        {prefix ? (
          <span
            data-slot="prefix"
            className={cn(
              "shrink-0 transition-opacity duration-200",
              empty ? "opacity-25" : "opacity-100"
            )}
          >
            {prefix}
          </span>
        ) : null}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-foreground outline-none",
            "[font-size:inherit] placeholder:text-muted-foreground/40",
            "disabled:cursor-not-allowed"
          )}
          {...rest}
        />
        {suffix ? (
          <span
            data-slot="suffix"
            className={cn(
              "shrink-0 transition-opacity duration-200",
              empty ? "opacity-25" : "opacity-100"
            )}
          >
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
