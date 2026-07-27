"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface FieldMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  state: "error" | "success" | "hint" | null;
  children?: React.ReactNode;
}

function AlertCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-px size-3.5 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-px size-3.5 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function FieldMessage({
  state,
  children,
  className,
  ...rest
}: FieldMessageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Keep the last message rendered while collapsing to null.
  const lastContent = React.useRef<React.ReactNode>(null);
  const lastState = React.useRef<"error" | "success" | "hint">("hint");
  if (state != null) {
    lastContent.current = children;
    lastState.current = state;
  }
  const displayState = state ?? lastState.current;
  const open = state != null;

  const prevOpen = React.useRef(open);
  const prevKey = React.useRef<string>("");
  const contentKey = `${displayState}:${typeof children === "string" ? children : ""}`;

  useGSAP(
    () => {
      const el = containerRef.current;
      const inner = innerRef.current;
      if (!el || !inner) return;
      const wasOpen = prevOpen.current;
      const keyChanged = prevKey.current !== contentKey;
      prevOpen.current = open;
      prevKey.current = contentKey;

      gsap.killTweensOf([el, inner]);

      if (reduced) {
        gsap.set(el, { height: open ? "auto" : 0 });
        gsap.set(inner, { opacity: 1 });
        return;
      }

      if (open && !wasOpen) {
        // null -> message: height-auto in
        gsap.fromTo(
          el,
          { height: el.offsetHeight },
          {
            height: el.scrollHeight,
            duration: 0.45,
            ease: "power3.inOut",
            onComplete: () => gsap.set(el, { height: "auto" }),
          }
        );
        gsap.fromTo(
          inner,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, delay: 0.1 }
        );
      } else if (!open && wasOpen) {
        // message -> null: collapse
        gsap.fromTo(
          el,
          { height: el.offsetHeight },
          { height: 0, duration: 0.32, ease: "power3.inOut" }
        );
        gsap.to(inner, { opacity: 0, duration: 0.15 });
      } else if (open && keyChanged) {
        // message -> message: crossfade + height settle
        gsap.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.15 });
        gsap.fromTo(
          el,
          { height: el.offsetHeight },
          {
            height: el.scrollHeight,
            duration: 0.3,
            ease: "power3.inOut",
            onComplete: () => gsap.set(el, { height: "auto" }),
          }
        );
      }
    },
    { dependencies: [open, contentKey, reduced], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      data-slot="field-message"
      data-state={state ?? "closed"}
      className={cn("overflow-hidden", className)}
      style={{ height: 0 }}
      {...rest}
    >
      <div
        ref={innerRef}
        role={displayState === "error" ? "alert" : undefined}
        aria-live={displayState === "success" ? "polite" : undefined}
        className={cn(
          "flex items-start gap-1.5 pt-1.5 type-label leading-snug",
          displayState === "error" && "text-destructive",
          displayState === "success" &&
            "text-emerald-600 dark:text-emerald-400",
          displayState === "hint" && "text-muted-foreground"
        )}
      >
        {displayState === "error" ? <AlertCircleIcon /> : null}
        {displayState === "success" ? <CheckCircleIcon /> : null}
        <span>{open ? children : lastContent.current}</span>
      </div>
    </div>
  );
}
