"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

// ---------------------------------------------------------------- store

export type ToastVariant = "default" | "success" | "destructive";

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** ms before auto-dismiss. Default 4000. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastData {
  id: number;
  title: React.ReactNode;
  description?: React.ReactNode;
  variant: ToastVariant;
  duration: number;
  action?: { label: string; onClick: () => void };
  promiseState?: "loading" | "success" | "error";
}

let nextId = 1;
let toastList: ToastData[] = [];
const emptyList: ToastData[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribeStore(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function add(
  opts: ToastOptions & { promiseState?: ToastData["promiseState"] }
): number {
  const id = nextId++;
  toastList = [
    {
      id,
      title: opts.title,
      description: opts.description,
      variant: opts.variant ?? "default",
      duration: opts.duration ?? 4000,
      action: opts.action,
      promiseState: opts.promiseState,
    },
    ...toastList,
  ];
  emit();
  return id;
}

function update(id: number, patch: Partial<ToastData>) {
  toastList = toastList.map((t) => (t.id === id ? { ...t, ...patch } : t));
  emit();
}

function dismiss(id: number) {
  toastList = toastList.filter((t) => t.id !== id);
  emit();
}

function toastFn(opts: ToastOptions): number {
  return add(opts);
}

toastFn.promise = function toastPromise<T>(
  p: Promise<T>,
  msgs: {
    loading: React.ReactNode;
    success: React.ReactNode | ((value: T) => React.ReactNode);
    error: React.ReactNode | ((error: unknown) => React.ReactNode);
  }
): Promise<T> {
  const id = add({
    title: msgs.loading,
    duration: Infinity,
    promiseState: "loading",
  });
  p.then(
    (value) =>
      update(id, {
        title:
          typeof msgs.success === "function" ? msgs.success(value) : msgs.success,
        variant: "success",
        promiseState: "success",
        duration: 4000,
      }),
    (error) =>
      update(id, {
        title:
          typeof msgs.error === "function" ? msgs.error(error) : msgs.error,
        variant: "destructive",
        promiseState: "error",
        duration: 4000,
      })
  );
  return p;
};

toastFn.dismiss = dismiss;

export const toast = toastFn;

export function useToast() {
  return { toast: toastFn, dismiss };
}

// ---------------------------------------------------------------- view

const springStandard = { type: "spring", stiffness: 380, damping: 32 } as const;

function CheckDrawIcon() {
  const [drawn, setDrawn] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 text-emerald-600 dark:text-emerald-400"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path
        d="M8.5 12.5l2.5 2.5 4.5-5"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={drawn ? 0 : 1}
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
}

function ToastIcon({ data }: { data: ToastData }) {
  if (data.promiseState === "loading") {
    return (
      <svg
        className="size-4 animate-spin [animation-duration:0.8s] text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="60 200"
        />
      </svg>
    );
  }
  if (data.variant === "success") return <CheckDrawIcon />;
  if (data.variant === "destructive") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 text-destructive"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4m0 4h.01" />
      </svg>
    );
  }
  return null;
}

interface ToastViewProps {
  data: ToastData;
  index: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
  dirX: number;
  anchor: "top" | "bottom";
  paused: boolean;
  reduced: boolean;
  onHeight: (id: number, h: number) => void;
  onDismiss: (id: number) => void;
}

function ToastView({
  data,
  y,
  scale,
  opacity,
  zIndex,
  dirX,
  anchor,
  paused,
  reduced,
  onHeight,
  onDismiss,
}: ToastViewProps) {
  const ref = React.useRef<HTMLLIElement>(null);
  const remaining = React.useRef(data.duration);
  const startedAt = React.useRef(0);

  // Reset the clock when the toast's phase changes (promise morph).
  React.useEffect(() => {
    remaining.current = data.duration;
  }, [data.duration, data.promiseState]);

  React.useEffect(() => {
    if (
      paused ||
      !Number.isFinite(data.duration) ||
      data.promiseState === "loading"
    )
      return;
    startedAt.current = Date.now();
    const t = setTimeout(() => onDismiss(data.id), remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, data.duration, data.promiseState, data.id, onDismiss]);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => onHeight(data.id, el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data.id, onHeight]);

  const hasTimer =
    Number.isFinite(data.duration) && data.promiseState !== "loading";
  const iconKey = data.promiseState ?? data.variant;

  return (
    <motion.li
      ref={ref}
      data-slot="toast"
      role={data.variant === "destructive" ? "alert" : "status"}
      aria-live={data.variant === "destructive" ? "assertive" : "polite"}
      initial={reduced ? { opacity: 0 } : { x: dirX * 24, opacity: 0, y, scale }}
      animate={{ x: 0, opacity, y, scale }}
      exit={
        reduced
          ? { opacity: 0, transition: { duration: 0 } }
          : { x: dirX * 24, opacity: 0, transition: { duration: 0.2 } }
      }
      transition={reduced ? { duration: 0 } : springStandard}
      drag={reduced ? false : "x"}
      dragSnapToOrigin
      dragElastic={0.4}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
          onDismiss(data.id);
        }
      }}
      style={{
        zIndex,
        [anchor]: 0,
        transformOrigin: anchor === "bottom" ? "bottom center" : "top center",
      }}
      className={cn(
        "absolute left-0 right-0 overflow-hidden rounded-xl border border-border bg-background shadow-lg",
        "transition-colors duration-[250ms]",
        data.variant === "destructive" && "border-destructive/40"
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={iconKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="mt-0.5 empty:hidden"
          >
            <ToastIcon data={data} />
          </motion.span>
        </AnimatePresence>
        <div className="flex-1 text-sm">
          <p data-slot="toast-title" className="font-medium text-foreground">
            {data.title}
          </p>
          {data.description != null ? (
            <p
              data-slot="toast-description"
              className="mt-0.5 type-label leading-snug text-muted-foreground"
            >
              {data.description}
            </p>
          ) : null}
        </div>
        {data.action ? (
          <button
            type="button"
            onClick={() => {
              data.action?.onClick();
              onDismiss(data.id);
            }}
            className="shrink-0 rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {data.action.label}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(data.id)}
          className="shrink-0 rounded-md p-0.5 text-muted-foreground opacity-60 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="size-3.5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      {hasTimer ? (
        <span
          key={iconKey}
          data-slot="toast-timer"
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-foreground/15"
          style={{
            animation: `duku-timer ${data.duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      ) : null}
    </motion.li>
  );
}

// ---------------------------------------------------------------- toaster

export interface ToasterProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

const GAP = 8;

export function Toaster({
  position = "bottom-right",
  className,
}: ToasterProps) {
  const items = React.useSyncExternalStore(
    subscribeStore,
    () => toastList,
    () => emptyList
  );
  const [hovered, setHovered] = React.useState(false);
  const reduced = useReducedMotion();
  const heightsRef = React.useRef(new Map<number, number>());
  const [, force] = React.useReducer((x: number) => x + 1, 0);

  const onHeight = React.useCallback((id: number, h: number) => {
    if (heightsRef.current.get(id) !== h) {
      heightsRef.current.set(id, h);
      force();
    }
  }, []);
  const onDismiss = React.useCallback((id: number) => dismiss(id), []);

  const anchor = position.startsWith("top") ? ("top" as const) : ("bottom" as const);
  const sign = anchor === "bottom" ? -1 : 1;
  const dirX = position.endsWith("right") ? 1 : -1;
  const expanded = hovered;

  // Cumulative offsets for the expanded list layout.
  let acc = 0;
  const layout = items.map((t, i) => {
    const h = heightsRef.current.get(t.id) ?? 0;
    const expandedY = sign * acc;
    acc += h + GAP;
    const collapsedY = sign * i * 10;
    return {
      y: expanded ? expandedY : collapsedY,
      scale: expanded ? 1 : Math.max(1 - i * 0.05, 0.8),
      opacity: expanded ? 1 : i < 3 ? 1 - i * 0.25 : 0,
    };
  });

  const firstHeight = items.length
    ? (heightsRef.current.get(items[0].id) ?? 0)
    : 0;
  const containerHeight = expanded
    ? Math.max(acc - GAP, 0)
    : firstHeight + Math.min(Math.max(items.length - 1, 0), 2) * 10;

  return (
    <ol
      data-slot="toaster"
      aria-label="Notifications"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "fixed z-[100] w-[356px] max-w-[calc(100vw-2rem)] list-none",
        position === "bottom-right" && "bottom-4 right-4",
        position === "bottom-left" && "bottom-4 left-4",
        position === "top-right" && "top-4 right-4",
        position === "top-left" && "top-4 left-4",
        className
      )}
      style={{ height: containerHeight }}
    >
      <AnimatePresence mode="popLayout">
        {items.map((t, i) => (
          <ToastView
            key={t.id}
            data={t}
            index={i}
            y={layout[i].y}
            scale={layout[i].scale}
            opacity={layout[i].opacity}
            zIndex={items.length - i}
            dirX={dirX}
            anchor={anchor}
            paused={hovered}
            reduced={reduced}
            onHeight={onHeight}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </ol>
  );
}
