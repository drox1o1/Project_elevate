import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Loading placeholder with the house shimmer. Widths must be deterministic
 * (className / style) — never Math.random in render (SSR hydration safety).
 */
export function Skeleton({ className, ref, ...rest }: SkeletonProps) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        className
      )}
      {...rest}
    >
      <span className="absolute inset-0 animate-[duku-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
    </div>
  );
}
