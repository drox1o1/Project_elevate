"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/registry/default/lib/use-controllable-state";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface Skill {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SkillsCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  skills: Skill[];
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  ref?: React.Ref<HTMLDivElement>;
}

export function SkillsCard({
  title,
  skills,
  defaultOpen = false,
  onOpenChange,
  className,
  ref,
  ...rest
}: SkillsCardProps) {
  const [open, setOpen] = useControllableState<boolean>({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const chevronRef = React.useRef<SVGSVGElement>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const mounted = React.useRef(false);
  const reduced = useReducedMotion();
  const contentId = React.useId();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  useGSAP(
    () => {
      const content = contentRef.current;
      const chevron = chevronRef.current;
      if (!content || !chevron) return;
      const rows = gsap.utils.toArray<HTMLElement>(
        content.querySelectorAll('[data-slot="skill-row"]')
      );

      // Initial state without animation.
      if (!mounted.current) {
        mounted.current = true;
        gsap.set(content, { height: open ? "auto" : 0 });
        gsap.set(rows, { opacity: open ? 1 : 0, y: open ? 0 : 12 });
        gsap.set(chevron, { rotate: open ? 180 : 0 });
        return;
      }

      // Kill any in-flight timeline and start from current values.
      tlRef.current?.kill();

      if (reduced) {
        gsap.set(content, { height: open ? "auto" : 0 });
        gsap.set(rows, { opacity: open ? 1 : 0, y: 0 });
        gsap.set(chevron, { rotate: open ? 180 : 0 });
        return;
      }

      const tl = gsap.timeline();
      tlRef.current = tl;

      if (open) {
        const h = content.scrollHeight;
        tl.fromTo(
          content,
          { height: content.offsetHeight },
          {
            height: h,
            duration: 0.45,
            ease: "power3.inOut",
            onComplete: () => gsap.set(content, { height: "auto" }),
          }
        );
        tl.fromTo(
          rows,
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.05,
          },
          0.12
        );
        tl.to(chevron, { rotate: 180, duration: 0.3, ease: "power2.inOut" }, 0);
      } else {
        tl.to(rows, {
          y: 8,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          stagger: { each: 0.03, from: "end" },
        });
        tl.fromTo(
          content,
          { height: content.offsetHeight },
          { height: 0, duration: 0.32, ease: "power3.inOut" },
          0
        );
        tl.to(chevron, { rotate: 0, duration: 0.3, ease: "power2.inOut" }, 0);
      }
    },
    { dependencies: [open, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="skills-card"
      className={cn(
        "w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-md",
        className
      )}
      {...rest}
    >
      <button
        type="button"
        data-slot="header"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left",
          "transition-colors duration-200 hover:bg-muted/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        )}
      >
        <span className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {skills.length}
          </span>
        </span>
        <svg
          ref={chevronRef}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        ref={contentRef}
        id={contentId}
        role="region"
        data-slot="content"
        className="overflow-hidden"
        style={{ height: defaultOpen ? "auto" : 0 }}
      >
        <div className="px-5 pb-4">
          {skills.map((skill, i) => (
            <div
              key={skill.id}
              data-slot="skill-row"
              className={cn(
                "flex items-start gap-3 py-2.5",
                i > 0 && "border-t border-border"
              )}
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
                {skill.icon ?? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2-6.4-4.8L5.6 21.2 8 14 2 9.2h7.6L12 2z" />
                  </svg>
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {skill.name}
                </span>
                {skill.description ? (
                  <span className="block text-xs text-muted-foreground">
                    {skill.description}
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
