"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  valid?: boolean;
  /** Max rows before scrolling. Default 8. */
  maxRows?: number;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  invalid = false,
  valid = false,
  maxRows = 8,
  rows = 3,
  onInput,
  ref,
  ...rest
}: TextareaProps) {
  const innerRef = React.useRef<HTMLTextAreaElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const resize = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 20;
    const vPad =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const max = lineHeight * maxRows + vPad;
    // Instant per keystroke — no transition on height while typing.
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [maxRows]);

  React.useLayoutEffect(() => {
    resize();
  }, [resize, rest.value, rest.defaultValue]);

  return (
    <textarea
      ref={innerRef}
      data-slot="textarea"
      rows={rows}
      onInput={(e) => {
        resize();
        onInput?.(e);
      }}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground",
        "transition-[color,border-color,box-shadow] duration-200 [transition-property:color,border-color,box-shadow]",
        "placeholder:text-muted-foreground outline-none",
        "focus:border-ring focus:ring-2 focus:ring-ring/25",
        "disabled:opacity-50 disabled:pointer-events-none",
        invalid &&
          "border-destructive focus:border-destructive focus:ring-destructive/25",
        valid && "border-emerald-600 dark:border-emerald-400",
        className
      )}
      {...rest}
    />
  );
}
