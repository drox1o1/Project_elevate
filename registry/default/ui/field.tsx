"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { FieldMessage } from "@/registry/default/ui/field-message";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  ref?: React.Ref<HTMLLabelElement>;
}

export function Label({ className, ref, ...rest }: LabelProps) {
  return (
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "text-sm font-medium text-foreground select-none",
        "peer-disabled:opacity-50",
        className
      )}
      {...rest}
    />
  );
}

export interface FieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label?: React.ReactNode;
  /** Feedback state rendered in the FieldMessage below the control. */
  state?: "error" | "success" | "hint" | null;
  message?: React.ReactNode;
  /** The control element. Receives id / aria-describedby / aria-invalid. */
  children: React.ReactElement<Record<string, unknown>>;
}

export function Field({
  label,
  state = null,
  message,
  children,
  className,
  ...rest
}: FieldProps) {
  const autoId = React.useId();
  const controlId = `duku-field-${autoId}`;
  const messageId = `duku-field-msg-${autoId}`;
  const controlWrapRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const prevState = React.useRef(state);

  // Shake the control when an error appears.
  useGSAP(
    () => {
      const appeared = state === "error" && prevState.current !== "error";
      prevState.current = state;
      if (!appeared || reduced || !controlWrapRef.current) return;
      gsap.fromTo(
        controlWrapRef.current,
        { x: 0 },
        {
          x: 0,
          duration: 0.4,
          ease: "none",
          keyframes: { x: [-6, 6, -4, 4, -2, 0] },
        }
      );
    },
    { dependencies: [state, reduced], scope: controlWrapRef }
  );

  const control = React.cloneElement(children, {
    id: (children.props.id as string | undefined) ?? controlId,
    "aria-describedby": message != null ? messageId : undefined,
    "aria-invalid": state === "error" ? true : undefined,
  });

  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...rest}
    >
      {label != null ? (
        <Label htmlFor={(children.props.id as string | undefined) ?? controlId}>
          {label}
        </Label>
      ) : null}
      <div data-slot="field-control" ref={controlWrapRef}>
        {control}
      </div>
      <FieldMessage id={messageId} state={state}>
        {message}
      </FieldMessage>
    </div>
  );
}
