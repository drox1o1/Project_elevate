"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { FieldMessage } from "@/registry/default/ui/field-message";

export interface NewsletterInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  onSubmit: (email: string) => Promise<void> | void;
  placeholder?: string;
  buttonLabel?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "idle" | "loading" | "success";

export function NewsletterInput({
  onSubmit,
  placeholder = "you@example.com",
  buttonLabel = "Subscribe",
  className,
  ref,
  ...rest
}: NewsletterInputProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const controlRef = React.useRef<HTMLDivElement>(null);
  const successRef = React.useRef<HTMLSpanElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const widthBeforeMorph = React.useRef(0);
  const [email, setEmail] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [drawn, setDrawn] = React.useState(false);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const shake = React.useCallback(() => {
    if (reduced || !controlRef.current) return;
    gsap.fromTo(
      controlRef.current,
      { x: 0 },
      {
        x: 0,
        duration: 0.4,
        ease: "none",
        keyframes: { x: [-6, 6, -4, 4, -2, 0] },
      }
    );
  }, [reduced]);

  // Morph the control into the success pill and back.
  useGSAP(
    () => {
      const control = controlRef.current;
      const success = successRef.current;
      if (!control || !success) return;
      if (phase === "success") {
        const target = success.offsetWidth;
        setDrawn(false);
        const t = setTimeout(() => setDrawn(true), 200);
        if (reduced) {
          gsap.set(control, { width: target });
          return () => clearTimeout(t);
        }
        gsap.fromTo(
          control,
          { width: widthBeforeMorph.current },
          { width: target, duration: 0.35, ease: "power3.inOut" }
        );
        return () => clearTimeout(t);
      }
      if (phase === "idle" && widthBeforeMorph.current > 0) {
        if (reduced) {
          gsap.set(control, { width: "auto" });
          return;
        }
        gsap.fromTo(
          control,
          { width: control.offsetWidth },
          {
            width: widthBeforeMorph.current,
            duration: 0.35,
            ease: "power3.inOut",
            onComplete: () => gsap.set(control, { width: "auto" }),
          }
        );
      }
    },
    { dependencies: [phase, reduced], scope: rootRef }
  );

  const submit = async () => {
    if (phase !== "idle") return;
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address");
      shake();
      return;
    }
    setError(null);
    widthBeforeMorph.current = controlRef.current?.offsetWidth ?? 0;
    setPhase("loading");
    try {
      await onSubmit(email);
      setPhase("success");
      setTimeout(() => {
        setEmail("");
        setPhase("idle");
      }, 3000);
    } catch {
      setPhase("idle");
      setError("Something went wrong. Try again.");
      shake();
    }
  };

  return (
    <div
      ref={rootRef}
      data-slot="newsletter-input"
      className={cn("inline-flex flex-col", className)}
      {...rest}
    >
      <div
        ref={controlRef}
        data-slot="control"
        className={cn(
          "relative flex h-12 items-center overflow-hidden rounded-full border border-input bg-background pl-5 pr-1.5 shadow-sm",
          "transition-[border-color,box-shadow] duration-300",
          "hover:border-ring/30",
          "focus-within:border-ring focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/25",
          error != null && "border-destructive focus-within:ring-destructive/25",
          phase === "success" && "justify-center border-emerald-600 px-0"
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-2 transition-opacity duration-200",
            phase === "success" && "pointer-events-none opacity-0"
          )}
        >
          <input
            ref={inputRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-label="Email address"
            aria-invalid={error != null || undefined}
            placeholder={placeholder}
            value={email}
            disabled={phase !== "idle"}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
              if (error != null && EMAIL_RE.test(e.currentTarget.value)) {
                setError(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
            className="w-52 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            loading={phase === "loading"}
            onClick={() => void submit()}
          >
            {buttonLabel}
          </Button>
        </div>
        <span
          ref={successRef}
          data-slot="success-pill"
          aria-live="polite"
          className={cn(
            "absolute inline-flex items-center gap-2 whitespace-nowrap px-5 text-sm font-medium",
            "text-emerald-600 transition-opacity duration-200 dark:text-emerald-400",
            phase === "success" ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
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
          You&apos;re in
        </span>
      </div>
      <FieldMessage state={error != null ? "error" : null}>
        {error}
      </FieldMessage>
    </div>
  );
}
