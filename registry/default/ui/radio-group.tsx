"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export interface RadioGroupProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {
  ref?: React.Ref<HTMLDivElement>;
}

export function RadioGroup({ className, ref, ...rest }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-slot="radio-group"
      className={cn("grid gap-2.5", className)}
      {...rest}
    />
  );
}

export interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function RadioGroupItem({
  className,
  ref,
  ...rest
}: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      data-slot="radio-group-item"
      className={cn(
        "group inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-input bg-background",
        "transition-colors duration-200 data-[state=checked]:border-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...rest}
    >
      {/* dot pops with a back.out(1.7) overshoot */}
      <span
        data-slot="dot"
        aria-hidden="true"
        className={cn(
          "size-2 scale-0 rounded-full bg-primary",
          "transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "group-data-[state=checked]:scale-100"
        )}
      />
    </RadioGroupPrimitive.Item>
  );
}
