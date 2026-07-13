"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/registry/default/lib/use-controllable-state";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const DialogCtx = React.createContext<{ open: boolean }>({ open: false });

export interface DialogProps
  extends React.ComponentProps<typeof DialogPrimitive.Root> {
  children?: React.ReactNode;
}

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...rest
}: DialogProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <DialogCtx.Provider value={{ open: isOpen }}>
      <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen} {...rest}>
        {children}
      </DialogPrimitive.Root>
    </DialogCtx.Provider>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  ref?: React.Ref<HTMLDivElement>;
}

export function DialogContent({
  className,
  children,
  ref,
  ...rest
}: DialogContentProps) {
  const { open } = React.useContext(DialogCtx);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const domId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  React.useImperativeHandle(ref, () => panelRef.current as HTMLDivElement);

  // Mount the portal only while open or animating out. Keeping Radix's
  // dismissable layer mounted while closed makes it treat the trigger's
  // own press as an outside-click and cancel the open — so we drive
  // mount/unmount ourselves and use forceMount only to hold the tree
  // through the GSAP exit.
  const [render, setRender] = React.useState(open);
  React.useEffect(() => {
    if (open) setRender(true);
  }, [open]);

  // Drive the entrance/exit via rAF + a document query keyed on a stable
  // per-instance id. The portal's DOM (and therefore its refs) isn't
  // committed yet when this effect first runs on the mounting render, so
  // reading a ref synchronously would miss the nodes — one frame later
  // they exist.
  React.useEffect(() => {
    if (!render) return;
    const raf = requestAnimationFrame(() => {
      const wrap = document.querySelector<HTMLElement>(
        `[data-dialog-id="${domId}"]`
      );
      if (!wrap) return;
      const overlay = wrap.querySelector<HTMLElement>(
        '[data-slot="dialog-overlay"]'
      );
      const panel = wrap.querySelector<HTMLElement>(
        '[data-slot="dialog-content"]'
      );
      if (!overlay || !panel) return;
      gsap.killTweensOf([overlay, panel]);
      if (open) {
        gsap.set(wrap, { visibility: "visible" });
        if (reduced) {
          gsap.set(overlay, { opacity: 1 });
          gsap.set(panel, { opacity: 1, scale: 1, y: 0 });
          return;
        }
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.96, y: 8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power3.out" }
        );
        return;
      }
      if (reduced) {
        setRender(false);
        return;
      }
      gsap.to(overlay, { opacity: 0, duration: 0.15, ease: "power2.in" });
      gsap.to(panel, {
        opacity: 0,
        scale: 0.96,
        y: 8,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => setRender(false),
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, render, reduced, domId]);

  if (!render) return null;

  return (
    <DialogPrimitive.Portal forceMount>
      <div
        data-slot="dialog-wrapper"
        data-dialog-id={domId}
        style={{ visibility: "hidden" }}
        className="fixed inset-0 z-50"
      >
        <DialogPrimitive.Overlay forceMount asChild>
          <div
            data-slot="dialog-overlay"
            className="fixed inset-0 bg-black/50 opacity-0 backdrop-blur-[2px]"
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content forceMount asChild {...rest}>
          <div
            ref={panelRef}
            data-slot="dialog-content"
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 opacity-0",
              "rounded-xl border border-border bg-background p-6 shadow-lg",
              "focus-visible:outline-none",
              className
            )}
          >
            {children}
            <DialogPrimitive.Close
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...rest}
    />
  );
}

export function DialogFooter({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-6 flex justify-end gap-2", className)}
      {...rest}
    />
  );
}

export function DialogTitle({
  className,
  ...rest
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...rest}
    />
  );
}

export function DialogDescription({
  className,
  ...rest
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...rest}
    />
  );
}
