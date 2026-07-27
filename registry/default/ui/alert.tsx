"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        info: "border-border bg-muted/50 text-foreground",
        success:
          "border-emerald-600/30 bg-emerald-600/5 text-emerald-600 dark:text-emerald-400",
        warning: "border-border bg-muted text-foreground",
        destructive: "border-destructive/40 bg-destructive/5 text-destructive",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const ICONS: Record<string, React.ReactNode> = {
  info: <path d="M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
  success: <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM8.5 12.5l2.5 2.5 4.5-5" />,
  warning: (
    <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  ),
  destructive: (
    <path d="M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
  ),
};

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  /** Renders a dismiss button; called after the collapse animation. */
  onDismiss?: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export function Alert({
  className,
  variant = "info",
  title,
  onDismiss,
  children,
  ref,
  ...rest
}: AlertProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        el,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    },
    { scope: rootRef }
  );

  const dismiss = () => {
    const el = rootRef.current;
    if (!el || reduced) {
      onDismiss?.();
      return;
    }
    gsap.to(el, {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.32,
      ease: "power3.inOut",
      onComplete: () => onDismiss?.(),
    });
  };

  return (
    <div
      ref={rootRef}
      data-slot="alert"
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(
        alertVariants({ variant }),
        "overflow-hidden opacity-0",
        className
      )}
      {...rest}
    >
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        >
          {ICONS[variant ?? "info"]}
        </svg>
        <div className="flex-1">
          {title != null ? (
            <p data-slot="alert-title" className="font-medium">
              {title}
            </p>
          ) : null}
          {children != null ? (
            <div
              data-slot="alert-description"
              className={cn("type-label leading-snug", title != null && "mt-0.5 opacity-80")}
            >
              {children}
            </div>
          ) : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            className="rounded-md p-0.5 opacity-60 transition-opacity duration-200 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
