"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export interface SparklineCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number;
  prefix?: string;
  /** Series, min length 2. */
  data: number[];
  delta?: number;
  /** Sparkline area height in px. Default 72. */
  height?: number;
  locale?: string;
  decimals?: number;
  ref?: React.Ref<HTMLDivElement>;
}

const VIEW_W = 200;

/** Catmull-Rom → cubic bezier smoothing. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function SparklineCard({
  title,
  value,
  prefix = "",
  data,
  delta,
  height = 72,
  locale = "en-IN",
  decimals = 0,
  className,
  ref,
  ...rest
}: SparklineCardProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const areaRef = React.useRef<SVGPathElement>(null);
  const dotRef = React.useRef<SVGGElement>(null);
  const numberRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const deltaPositive = (delta ?? 0) >= 0;
  // Trend colour drives the whole chart, so the card reads at a glance.
  const trend = deltaPositive ? "var(--market-up)" : "var(--market-down)";

  const { linePath, areaPath, lastPoint } = React.useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 6;
    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * VIEW_W,
      y: pad + (1 - (v - min) / range) * (height - pad * 2),
    }));
    const line = smoothPath(points);
    const last = points[points.length - 1];
    const area = `${line} L ${VIEW_W} ${height} L 0 ${height} Z`;
    return { linePath: line, areaPath: area, lastPoint: last };
  }, [data, height]);

  const format = React.useCallback(
    (n: number) =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n),
    [locale, decimals]
  );

  useGSAP(
    () => {
      const path = pathRef.current;
      const area = areaRef.current;
      const dot = dotRef.current;
      const node = numberRef.current;
      if (!path || !area || !dot || !node) return;

      const write = (n: number) => {
        node.textContent = `${prefix}${format(n)}`;
      };

      if (reduced) {
        write(value);
        gsap.set(path, { strokeDashoffset: 0 });
        gsap.set(area, { opacity: 1 });
        gsap.set(dot, { scale: 1 });
        return;
      }

      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(area, { opacity: 0 });
      gsap.set(dot, { scale: 0, transformOrigin: "center" });
      write(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 85%",
          once: true,
        },
      });
      tl.to(path, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" });
      tl.to(area, { opacity: 1, duration: 0.6 }, 0.85);
      tl.to(dot, { scale: 1, duration: 0.4, ease: "back.out(2.2)" }, 1.3);
      const proxy = { val: 0 };
      tl.to(
        proxy,
        {
          val: value,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => write(proxy.val),
        },
        0
      );
    },
    { dependencies: [linePath, value, prefix, format, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="sparkline-card"
      style={{ "--trend": trend } as React.CSSProperties}
      className={cn(
        "group relative w-full max-w-xs overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
        "transition-shadow duration-300 hover:shadow-md",
        className
      )}
      {...rest}
    >
      {/* Trend-tinted sheen bleeding from the top-right corner. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full opacity-[0.14] blur-2xl"
        style={{ background: "var(--trend)" }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <p data-slot="title" className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        {delta != null ? (
          <span
            data-slot="delta"
            className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium numeric"
            style={{
              color: "var(--trend)",
              borderColor: "color-mix(in oklab, var(--trend) 30%, transparent)",
              background: "color-mix(in oklab, var(--trend) 10%, transparent)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("size-3", !deltaPositive && "rotate-180")}
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {Math.abs(delta)}%
          </span>
        ) : null}
      </div>
      <div className="relative mt-1.5 flex items-baseline">
        <span
          ref={numberRef}
          data-slot="value"
          className="type-display text-foreground numeric"
        />
      </div>
      <svg
        data-slot="sparkline"
        viewBox={`0 0 ${VIEW_W} ${height}`}
        width="100%"
        height={height}
        fill="none"
        aria-hidden="true"
        className="relative mt-4 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--trend)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--trend)" stopOpacity={0} />
          </linearGradient>
          <filter id={`glow-${uid}`} x="-20%" y="-40%" width="140%" height="180%">
            <feDropShadow
              dx="0"
              dy="1.5"
              stdDeviation="2.5"
              floodColor="var(--trend)"
              floodOpacity="0.35"
            />
          </filter>
        </defs>
        <path ref={areaRef} d={areaPath} fill={`url(#fill-${uid})`} opacity={0} />
        <path
          ref={pathRef}
          d={linePath}
          stroke="var(--trend)"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${uid})`}
          vectorEffect="non-scaling-stroke"
        />
        <g ref={dotRef}>
          <circle cx={lastPoint.x} cy={lastPoint.y} r={5} fill="var(--trend)" opacity={0.25} />
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={2.5}
            fill="var(--card)"
            stroke="var(--trend)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
}
