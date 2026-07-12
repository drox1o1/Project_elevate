"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { StreamText } from "@/registry/default/ai/stream-text";

export interface ChatMessageProps
  extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant";
  /** Assistant only: wraps string children in StreamText. */
  streaming?: boolean;
  avatar?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function ChatMessage({
  role,
  streaming = false,
  avatar,
  className,
  children,
  ref,
  ...rest
}: ChatMessageProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        el,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    },
    { scope: rootRef }
  );

  const body =
    role === "assistant" && streaming && typeof children === "string" ? (
      <StreamText text={children} />
    ) : (
      children
    );

  if (role === "user") {
    return (
      <div
        ref={rootRef}
        data-slot="chat-message"
        data-role="user"
        className={cn("flex justify-end opacity-0", className)}
        {...rest}
      >
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm leading-6 text-foreground">
          {body}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      data-slot="chat-message"
      data-role="assistant"
      className={cn("flex items-start gap-3 opacity-0", className)}
      {...rest}
    >
      <span
        data-slot="avatar"
        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold uppercase text-muted-foreground"
      >
        {avatar ?? "AI"}
      </span>
      <div className="min-w-0 flex-1 text-sm leading-6 text-foreground">
        {body}
      </div>
    </div>
  );
}

export interface ChatListProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

/** Staggers the initial mount of its ChatMessage children. */
export function ChatList({ className, ref, ...rest }: ChatListProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const messages = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll('[data-slot="chat-message"]')
      );
      if (reduced) {
        gsap.set(messages, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        messages,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.05,
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="chat-list"
      className={cn("flex flex-col gap-4", className)}
      {...rest}
    />
  );
}
