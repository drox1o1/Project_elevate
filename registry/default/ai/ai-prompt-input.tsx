"use client";

import * as React from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/registry/default/lib/use-controllable-state";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface AIPromptInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onSubmit"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit: (value: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  maxRows?: number;
  /** Left slot in the bottom row: attach buttons, model chips. */
  actions?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function AIPromptInput({
  value: valueProp,
  defaultValue = "",
  onChange,
  onSubmit,
  placeholder = "Ask anything…",
  disabled = false,
  maxRows = 7,
  actions,
  className,
  ref,
  ...rest
}: AIPromptInputProps) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange,
  });
  const [pending, setPending] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const canSubmit = value.trim() !== "" && !pending && !disabled;

  // Auto-grow — instant per keystroke, never tweened.
  const resize = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 20;
    const vPad =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const max = lineHeight * maxRows + vPad;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [maxRows]);

  React.useLayoutEffect(() => {
    resize();
  }, [resize, value]);

  const shake = React.useCallback(() => {
    if (reduced || !rootRef.current) return;
    gsap.fromTo(
      rootRef.current,
      { x: 0 },
      {
        x: 0,
        duration: 0.4,
        ease: "none",
        keyframes: { x: [-6, 6, -4, 4, -2, 0] },
      }
    );
  }, [reduced]);

  const submit = async () => {
    if (!canSubmit) return;
    const text = value.trim();
    const result = onSubmit(text);
    if (result instanceof Promise) {
      setPending(true);
      try {
        await result;
        setValue("");
        textareaRef.current?.focus();
      } catch {
        shake();
      } finally {
        setPending(false);
      }
    } else {
      setValue("");
      textareaRef.current?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      data-slot="ai-prompt-input"
      className={cn(
        "w-full rounded-3xl border border-input bg-background shadow-sm",
        "transition-[border-color,box-shadow] duration-300",
        "hover:border-ring/30",
        "focus-within:border-ring focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/20",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...rest}
    >
      <textarea
        ref={textareaRef}
        data-slot="textarea"
        rows={1}
        value={value}
        aria-label="Message"
        placeholder={placeholder}
        disabled={disabled || pending}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
        }}
        className={cn(
          "w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-sm leading-6 text-foreground outline-none",
          "placeholder:text-muted-foreground"
        )}
      />
      <div
        data-slot="bottom-row"
        className="flex items-center justify-between gap-2 px-3 pb-3"
      >
        <div data-slot="actions" className="flex items-center gap-1.5">
          {actions}
        </div>
        <button
          type="button"
          data-slot="submit"
          aria-label="Send message"
          onClick={() => void submit()}
          disabled={!canSubmit}
          className={cn(
            "relative flex size-8 items-center justify-center rounded-full",
            "transition-[color,background-color,box-shadow,transform] duration-200 ease-out-expo",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
            "active:scale-[0.94] active:duration-100",
            canSubmit || pending
              ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12),var(--elevation-sm)] hover:-translate-y-px"
              : "pointer-events-none bg-muted text-muted-foreground"
          )}
        >
          {/* arrow — nudges up as the button enables */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn(
              "absolute size-4 transition-[opacity,transform] duration-200",
              pending
                ? "scale-90 opacity-0"
                : canSubmit
                  ? "translate-y-0 opacity-100"
                  : "translate-y-px opacity-100"
            )}
          >
            <path d="M12 19V5m-6 6 6-6 6 6" />
          </svg>
          {/* spinner while an async submit is pending */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={cn(
              "absolute size-4 animate-spin [animation-duration:0.8s]",
              "transition-opacity duration-200",
              pending ? "opacity-100" : "opacity-0"
            )}
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
        </button>
      </div>
    </div>
  );
}
