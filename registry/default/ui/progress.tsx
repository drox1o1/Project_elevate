"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. Ignored when indeterminate. */
  value?: number;
  indeterminate?: boolean;
  variant?: "bar" | "circle";
  /** Circle diameter in px. Default 40. */
  circleSize?: number;
  ref?: React.Ref<HTMLDivElement>;
}

export function Progress({
  value = 0,
  indeterminate = false,
  variant = "bar",
  circleSize = 40,
  className,
  ref,
  ...rest
}: ProgressProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);
  const circleRef = React.useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const clamped = Math.min(100, Math.max(0, value));

  useGSAP(
    () => {
      if (indeterminate) {
        if (variant === "bar" && fillRef.current) {
          if (reduced) {
            gsap.set(fillRef.current, { xPercent: 75, scaleX: 1 });
            return;
          }
          gsap.set(fillRef.current, { scaleX: 1, transformOrigin: "left" });
          gsap.fromTo(
            fillRef.current,
            { xPercent: -100 },
            {
              xPercent: 250,
              duration: 1.4,
              ease: "power1.inOut",
              repeat: -1,
            }
          );
        }
        if (variant === "circle" && circleRef.current) {
          gsap.set(circleRef.current, { strokeDashoffset: 0.75 });
          if (!reduced) {
            gsap.to(circleRef.current.ownerSVGElement, {
              rotate: 360,
              duration: 1.4,
              ease: "none",
              repeat: -1,
            });
          }
        }
        return;
      }
      if (variant === "bar" && fillRef.current) {
        gsap.set(fillRef.current, { xPercent: 0, transformOrigin: "left" });
        gsap.to(fillRef.current, {
          scaleX: clamped / 100,
          duration: reduced ? 0 : 0.5,
          ease: "power2.out",
        });
      }
      if (variant === "circle" && circleRef.current) {
        gsap.to(circleRef.current, {
          strokeDashoffset: 1 - clamped / 100,
          duration: reduced ? 0 : 0.5,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [clamped, indeterminate, variant, reduced], scope: rootRef }
  );

  const ariaProps = {
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": indeterminate ? undefined : Math.round(clamped),
  };

  if (variant === "circle") {
    const stroke = 3.5;
    const r = 12 - stroke / 2;
    return (
      <div
        ref={rootRef}
        data-slot="progress"
        className={cn("inline-flex", className)}
        {...ariaProps}
        {...rest}
      >
        <svg
          width={circleSize}
          height={circleSize}
          viewBox="0 0 24 24"
          fill="none"
          className="-rotate-90"
        >
          <circle
            cx="12"
            cy="12"
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          <circle
            ref={circleRef}
            cx="12"
            cy="12"
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
            className="text-primary"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...ariaProps}
      {...rest}
    >
      <div
        ref={fillRef}
        data-slot="fill"
        className={cn(
          "h-full rounded-full bg-primary",
          indeterminate && "w-2/5"
        )}
        style={{ transform: "scaleX(0)", transformOrigin: "left" }}
      />
    </div>
  );
}
