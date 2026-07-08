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
  /** Sparkline area height in px. Default 56. */
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
  height = 56,
  locale = "en-IN",
  decimals = 0,
  className,
  ref,
  ...rest
}: SparklineCardProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const areaRef = React.useRef<SVGPathElement>(null);
  const dotRef = React.useRef<SVGCircleElement>(null);
  const numberRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const { linePath, areaPath, lastPoint } = React.useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 4;
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
        gsap.set(area, { opacity: 0.08 });
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
      tl.to(area, { opacity: 0.08, duration: 0.5 }, 0.9);
      tl.to(dot, { scale: 1, duration: 0.3, ease: "back.out(2)" }, 1.3);
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

  const deltaPositive = (delta ?? 0) >= 0;

  return (
    <div
      ref={rootRef}
      data-slot="sparkline-card"
      className={cn(
        "w-full max-w-xs rounded-xl border border-border bg-card p-5",
        className
      )}
      {...rest}
    >
      <p data-slot="title" className="text-sm text-muted-foreground">
        {title}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          ref={numberRef}
          data-slot="value"
          className="text-2xl font-semibold tracking-tight text-foreground tabular-nums"
        />
        {delta != null ? (
          <span
            data-slot="delta"
            className={cn(
              "text-xs font-medium tabular-nums",
              deltaPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {deltaPositive ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        ) : null}
      </div>
      <svg
        data-slot="sparkline"
        viewBox={`0 0 ${VIEW_W} ${height}`}
        width="100%"
        height={height}
        fill="none"
        aria-hidden="true"
        className="mt-4 overflow-visible"
        preserveAspectRatio="none"
      >
        <path
          ref={areaRef}
          d={areaPath}
          className="fill-primary"
          opacity={0}
        />
        <path
          ref={pathRef}
          d={linePath}
          className="stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          ref={dotRef}
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={3}
          className="fill-primary"
        />
      </svg>
    </div>
  );
}
