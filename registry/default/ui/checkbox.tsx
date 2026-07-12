"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  ref?: React.Ref<HTMLButtonElement>;
}

function IndicatorCheck() {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = React.useState(false);
  React.useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    // check-draw starts 0.05s after the fill begins
    const t = setTimeout(() => setDrawn(true), 50);
    return () => clearTimeout(t);
  }, [reduced]);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3"
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

export function Checkbox({ className, ref, ...rest }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "group relative inline-flex size-[18px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-input bg-background",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        "disabled:opacity-50 disabled:pointer-events-none",
        "data-[state=checked]:border-primary data-[state=indeterminate]:border-primary",
        className
      )}
      {...rest}
    >
      {/* primary fill scales from center on check */}
      <span
        data-slot="fill"
        aria-hidden="true"
        className={cn(
          "absolute inset-0 scale-0 rounded-[4px] bg-primary",
          "transition-transform duration-[180ms] ease-[cubic-bezier(0.33,1,0.68,1)]",
          "group-data-[state=checked]:scale-100 group-data-[state=indeterminate]:scale-100"
        )}
      />
      <CheckboxPrimitive.Indicator
        data-slot="indicator"
        className="relative z-10 flex items-center justify-center text-primary-foreground"
      >
        <CheckboxIndicatorContent />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

function CheckboxIndicatorContent() {
  // Render the bar for indeterminate, the drawn check otherwise; the
  // indeterminate bar pops via a scale transition driven by group state.
  return (
    <>
      <span
        className={cn(
          "hidden group-data-[state=indeterminate]:block",
          "h-[1.5px] w-2 rounded-full bg-primary-foreground",
          "scale-0 transition-transform duration-[180ms] ease-[cubic-bezier(0.33,1,0.68,1)]",
          "group-data-[state=indeterminate]:scale-100"
        )}
      />
      <span className="hidden group-data-[state=checked]:block">
        <IndicatorCheck />
      </span>
    </>
  );
}
