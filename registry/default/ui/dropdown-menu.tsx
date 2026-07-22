"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/* Entrance/exit rides on CSS data-state animations so Radix can hold the
   node through the exit keyframe. The item cascade runs from a callback
   ref: it fires the moment the portal DOM actually attaches, which an
   effect on the (always-mounted) wrapper component never sees. */
function useMenuCascade(
  ref: React.Ref<HTMLDivElement> | undefined,
  selector: string
) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  return React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (!node || reduced) return;
      const items = node.querySelectorAll<HTMLElement>(selector);
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
    [reduced, selector]
  );
}

const menuSurface = [
  "z-50 overflow-hidden rounded-xl border border-border/70 bg-popover/90 p-1.5",
  "shadow-popover backdrop-blur-xl supports-[backdrop-filter]:bg-popover/85",
  "[transform-origin:var(--radix-dropdown-menu-content-transform-origin)]",
  "data-[state=open]:animate-duku-menu-in data-[state=closed]:animate-duku-menu-out",
  "motion-reduce:animate-none",
].join(" ");

export interface DropdownMenuContentProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Content> {
  ref?: React.Ref<HTMLDivElement>;
}

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ref,
  ...rest
}: DropdownMenuContentProps) {
  const attachRef = useMenuCascade(
    ref,
    '[data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-label"], [data-slot="dropdown-menu-separator"]'
  );

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={attachRef}
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(menuSurface, "min-w-[12rem]", className)}
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
  const attachRef = useMenuCascade(ref, '[data-slot="dropdown-menu-item"]');

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        ref={attachRef}
        data-slot="dropdown-menu-sub-content"
        sideOffset={6}
        collisionPadding={8}
        className={cn(menuSurface, "min-w-[10rem]", className)}
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
        "group/item relative flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none",
        "transition-[background-color,color] duration-100",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        "active:scale-[0.98] active:transition-transform active:duration-75 motion-reduce:active:scale-100",
        destructive &&
          "text-destructive [&_svg]:text-destructive/70 data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
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
        "group/sub flex cursor-default select-none items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none",
        "transition-[background-color,color] duration-100",
        "data-[highlighted]:bg-accent data-[state=open]:bg-accent",
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
        className="size-3.5 text-muted-foreground transition-transform duration-200 ease-out-expo group-data-[state=open]/sub:translate-x-0.5"
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
        "px-2.5 pb-1 pt-1.5 text-xs font-medium text-muted-foreground",
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
      className={cn("-mx-1.5 my-1.5 h-px bg-border/70", className)}
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
        "ml-auto rounded border border-border/60 bg-muted/60 px-1.5 py-px font-mono text-[10px] tracking-wide text-muted-foreground",
        "transition-colors duration-100 group-data-[highlighted]/item:border-border",
        className
      )}
      {...rest}
    />
  );
}
