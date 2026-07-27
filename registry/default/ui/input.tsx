"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  valid?: boolean;
  prefixEl?: React.ReactNode;
  suffixEl?: React.ReactNode;
  wrapperClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function ValidCheck() {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = React.useState(false);
  React.useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    const t = setTimeout(() => setDrawn(true), 50);
    return () => clearTimeout(t);
  }, [reduced]);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 text-emerald-600 dark:text-emerald-400"
      aria-hidden="true"
    >
      <path
        d="M5 13l4 4L19 7"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={drawn ? 0 : 1}
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
}

export function Input({
  className,
  wrapperClassName,
  invalid = false,
  valid = false,
  prefixEl,
  suffixEl,
  disabled,
  ref,
  ...rest
}: InputProps) {
  return (
    <div
      data-slot="control"
      data-invalid={invalid || undefined}
      data-valid={valid || undefined}
      className={cn(
        "relative flex h-10 items-center rounded-lg border border-input bg-background shadow-xs",
        "transition-[color,border-color,box-shadow] duration-200",
        "hover:border-ring/30",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25 focus-within:shadow-sm",
        "hover:focus-within:border-ring",
        invalid &&
          "border-destructive focus-within:border-destructive focus-within:ring-destructive/25",
        valid && "border-emerald-600 dark:border-emerald-400",
        disabled && "opacity-50 pointer-events-none",
        wrapperClassName
      )}
    >
      {prefixEl ? (
        <span
          data-slot="prefix"
          className="flex items-center pl-3 text-muted-foreground [&>svg]:size-4"
        >
          {prefixEl}
        </span>
      ) : null}
      <input
        ref={ref}
        data-slot="input"
        className={cn(
          "h-full flex-1 bg-transparent px-3 text-sm text-foreground outline-none",
          "placeholder:text-muted-foreground",
          "autofill:shadow-[inset_0_0_0_1000px_var(--background)]",
          "disabled:cursor-not-allowed",
          className
        )}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        {...rest}
      />
      {valid || suffixEl ? (
        <span
          data-slot="suffix"
          className="flex items-center gap-2 pr-3 text-muted-foreground [&>svg]:size-4"
        >
          {suffixEl}
          {valid ? <ValidCheck /> : null}
        </span>
      ) : null}
    </div>
  );
}
