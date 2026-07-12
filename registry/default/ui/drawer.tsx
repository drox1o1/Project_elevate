"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/registry/default/lib/use-controllable-state";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const springStandard = { type: "spring", stiffness: 380, damping: 32 } as const;

const DrawerCtx = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  side: "right" | "bottom";
}>({ open: false, setOpen: () => {}, side: "right" });

export interface DrawerProps
  extends Omit<React.ComponentProps<typeof DialogPrimitive.Root>, "modal"> {
  side?: "right" | "bottom";
  children?: React.ReactNode;
}

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  side = "right",
  children,
  ...rest
}: DrawerProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <DrawerCtx.Provider value={{ open: isOpen, setOpen, side }}>
      <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen} {...rest}>
        {children}
      </DialogPrimitive.Root>
    </DrawerCtx.Provider>
  );
}

export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export const DrawerTitle = DialogPrimitive.Title;
export const DrawerDescription = DialogPrimitive.Description;

export interface DrawerContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  ref?: React.Ref<HTMLDivElement>;
}

export function DrawerContent({
  className,
  children,
  ref,
  ...rest
}: DrawerContentProps) {
  const { open, setOpen, side } = React.useContext(DrawerCtx);
  const reduced = useReducedMotion();

  const hidden =
    side === "right" ? { x: "100%", y: 0 } : { x: 0, y: "100%" };

  return (
    <AnimatePresence>
      {open ? (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay forceMount asChild>
            <motion.div
              data-slot="drawer-overlay"
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content forceMount asChild {...rest}>
            <motion.div
              ref={ref}
              data-slot="drawer-content"
              data-side={side}
              className={cn(
                "fixed z-50 flex flex-col bg-background shadow-lg focus-visible:outline-none",
                side === "right" &&
                  "inset-y-0 right-0 w-full max-w-sm border-l border-border",
                side === "bottom" &&
                  "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t border-border",
                className
              )}
              initial={hidden}
              animate={{ x: 0, y: 0 }}
              exit={hidden}
              transition={reduced ? { duration: 0 } : springStandard}
              drag={side === "bottom" && !reduced ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) {
                  setOpen(false);
                }
              }}
            >
              {side === "bottom" ? (
                <div
                  data-slot="drawer-handle"
                  aria-hidden="true"
                  className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted"
                />
              ) : null}
              <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}
