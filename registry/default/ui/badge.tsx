"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const badgeVariants = cva(
  "relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-muted text-foreground",
        outline: "border border-border text-foreground",
        success:
          "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400",
        destructive: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Renders a live-status ping ring behind a leading dot. */
  pulse?: boolean;
  ref?: React.Ref<HTMLSpanElement>;
}

export function Badge({
  className,
  variant,
  pulse = false,
  children,
  ref,
  ...rest
}: BadgeProps) {
  const reduced = useReducedMotion();
  return (
    <span
      ref={ref}
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...rest}
    >
      {pulse ? (
        <span
          data-slot="pulse"
          className="relative flex size-1.5"
          aria-hidden="true"
        >
          {!reduced ? (
            <motion.span
              className="absolute inset-0 rounded-full bg-current"
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ) : null}
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

export { badgeVariants };
