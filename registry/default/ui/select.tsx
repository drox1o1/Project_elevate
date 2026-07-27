"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  invalid?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export function SelectTrigger({
  className,
  children,
  invalid = false,
  ref,
  ...rest
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      aria-invalid={invalid || undefined}
      className={cn(
        "group flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm shadow-xs",
        "transition-[color,border-color,box-shadow,background-color] duration-200",
        "hover:border-ring/30 hover:bg-muted/40",
        "placeholder:text-muted-foreground data-[placeholder]:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
        "data-[state=open]:border-ring data-[state=open]:ring-2 data-[state=open]:ring-ring/25",
        "disabled:opacity-50 disabled:pointer-events-none",
        invalid &&
          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25",
        className
      )}
      {...rest}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-expo group-data-[state=open]:rotate-180"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export interface SelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ref,
  ...rest
}: SelectContentProps) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  /* The item cascade runs from a callback ref so it fires when the portal
     DOM actually attaches — an effect on this (always-mounted) wrapper
     runs while the menu is still closed and would never see the nodes.
     Entrance/exit rides on CSS data-state animations so Radix holds the
     tree through the exit keyframe. */
  const attachRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (!node || reduced) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>('[data-slot="select-item"]')
      ).slice(0, 12);
      if (!items.length) return;
      gsap.fromTo(
        items,
        { opacity: 0, y: 6, filter: "blur(3px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.35,
          ease: "power3.out",
          stagger: 0.025,
          delay: 0.04,
          clearProps: "opacity,transform,filter",
        }
      );
    },
    [reduced]
  );

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={attachRef}
        data-slot="select-content"
        position={position}
        sideOffset={8}
        className={cn(
          "z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)]",
          "overflow-hidden rounded-xl border border-border/70 bg-popover/90 p-1",
          "shadow-popover backdrop-blur-xl supports-[backdrop-filter]:bg-popover/85",
          "[transform-origin:var(--radix-select-content-transform-origin)]",
          "data-[state=open]:animate-duku-menu-in data-[state=closed]:animate-duku-menu-out",
          "motion-reduce:animate-none",
          className
        )}
        {...rest}
      >
        <SelectPrimitive.Viewport className="p-0.5">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export interface SelectLabelProps
  extends React.ComponentProps<typeof SelectPrimitive.Label> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectLabel({ className, ref, ...rest }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      data-slot="select-label"
      className={cn(
        "px-2.5 pb-1 pt-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...rest}
    />
  );
}

function ItemCheck() {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = React.useState(false);
  React.useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    const t = setTimeout(() => setDrawn(true), 50);
    return () => clearTimeout(t);
  }, [reduced]);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
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
  );
}

export interface SelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectItem({
  className,
  children,
  ref,
  ...rest
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm outline-none",
        "transition-[background-color,color] duration-100",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        className
      )}
      {...rest}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator data-slot="select-item-indicator">
        <ItemCheck />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export interface SelectSeparatorProps
  extends React.ComponentProps<typeof SelectPrimitive.Separator> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectSeparator({
  className,
  ref,
  ...rest
}: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border/70", className)}
      {...rest}
    />
  );
}
