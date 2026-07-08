"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds per loop. Default 30. */
  speed?: number;
  direction?: "left" | "right";
  ref?: React.Ref<HTMLDivElement>;
}

export function Marquee({
  speed = 30,
  direction = "left",
  className,
  children,
  ref,
  ...rest
}: MarqueeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const tweenRef = React.useRef<gsap.core.Tween | null>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || reduced) return;
      tweenRef.current = gsap.to(track, {
        xPercent: direction === "left" ? -50 : 50,
        ease: "none",
        duration: speed,
        repeat: -1,
      });
      return () => {
        tweenRef.current = null;
      };
    },
    { dependencies: [speed, direction, reduced], scope: rootRef }
  );

  // Hover eases the loop to a stop via timeScale (not an abrupt pause).
  const onEnter = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 0, duration: 0.4 });
    }
  };
  const onLeave = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 1, duration: 0.4 });
    }
  };

  return (
    <div
      ref={rootRef}
      data-slot="marquee"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={cn(
        "w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
      {...rest}
    >
      <div
        ref={trackRef}
        data-slot="track"
        className="flex w-max items-center gap-12 pr-12"
      >
        {/* duplicated 2x for a seamless -50% loop */}
        <div aria-hidden={false} className="flex shrink-0 items-center gap-12">
          {children}
        </div>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-12">
          {children}
        </div>
      </div>
    </div>
  );
}
