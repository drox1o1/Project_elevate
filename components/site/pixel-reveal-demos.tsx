"use client";

import * as React from "react";
import { PixelRevealText } from "@/registry/default/motion/pixel-reveal-text";
import type {
  PixelVariant,
  RevealDirection,
} from "@/registry/default/motion/pixel-reveal-text";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/registry/default/ui/select";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * 1 · Default Resolve
 * ---------------------------------------------------------------------- */

export function DefaultResolveDemo() {
  const [key, setKey] = React.useState(0);
  return (
    <Stage onReplay={() => setKey((k) => k + 1)} label="1100ms · left · 3px">
      <PixelRevealText
        as="h2"
        variant="square"
        trigger="in-view"
        direction="left"
        duration={1100}
        pixelSize={3}
        flicker={0.32}
        replayKey={key}
        className="max-w-[22ch] text-center text-2xl leading-[1.25] tracking-[-0.02em] sm:text-4xl"
      >
        DESIGN ENGINEERING WITH AI
      </PixelRevealText>
    </Stage>
  );
}

/* -------------------------------------------------------------------------
 * 2 · Quiet Resolve
 * ---------------------------------------------------------------------- */

export function QuietResolveDemo() {
  const [key, setKey] = React.useState(0);
  return (
    <Stage onReplay={() => setKey((k) => k + 1)} label="850ms · low flicker · 2px">
      <PixelRevealText
        as="span"
        variant="square"
        trigger="in-view"
        direction="left"
        duration={850}
        pixelSize={2}
        flicker={0.14}
        intensity={0.55}
        replayKey={key}
        className="text-base tracking-[0.12em] text-muted-foreground sm:text-lg"
      >
        SYSTEM READY
      </PixelRevealText>
    </Stage>
  );
}

/* -------------------------------------------------------------------------
 * 3 · Dense Dither
 * ---------------------------------------------------------------------- */

export function DenseDitherDemo() {
  const [key, setKey] = React.useState(0);
  return (
    <Stage onReplay={() => setKey((k) => k + 1)} label="1400ms · intensity 0.95">
      <PixelRevealText
        as="h2"
        variant="grid"
        trigger="in-view"
        direction="left"
        duration={1400}
        pixelSize={4}
        flicker={0.42}
        intensity={0.95}
        seed={91}
        replayKey={key}
        className="max-w-[16ch] text-center text-2xl leading-[1.3] tracking-[-0.02em] sm:text-5xl"
      >
        BUILT PIXEL BY PIXEL
      </PixelRevealText>
    </Stage>
  );
}

/* -------------------------------------------------------------------------
 * 4 · Centre Signal
 * ---------------------------------------------------------------------- */

export function CentreSignalDemo() {
  const [key, setKey] = React.useState(0);
  return (
    <Stage onReplay={() => setKey((k) => k + 1)} label="center · signal lock">
      <PixelRevealText
        as="h2"
        variant="square"
        trigger="in-view"
        direction="center"
        duration={1100}
        pixelSize={3}
        flicker={0.28}
        seed={7}
        replayKey={key}
        className="text-3xl tracking-[0.02em] sm:text-6xl"
      >
        DUKU LABS
      </PixelRevealText>
    </Stage>
  );
}

/* -------------------------------------------------------------------------
 * 5 · Dynamic Text
 * ---------------------------------------------------------------------- */

const CYCLE = ["DESIGN", "ENGINEERING", "INTELLIGENCE"] as const;

export function DynamicTextDemo() {
  const [index, setIndex] = React.useState(0);
  const [auto, setAuto] = React.useState(true);

  React.useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % CYCLE.length), 2600);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <Stage
      label="dissolve → reveal on value change"
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAuto(false);
            setIndex((i) => (i + 1) % CYCLE.length);
          }}
        >
          Next value
        </Button>
      }
    >
      <div className="flex min-h-[4rem] flex-col items-center gap-2">
        <span className="type-overline text-muted-foreground">Now resolving</span>
        <PixelRevealText
          as="span"
          variant="grid"
          trigger="in-view"
          direction="center"
          duration={850}
          pixelSize={3}
          flicker={0.3}
          className="text-2xl tracking-[-0.01em] sm:text-4xl"
        >
          {CYCLE[index]}
        </PixelRevealText>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------
 * 6 · Interactive Playground
 * ---------------------------------------------------------------------- */

const VARIANTS: PixelVariant[] = ["square", "grid", "circle", "triangle", "line"];
const DIRECTIONS: RevealDirection[] = [
  "left",
  "right",
  "top",
  "bottom",
  "center",
  "random",
];
const TRIGGERS = ["mount", "in-view", "hover", "manual"] as const;

export function PixelRevealPlayground({ className }: { className?: string }) {
  const [text, setText] = React.useState("DESIGN ENGINEERING WITH AI");
  const [variant, setVariant] = React.useState<PixelVariant>("square");
  const [direction, setDirection] = React.useState<RevealDirection>("left");
  const [trigger, setTrigger] =
    React.useState<(typeof TRIGGERS)[number]>("mount");
  const [duration, setDuration] = React.useState(1100);
  const [pixelSize, setPixelSize] = React.useState(3);
  const [flicker, setFlicker] = React.useState(0.32);
  const [intensity, setIntensity] = React.useState(0.75);
  const [seed, setSeed] = React.useState(24);
  const [playing, setPlaying] = React.useState(false);
  const [replayKey, setReplayKey] = React.useState(0);
  const [status, setStatus] = React.useState<"idle" | "running" | "done">("idle");

  const replay = () => {
    setStatus("idle");
    setReplayKey((k) => k + 1);
    if (trigger === "manual") setPlaying(true);
  };

  return (
    <div
      className={cn(
        "grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start",
        className
      )}
    >
      <div className="relative flex min-h-[15rem] items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-background p-6 shadow-sm sm:min-h-[18rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,var(--border)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,black_30%,transparent_100%)]"
        />
        <PixelRevealText
          as="h3"
          variant={variant}
          trigger={trigger}
          direction={direction}
          duration={duration}
          pixelSize={pixelSize}
          flicker={flicker}
          intensity={intensity}
          seed={seed}
          playing={playing}
          replayKey={`${replayKey}-${variant}-${direction}-${trigger}`}
          once={false}
          onStart={() => setStatus("running")}
          onComplete={() => setStatus("done")}
          className="relative max-w-[20ch] text-center text-xl leading-[1.3] tracking-[-0.02em] sm:text-3xl"
        >
          {text || " "}
        </PixelRevealText>
        <span className="absolute bottom-3 left-4 font-mono type-caption text-muted-foreground">
          {status}
        </span>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <Control label="Text">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Text"
          />
        </Control>

        <div className="grid grid-cols-2 gap-3">
          <Control label="Variant">
            <Select
              value={variant}
              onValueChange={(v) => setVariant(v as PixelVariant)}
            >
              <SelectTrigger aria-label="Geist Pixel variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VARIANTS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Control>

          <Control label="Direction">
            <Select
              value={direction}
              onValueChange={(v) => setDirection(v as RevealDirection)}
            >
              <SelectTrigger aria-label="Reveal direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Control>
        </div>

        <Control label="Trigger">
          <Select
            value={trigger}
            onValueChange={(v) => {
              setTrigger(v as (typeof TRIGGERS)[number]);
              setPlaying(false);
            }}
          >
            <SelectTrigger aria-label="Trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRIGGERS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Control>

        <Range
          label="Duration"
          value={duration}
          min={400}
          max={2400}
          step={50}
          suffix="ms"
          onChange={setDuration}
        />
        <Range
          label="Pixel size"
          value={pixelSize}
          min={1}
          max={8}
          step={1}
          suffix="px"
          onChange={setPixelSize}
        />
        <Range
          label="Flicker"
          value={flicker}
          min={0}
          max={1}
          step={0.02}
          onChange={setFlicker}
        />
        <Range
          label="Intensity"
          value={intensity}
          min={0}
          max={1}
          step={0.05}
          onChange={setIntensity}
        />
        <Range
          label="Seed"
          value={seed}
          min={1}
          max={128}
          step={1}
          onChange={setSeed}
        />

        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={replay} className="flex-1">
            Replay
          </Button>
          {trigger === "manual" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? "Stop" : "Play"}
            </Button>
          ) : null}
        </div>
        <p className="type-caption text-muted-foreground">
          Same seed, same pattern — replay proves it. Hover the headline when the
          trigger is <code className="font-mono">hover</code> for the micro-flicker.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Playground chrome
 * ---------------------------------------------------------------------- */

function Control({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="type-overline text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between type-overline text-muted-foreground">
        {label}
        <span className="font-mono type-caption numeric text-foreground">
          {step < 1 ? value.toFixed(2) : value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </label>
  );
}

function Stage({
  children,
  label,
  onReplay,
  action,
}: {
  children: React.ReactNode;
  label?: string;
  onReplay?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[12rem] w-full items-center justify-center px-4 py-8">
      {children}
      {label ? (
        <span className="absolute bottom-0 left-0 font-mono type-caption text-muted-foreground">
          {label}
        </span>
      ) : null}
      {action ? (
        <span className="absolute bottom-0 right-0">{action}</span>
      ) : null}
      {onReplay ? (
        <span className="absolute bottom-0 right-0">
          <Button size="sm" variant="ghost" onClick={onReplay}>
            Replay
          </Button>
        </span>
      ) : null}
    </div>
  );
}

/** The docs preview panel renders this one. */
export function PixelRevealTextDemo() {
  return <DefaultResolveDemo />;
}
