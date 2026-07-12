"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface RevealAccordionProps {
  items: { value: string; question: string; answer: React.ReactNode }[];
  type?: "single" | "multiple";
  className?: string;
}

const spring = { type: "spring", stiffness: 320, damping: 34 } as const;

export function RevealAccordion({
  items,
  type = "single",
  className,
}: RevealAccordionProps) {
  const [open, setOpen] = React.useState<string[]>([]);
  const reduced = useReducedMotion();
  const transition = reduced ? ({ duration: 0 } as const) : spring;

  const rootProps =
    type === "single"
      ? ({
          type: "single" as const,
          collapsible: true,
          value: open[0] ?? "",
          onValueChange: (v: string) => setOpen(v ? [v] : []),
        } as const)
      : ({
          type: "multiple" as const,
          value: open,
          onValueChange: (v: string[]) => setOpen(v),
        } as const);

  return (
    <AccordionPrimitive.Root
      data-slot="reveal-accordion"
      className={cn("w-full", className)}
      {...rootProps}
    >
      {items.map((item) => {
        const isOpen = open.includes(item.value);
        return (
          <AccordionPrimitive.Item
            key={item.value}
            value={item.value}
            data-slot="reveal-accordion-item"
            className="border-b border-border"
          >
            <AccordionPrimitive.Header asChild>
              <h3 className="flex">
                <AccordionPrimitive.Trigger
                  data-slot="reveal-accordion-trigger"
                  className={cn(
                    "flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground",
                    "transition-colors duration-200 hover:text-foreground/80",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                  )}
                >
                  {item.question}
                  {/* plus made of two bars; vertical bar rotates 90° => minus */}
                  <span
                    aria-hidden="true"
                    className="relative flex size-4 shrink-0 items-center justify-center"
                  >
                    <span className="absolute h-[1.5px] w-3 rounded-full bg-foreground" />
                    <motion.span
                      className="absolute h-[1.5px] w-3 rounded-full bg-foreground"
                      initial={false}
                      animate={{ rotate: isOpen ? 0 : 90 }}
                      transition={transition}
                    />
                  </span>
                </AccordionPrimitive.Trigger>
              </h3>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content forceMount asChild>
              <motion.div
                data-slot="reveal-accordion-content"
                className="overflow-hidden"
                initial={false}
                animate={{
                  height: isOpen ? "auto" : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={transition}
                aria-hidden={!isOpen}
              >
                <div className="pb-4 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </div>
              </motion.div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        );
      })}
    </AccordionPrimitive.Root>
  );
}
