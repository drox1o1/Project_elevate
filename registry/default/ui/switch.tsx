"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/registry/default/lib/use-controllable-state";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface SwitchProps
  extends Omit<
    React.ComponentProps<typeof SwitchPrimitive.Root>,
    "checked" | "defaultChecked" | "onCheckedChange"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  ref?: React.Ref<HTMLButtonElement>;
}

const TRACK_W = 40;
const PAD = 2;
const THUMB = 18;
const THUMB_STRETCHED = 22;

export function Switch({
  className,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  ref,
  ...rest
}: SwitchProps) {
  const [checked, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const [pressed, setPressed] = React.useState(false);
  const reduced = useReducedMotion();

  const width = pressed && !disabled ? THUMB_STRETCHED : THUMB;
  const x = checked ? TRACK_W - PAD * 2 - width : 0;

  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      checked={checked}
      onCheckedChange={setChecked}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={cn(
        "relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-full bg-input p-[2px]",
        "transition-colors duration-200 data-[state=checked]:bg-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...rest}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          data-slot="thumb"
          className="block h-[18px] rounded-full bg-background shadow-sm"
          initial={false}
          animate={{ x, width }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  x: { type: "spring", stiffness: 380, damping: 32 },
                  width: { type: "spring", stiffness: 260, damping: 28 },
                }
          }
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
