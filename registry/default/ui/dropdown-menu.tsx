"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export interface DropdownMenuContentProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Content> {
  ref?: React.Ref<HTMLDivElement>;
}

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ref,
  ...rest
}: DropdownMenuContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const el = contentRef.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: 1, scale: 1 });
        return;
      }
      el.style.transformOrigin =
        "var(--radix-dropdown-menu-content-transform-origin)";
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out" }
      );
      const items = gsap.utils.toArray<HTMLElement>(
        el.querySelectorAll('[data-slot="dropdown-menu-item"]')
      );
      if (items.length) {
        gsap.fromTo(
          items,
          { y: 4, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.25,
            ease: "power2.out",
            stagger: 0.018,
          }
        );
      }
    },
    { scope: contentRef }
  );

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={contentRef}
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-background p-1 opacity-0 shadow-lg",
          className
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export interface DropdownMenuSubContentProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> {
  ref?: React.Ref<HTMLDivElement>;
}

export function DropdownMenuSubContent({
  className,
  ref,
  ...rest
}: DropdownMenuSubContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const el = contentRef.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: 1, x: 0 });
        return;
      }
      // slide 8px from the trigger side
      const side = el.getAttribute("data-side") ?? "right";
      const fromX = side === "left" ? 8 : -8;
      gsap.fromTo(
        el,
        { opacity: 0, x: fromX },
        { opacity: 1, x: 0, duration: 0.2, ease: "power3.out" }
      );
    },
    { scope: contentRef }
  );

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        ref={contentRef}
        data-slot="dropdown-menu-sub-content"
        sideOffset={4}
        className={cn(
          "z-50 min-w-[9rem] overflow-hidden rounded-lg border border-border bg-background p-1 opacity-0 shadow-lg",
          className
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export interface DropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Item> {
  destructive?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

export function DropdownMenuItem({
  className,
  destructive = false,
  ref,
  ...rest
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
        "transition-colors duration-100",
        "data-[highlighted]:bg-muted data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        destructive && "text-destructive data-[highlighted]:bg-destructive/10",
        className
      )}
      {...rest}
    />
  );
}

export interface DropdownMenuSubTriggerProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> {
  ref?: React.Ref<HTMLDivElement>;
}

export function DropdownMenuSubTrigger({
  className,
  children,
  ref,
  ...rest
}: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="dropdown-menu-item"
      className={cn(
        "flex cursor-default select-none items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
        "transition-colors duration-100",
        "data-[highlighted]:bg-muted data-[state=open]:bg-muted",
        className
      )}
      {...rest}
    >
      {children}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5 text-muted-foreground"
        aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuLabel({
  className,
  ...rest
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...rest}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...rest
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("mx-1 my-1 h-px bg-border", className)}
      {...rest}
    />
  );
}

export function DropdownMenuShortcut({
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...rest}
    />
  );
}
