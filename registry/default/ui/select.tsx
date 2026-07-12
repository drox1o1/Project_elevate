"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
        "group flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm",
        "transition-[color,border-color,box-shadow] duration-200",
        "placeholder:text-muted-foreground data-[placeholder]:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
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
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
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
  const contentRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  // Entrance runs on every mount (Radix mounts content when opened).
  useGSAP(
    () => {
      const el = contentRef.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: 1, scale: 1 });
        return;
      }
      el.style.transformOrigin =
        "var(--radix-select-content-transform-origin)";
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out" }
      );
      const items = gsap.utils
        .toArray<HTMLElement>(el.querySelectorAll('[data-slot="select-item"]'))
        .slice(0, 10);
      if (items.length) {
        gsap.fromTo(
          items,
          { y: 4, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.25,
            ease: "power2.out",
            stagger: 0.02,
          }
        );
      }
    },
    { scope: contentRef }
  );

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={contentRef}
        data-slot="select-content"
        position={position}
        sideOffset={6}
        className={cn(
          "z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-background p-1 shadow-lg",
          "opacity-0",
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
        "px-2 py-1.5 text-xs font-medium text-muted-foreground",
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
        "relative flex w-full cursor-default select-none items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
        "transition-colors duration-100",
        "data-[highlighted]:bg-muted data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
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
      className={cn("mx-1 my-1 h-px bg-border", className)}
      {...rest}
    />
  );
}
