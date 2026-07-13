"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { NumberFlow } from "@/registry/default/fintech/number-flow";

/* ------------------------------------------------------------------ */
/* Synthetic ECG                                                        */
/* ------------------------------------------------------------------ */

/** One cardiac cycle sampled at phase 0..1: P wave, QRS complex, T wave. */
function ecgSample(phase: number): number {
  const g = (c: number, w: number, h: number) =>
    h * Math.exp(-((phase - c) ** 2) / (2 * w * w));
  return (
    g(0.18, 0.025, 0.12) + // P
    g(0.395, 0.016, -0.18) + // Q
    g(0.42, 0.014, 1) + // R
    g(0.445, 0.018, -0.28) + // S
    g(0.62, 0.045, 0.28) // T
  );
}

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface VitalsMonitorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  patient?: string;
  /** Baseline heart rate. Default 72. */
  heartRate?: number;
  spo2?: number;
  systolic?: number;
  diastolic?: number;
  temperature?: number;
  /** Simulate a tachycardia alarm: HR climbs and the card enters alarm state. */
  alarm?: boolean;
  /** HR above this triggers the alarm styling. Default 110. */
  hrAlarmAt?: number;
  ref?: React.Ref<HTMLDivElement>;
}

const W = 320;
const H = 72;
const SAMPLES = 240;

/**
 * A live patient vitals card: the ECG trace draws continuously with a
 * fading tail, the rate rolls via NumberFlow, and out-of-range values put
 * the whole card into a pulsing alarm state.
 */
export function VitalsMonitor({
  patient = "Bed 12",
  heartRate = 72,
  spo2 = 98,
  systolic = 122,
  diastolic = 78,
  temperature = 36.8,
  alarm = false,
  hrAlarmAt = 110,
  className,
  ref,
  ...rest
}: VitalsMonitorProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [hr, setHr] = React.useState(heartRate);
  const targetHr = alarm ? Math.max(hrAlarmAt + 18, heartRate + 40) : heartRate;
  const inAlarm = hr >= hrAlarmAt;

  /* HR drifts toward its target with small jitter. */
  React.useEffect(() => {
    if (reduced) {
      setHr(targetHr);
      return;
    }
    const id = setInterval(() => {
      setHr((h) => {
        const drift = (targetHr - h) * 0.25;
        const jitter = (Math.random() - 0.5) * 2;
        return Math.round(h + drift + jitter);
      });
    }, 1200);
    return () => clearInterval(id);
  }, [targetHr, reduced]);

  /* Continuous trace: a ring buffer of samples advanced by rAF, drawn
     straight into the path's `d` — no React re-render per frame. */
  React.useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const buf = new Array(SAMPLES).fill(0);
    let phase = 0;
    let raf = 0;
    let last = performance.now();
    let head = 0;

    const draw = () => {
      let d = "";
      for (let i = 0; i < SAMPLES; i++) {
        const v = buf[(head + i) % SAMPLES];
        const px = (i / (SAMPLES - 1)) * W;
        const py = H * 0.72 - v * H * 0.55;
        d += `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
      }
      path.setAttribute("d", d);
    };

    if (reduced) {
      // Static two-beat strip instead of animation.
      for (let i = 0; i < SAMPLES; i++) buf[i] = ecgSample(((i / SAMPLES) * 2) % 1);
      draw();
      return;
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const beatsPerSec = hr / 60;
      // advance ~90 samples/sec worth of trace
      const advance = Math.max(1, Math.round(dt * 90));
      for (let i = 0; i < advance; i++) {
        phase = (phase + (beatsPerSec / 90) * 1) % 1;
        buf[head] = ecgSample(phase);
        head = (head + 1) % SAMPLES;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hr, reduced]);

  /* Alarm state pulses the card border. */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      gsap.killTweensOf(root);
      if (inAlarm && !reduced) {
        gsap.to(root, {
          boxShadow: "0 0 0 3px var(--risk-high)",
          duration: 0.7,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
        });
      } else {
        gsap.set(root, { boxShadow: "0 0 0 0px transparent" });
      }
    },
    { dependencies: [inAlarm, reduced] }
  );

  const tiles: { label: string; value: React.ReactNode; unit: string; bad?: boolean }[] = [
    {
      label: "HR",
      value: <NumberFlow value={hr} />,
      unit: "bpm",
      bad: inAlarm,
    },
    { label: "SpO₂", value: spo2, unit: "%", bad: spo2 < 94 },
    { label: "BP", value: `${systolic}/${diastolic}`, unit: "mmHg", bad: systolic > 140 },
    { label: "Temp", value: temperature.toFixed(1), unit: "°C", bad: temperature >= 38 },
  ];

  return (
    <div
      ref={rootRef}
      data-slot="vitals-monitor"
      className={cn(
        "w-full max-w-sm rounded-2xl border bg-card p-4 transition-colors duration-300",
        inAlarm ? "border-risk-high" : "border-border",
        className
      )}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{patient}</span>
        {inAlarm ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-risk-high" role="alert">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk-high opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-risk-high" />
            </span>
            Tachycardia
          </span>
        ) : (
          <span className="text-xs text-success">All vitals in range</span>
        )}
      </div>

      {/* ECG strip */}
      <div className="mt-3 overflow-hidden rounded-lg bg-foreground/[0.04] dark:bg-background">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
          {/* grid */}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={(i + 1) * (W / 8)}
              x2={(i + 1) * (W / 8)}
              y1={0}
              y2={H}
              className="stroke-border/60"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <line
              key={`h${i}`}
              y1={(i + 1) * (H / 4)}
              y2={(i + 1) * (H / 4)}
              x1={0}
              x2={W}
              className="stroke-border/60"
              strokeWidth={0.5}
            />
          ))}
          <path
            ref={pathRef}
            fill="none"
            strokeWidth={1.6}
            strokeLinejoin="round"
            className={cn(inAlarm ? "stroke-risk-high" : "stroke-success")}
          />
        </svg>
      </div>
      <p className="sr-only" aria-live="polite">
        Heart rate {hr} beats per minute{inAlarm ? ", tachycardia alarm active" : ""}.
      </p>

      {/* Tiles */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={cn(
              "rounded-lg border px-2 py-1.5 text-center transition-colors duration-300",
              t.bad ? "border-risk-high/50 bg-risk-high/5" : "border-border bg-background"
            )}
          >
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              {t.label}
            </p>
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                t.bad ? "text-risk-high" : "text-foreground"
              )}
            >
              {t.value}
            </p>
            <p className="text-[9px] text-muted-foreground">{t.unit}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Simulated telemetry for demonstration — not a medical device.
      </p>
    </div>
  );
}
