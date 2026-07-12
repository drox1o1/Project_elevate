"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
}

export function Kbd({ className, ref, ...rest }: KbdProps) {
  return (
    <kbd
      ref={ref}
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5",
        "font-sans text-[11px] font-medium text-muted-foreground",
        className
      )}
      {...rest}
    />
  );
}

export interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** The text written to the clipboard. */
  value: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export function CopyButton({
  value,
  className,
  onClick,
  ref,
  ...rest
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const [drawn, setDrawn] = React.useState(false);

  React.useEffect(() => {
    if (!copied) {
      setDrawn(false);
      return;
    }
    const draw = setTimeout(() => setDrawn(true), 50);
    const revert = setTimeout(() => setCopied(false), 1500);
    return () => {
      clearTimeout(draw);
      clearTimeout(revert);
    };
  }, [copied]);

  return (
    <button
      ref={ref}
      type="button"
      data-slot="copy-button"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      onClick={(e) => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        onClick?.(e);
      }}
      className={cn(
        "relative inline-flex size-8 items-center justify-center rounded-md text-muted-foreground",
        "transition-colors duration-200 hover:bg-muted hover:text-foreground",
        "active:scale-[0.97] active:duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...rest}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          "absolute size-4 transition-[opacity,transform] duration-150",
          copied ? "scale-90 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          "absolute size-4 text-emerald-600 dark:text-emerald-400",
          "transition-opacity duration-150",
          copied ? "opacity-100" : "opacity-0"
        )}
      >
        <path
          d="M5 13l4 4L19 7"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={copied && drawn ? 0 : 1}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
    </button>
  );
}
