"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const magneticButtonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-full font-medium select-none",
    "transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    "disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-muted",
        ghost: "hover:bg-muted",
      },
      size: {
        default: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof magneticButtonVariants> {
  /** Fraction of cursor offset applied (0–1). Default 0.35. */
  strength?: number;
  /** Activation distance from center in px. Default 120. */
  radius?: number;
  ref?: React.Ref<HTMLButtonElement>;
}

export function MagneticButton({
  strength = 0.35,
  radius = 120,
  variant,
  size,
  className,
  children,
  ref,
  ...rest
}: MagneticButtonProps) {
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  useGSAP(
    () => {
      const button = buttonRef.current;
      const label = labelRef.current;
      const wrapper = wrapperRef.current;
      if (!button || !label || !wrapper) return;
      if (reduced) return;
      // Disabled on touch devices — behaves as a normal button.
      if (window.matchMedia("(pointer: coarse)").matches) return;

      const xTo = gsap.quickTo(button, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(button, "y", { duration: 0.6, ease: "power3" });
      const lxTo = gsap.quickTo(label, "x", { duration: 0.6, ease: "power3" });
      const lyTo = gsap.quickTo(label, "y", { duration: 0.6, ease: "power3" });

      const onMove = (e: PointerEvent) => {
        const rect = button.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        if (Math.hypot(dx, dy) < radius) {
          xTo(dx * strength);
          yTo(dy * strength);
          lxTo(dx * strength * 0.5);
          lyTo(dy * strength * 0.5);
        } else {
          xTo(0);
          yTo(0);
          lxTo(0);
          lyTo(0);
        }
      };

      const onLeave = () => {
        gsap.to([button, label], {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.45)",
        });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      wrapper.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        wrapper.removeEventListener("pointerleave", onLeave);
      };
    },
    { dependencies: [strength, radius, reduced], scope: wrapperRef }
  );

  return (
    <span
      ref={wrapperRef}
      data-slot="magnetic-wrapper"
      className="inline-block p-3"
    >
      <button
        ref={buttonRef}
        data-slot="magnetic-button"
        className={cn(magneticButtonVariants({ variant, size }), className)}
        {...rest}
      >
        <span ref={labelRef} data-slot="label" className="inline-block">
          {children}
        </span>
      </button>
    </span>
  );
}
