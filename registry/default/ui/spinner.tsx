import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  /** Diameter in px: sm 16, default 20, lg 24. */
  size?: "sm" | "default" | "lg";
  ref?: React.Ref<SVGSVGElement>;
}

const SIZES = { sm: 16, default: 20, lg: 24 } as const;

export function Spinner({
  size = "default",
  className,
  ref,
  ...rest
}: SpinnerProps) {
  const px = SIZES[size];
  return (
    <span role="status" className="inline-flex">
      <svg
        ref={ref}
        data-slot="spinner"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={cn(
          "animate-spin [animation-duration:0.8s] text-muted-foreground",
          className
        )}
        {...rest}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="60 200"
        />
      </svg>
      <span className="sr-only">Loading</span>
    </span>
  );
}
