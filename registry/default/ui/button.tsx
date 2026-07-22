"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-medium select-none",
    "transition-[color,background-color,border-color,box-shadow,transform,translate] duration-200 ease-out-expo",
    "active:scale-[0.97] active:duration-75",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    "disabled:opacity-50 disabled:pointer-events-none",
    "motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12),var(--elevation-sm)]",
          "hover:bg-primary/90 hover:-translate-y-px",
          "hover:shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12),var(--elevation-md)]",
          "active:translate-y-0 active:shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.08),var(--elevation-xs)]",
        ].join(" "),
        outline: [
          "border border-input bg-background shadow-xs",
          "hover:bg-muted/60 hover:border-ring/25 hover:-translate-y-px hover:shadow-sm",
          "active:translate-y-0 active:shadow-xs",
        ].join(" "),
        ghost: "hover:bg-muted",
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.15),var(--elevation-sm)]",
          "hover:bg-destructive/90 hover:-translate-y-px",
          "active:translate-y-0",
        ].join(" "),
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  success?: boolean;
  onSuccessEnd?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}

type Phase = "idle" | "loading" | "success" | "reverting";

export function Button({
  className,
  variant,
  size,
  loading = false,
  success = false,
  onSuccessEnd,
  disabled,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const rootRef = React.useRef<HTMLButtonElement>(null);
  const checkPathRef = React.useRef<SVGPathElement>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const reduced = useReducedMotion();

  const onSuccessEndRef = React.useRef(onSuccessEnd);
  React.useEffect(() => {
    onSuccessEndRef.current = onSuccessEnd;
  });

  React.useImperativeHandle(ref, () => rootRef.current as HTMLButtonElement);

  // Width lock: capture current width before content swaps so the button
  // never resizes during loading/success morphs.
  const lockWidth = React.useCallback(() => {
    const el = rootRef.current;
    if (el && !el.style.width) el.style.width = `${el.offsetWidth}px`;
  }, []);
  const releaseWidth = React.useCallback(() => {
    const el = rootRef.current;
    if (el) el.style.width = "";
  }, []);

  React.useEffect(() => {
    if (loading) {
      lockWidth();
      setPhase("loading");
      return;
    }
    if (success) {
      lockWidth();
      setPhase("success");
      // Hold success 1.6s, reverse over 0.3s, then release + notify.
      const t1 = setTimeout(() => setPhase("reverting"), 1600);
      const t2 = setTimeout(() => {
        setPhase("idle");
        releaseWidth();
        onSuccessEndRef.current?.();
      }, 1900);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    setPhase("idle");
    releaseWidth();
  }, [loading, success, lockWidth, releaseWidth]);

  useGSAP(
    () => {
      if (phase !== "success" || !checkPathRef.current) return;
      if (reduced) {
        gsap.set(checkPathRef.current, { strokeDashoffset: 0 });
        return;
      }
      gsap.fromTo(
        checkPathRef.current,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", delay: 0.05 }
      );
    },
    { dependencies: [phase], scope: rootRef }
  );

  const showLabel = phase === "idle" || phase === "reverting";
  const showSpinner = phase === "loading";
  const showCheck = phase === "success";
  const busy = phase === "loading";

  return (
    <button
      ref={rootRef}
      data-slot="button"
      data-phase={phase}
      className={cn(
        buttonVariants({ variant, size }),
        showCheck &&
          "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-600 duration-[250ms]",
        phase === "reverting" && "duration-300",
        className
      )}
      disabled={disabled || phase !== "idle"}
      aria-busy={busy || undefined}
      {...rest}
    >
      <span
        data-slot="label"
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-[opacity,filter] duration-150",
          !showLabel && "opacity-0 blur-[2px]"
        )}
      >
        {children}
      </span>
      <span
        data-slot="spinner"
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center",
          "transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.33,1,0.68,1)]",
          showSpinner ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
        )}
      >
        <svg
          className="size-4 animate-spin [animation-duration:0.8s]"
          viewBox="0 0 24 24"
          fill="none"
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
      </span>
      <span
        data-slot="check"
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center",
          "transition-opacity duration-[250ms]",
          showCheck ? "opacity-100" : "opacity-0"
        )}
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            ref={checkPathRef}
            d="M5 13l4 4L19 7"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
          />
        </svg>
      </span>
    </button>
  );
}

export { buttonVariants };
