"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface SlideTabsProps {
  items: { value: string; label: string; content: React.ReactNode }[];
  defaultValue?: string;
  className?: string;
}

export function SlideTabs({ items, defaultValue, className }: SlideTabsProps) {
  const [value, setValue] = React.useState(
    defaultValue ?? items[0]?.value ?? ""
  );
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const indicatorRef = React.useRef<HTMLSpanElement>(null);
  const prevIndex = React.useRef(items.findIndex((i) => i.value === value));
  const dirRef = React.useRef(1);
  const reduced = useReducedMotion();

  const moveIndicator = React.useCallback(
    (animate: boolean) => {
      const list = listRef.current;
      const indicator = indicatorRef.current;
      if (!list || !indicator) return;
      const active = list.querySelector<HTMLElement>(
        '[data-state="active"][data-slot="slide-tabs-trigger"]'
      );
      if (!active) return;
      gsap.to(indicator, {
        x: active.offsetLeft,
        width: active.offsetWidth,
        duration: animate && !reduced ? 0.4 : 0,
        ease: "power3.out",
        opacity: 1,
      });
    },
    [reduced]
  );

  // Indicator position: on mount (no animation) + on tab change + on resize.
  useGSAP(
    () => {
      moveIndicator(false);
      const list = listRef.current;
      if (!list) return;
      const ro = new ResizeObserver(() => moveIndicator(false));
      ro.observe(list);
      return () => ro.disconnect();
    },
    { scope: rootRef }
  );

  useGSAP(
    () => {
      moveIndicator(true);
      // Directional content entrance.
      const root = rootRef.current;
      if (!root) return;
      const panel = root.querySelector<HTMLElement>(
        '[data-state="active"][data-slot="slide-tabs-content"]'
      );
      if (!panel) return;
      if (reduced) {
        gsap.set(panel, { opacity: 1, x: 0 });
        return;
      }
      gsap.fromTo(
        panel,
        { opacity: 0, x: dirRef.current * 16 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
      );
    },
    { dependencies: [value], scope: rootRef }
  );

  return (
    <TabsPrimitive.Root
      ref={rootRef}
      data-slot="slide-tabs"
      value={value}
      onValueChange={(next) => {
        const nextIndex = items.findIndex((i) => i.value === next);
        dirRef.current = nextIndex > prevIndex.current ? 1 : -1;
        prevIndex.current = nextIndex;
        setValue(next);
      }}
      className={cn("w-full", className)}
    >
      <TabsPrimitive.List
        ref={listRef}
        data-slot="slide-tabs-list"
        className="relative inline-flex items-center rounded-lg bg-muted p-1"
      >
        <span
          ref={indicatorRef}
          data-slot="slide-tabs-indicator"
          aria-hidden="true"
          className="absolute left-0 top-1 h-8 rounded-md bg-background opacity-0 shadow-sm"
        />
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            data-slot="slide-tabs-trigger"
            className={cn(
              "relative z-10 inline-flex h-8 items-center px-3 text-sm font-medium text-muted-foreground",
              "transition-colors duration-200 data-[state=active]:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            )}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content
          key={item.value}
          value={item.value}
          data-slot="slide-tabs-content"
          className="mt-4 focus-visible:outline-none"
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
