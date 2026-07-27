"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { Spinner } from "@/registry/default/ui/spinner";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export interface AgentToolCall {
  tool: string;
  args: string;
  /** Simulated duration in ms. */
  duration?: number;
  result?: string;
  /** First run fails with this error; a retry succeeds. */
  failsOnceWith?: string;
}

export interface AgentStep {
  id: string;
  title: string;
  toolCalls?: AgentToolCall[];
  /** Pause and require human approval before running. */
  approval?: { summary: string };
}

export type AgentRunStatus =
  | "idle"
  | "running"
  | "waiting-approval"
  | "error"
  | "complete"
  | "rejected";

export interface AgentCanvasProps
  extends React.HTMLAttributes<HTMLDivElement> {
  goal: string;
  steps: AgentStep[];
  /** Begin executing on mount. Default false — shows the plan first. */
  autoStart?: boolean;
  /** Rendered when the run completes. */
  artifact?: React.ReactNode;
  onStatusChange?: (status: AgentRunStatus) => void;
  ref?: React.Ref<HTMLDivElement>;
}

type StepState = "pending" | "active" | "done" | "error" | "waiting";
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const STATUS_META: Record<AgentRunStatus, { label: string; tone: string; pulse?: boolean }> = {
  idle: { label: "Plan ready", tone: "text-muted-foreground" },
  running: { label: "Running", tone: "text-agent-active", pulse: true },
  "waiting-approval": { label: "Waiting for approval", tone: "text-agent-waiting", pulse: true },
  error: { label: "Error — retry available", tone: "text-agent-error" },
  complete: { label: "Complete", tone: "text-success" },
  rejected: { label: "Stopped by user", tone: "text-muted-foreground" },
};

/* ------------------------------------------------------------------ */
/* Bits                                                                 */
/* ------------------------------------------------------------------ */

function StepDot({ state }: { state: StepState }) {
  return (
    <span
      className={cn(
        "relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300",
        state === "done" && "border-success bg-success text-white",
        state === "active" && "border-agent-active",
        state === "waiting" && "border-agent-waiting",
        state === "error" && "border-agent-error bg-agent-error text-white",
        state === "pending" && "border-border bg-background shadow-xs"
      )}
    >
      {state === "done" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
      {state === "error" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="size-3" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      ) : null}
      {state === "active" || state === "waiting" ? (
        <>
          <span
            className={cn(
              "absolute inline-flex size-2.5 animate-ping rounded-full opacity-60",
              state === "active" ? "bg-agent-active" : "bg-agent-waiting"
            )}
          />
          <span
            className={cn(
              "size-2 rounded-full",
              state === "active" ? "bg-agent-active" : "bg-agent-waiting"
            )}
          />
        </>
      ) : null}
    </span>
  );
}

function ToolCallRow({
  call,
  state,
  error,
}: {
  call: AgentToolCall;
  state: "pending" | "running" | "done" | "error";
  error?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (!ref.current) return;
      if (reduced) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 8, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power2.out", clearProps: "filter" }
      );
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1.5 font-mono type-meta leading-5"
    >
      <span className="mt-1">
        {state === "running" ? (
          <Spinner size="sm" />
        ) : state === "done" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3 text-success" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : state === "error" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="size-3 text-agent-error" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <span className="block size-3 rounded-full border border-border" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate">
          <span className="font-semibold text-foreground">{call.tool}</span>
          <span className="text-muted-foreground">({call.args})</span>
        </p>
        {state === "done" && call.result ? (
          <p className="truncate text-muted-foreground">→ {call.result}</p>
        ) : null}
        {state === "error" && error ? (
          <p className="truncate text-agent-error">✕ {error}</p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                               */
/* ------------------------------------------------------------------ */

export function AgentCanvas({
  goal,
  steps,
  autoStart = false,
  artifact,
  onStatusChange,
  className,
  ref,
  ...rest
}: AgentCanvasProps) {
  const reduced = useReducedMotion();
  const [status, setStatusRaw] = React.useState<AgentRunStatus>("idle");
  const [stepIdx, setStepIdx] = React.useState(-1);
  const [callIdx, setCallIdx] = React.useState(-1);
  const [failedOnce, setFailedOnce] = React.useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const runToken = React.useRef(0);

  const setStatus = (s: AgentRunStatus) => {
    setStatusRaw(s);
    onStatusChange?.(s);
  };

  const stepState = (i: number): StepState => {
    if (status === "complete" || i < stepIdx) return "done";
    if (i > stepIdx) return "pending";
    if (status === "waiting-approval") return "waiting";
    if (status === "error") return "error";
    if (status === "running") return "active";
    return "pending";
  };

  const runFrom = React.useCallback(
    async (startStep: number, startCall: number) => {
      const token = ++runToken.current;
      setStatus("running");
      setErrorMsg(null);
      for (let i = startStep; i < steps.length; i++) {
        if (runToken.current !== token) return;
        const step = steps[i];
        setStepIdx(i);
        if (step.approval && !(startStep === i && startCall > -1)) {
          setCallIdx(-1);
          setStatus("waiting-approval");
          return; // resumes via approve()
        }
        const calls = step.toolCalls ?? [];
        for (let c = i === startStep ? Math.max(0, startCall) : 0; c < calls.length; c++) {
          if (runToken.current !== token) return;
          setCallIdx(c);
          await wait(calls[c].duration ?? 900);
          if (runToken.current !== token) return;
          const key = `${step.id}:${c}`;
          if (calls[c].failsOnceWith && !failedOnce[key]) {
            setFailedOnce((f) => ({ ...f, [key]: true }));
            setErrorMsg(calls[c].failsOnceWith ?? "Tool failed");
            setStatus("error");
            return;
          }
        }
        setCallIdx(calls.length);
      }
      setStepIdx(steps.length);
      setStatus("complete");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [steps, failedOnce]
  );

  React.useEffect(() => {
    if (autoStart) runFrom(0, -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const approve = () => {
    // continue current step's tool calls after the gate
    runFrom(stepIdx, 0);
  };
  const reject = () => {
    runToken.current++;
    setStatus("rejected");
  };
  const retry = () => runFrom(stepIdx, callIdx);

  const meta = STATUS_META[status];

  return (
    <div
      ref={ref}
      data-slot="agent-canvas"
      className={cn(
        "w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-card shadow-md",
        className
      )}
      {...rest}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-muted/20 px-5 py-3.5">
        <div className="min-w-0">
          <p className="type-overline text-muted-foreground">
            Goal
          </p>
          <p className="truncate text-sm font-medium text-foreground">{goal}</p>
        </div>
        <span className={cn("flex shrink-0 items-center gap-1.5 text-xs font-medium", meta.tone)}>
          {meta.pulse ? (
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-current" />
            </span>
          ) : null}
          {meta.label}
        </span>
      </div>

      {/* Timeline */}
      <ol className="flex flex-col px-5 py-4">
        {steps.map((step, i) => {
          const state = stepState(i);
          const calls = step.toolCalls ?? [];
          return (
            <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[9px] top-6 h-[calc(100%-1.25rem)] w-0.5 rounded transition-colors duration-500",
                    state === "done" ? "bg-success/50" : "bg-border"
                  )}
                />
              ) : null}
              <StepDot state={state} />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm",
                    state === "pending" ? "text-muted-foreground" : "font-medium text-foreground"
                  )}
                >
                  {step.title}
                </p>

                {/* Tool calls appear as the step executes */}
                {(state === "active" || state === "error") && calls.length > 0 ? (
                  <div className="mt-1.5 flex flex-col gap-1">
                    {calls.slice(0, Math.max(0, callIdx + 1)).map((call, c) => (
                      <ToolCallRow
                        key={c}
                        call={call}
                        state={
                          status === "error" && c === callIdx
                            ? "error"
                            : c < callIdx
                              ? "done"
                              : "running"
                        }
                        error={errorMsg ?? undefined}
                      />
                    ))}
                  </div>
                ) : null}
                {state === "done" && calls.length > 0 ? (
                  <p className="mt-0.5 type-meta text-muted-foreground">
                    {calls.length} tool call{calls.length > 1 ? "s" : ""} ·{" "}
                    {calls.map((c) => c.tool).join(", ")}
                  </p>
                ) : null}

                {/* Approval gate */}
                {state === "waiting" && step.approval ? (
                  <div className="mt-2 rounded-lg border border-agent-waiting/40 bg-agent-waiting/10 p-2.5">
                    <p className="text-xs text-foreground">{step.approval.summary}</p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={approve}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={reject}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* Retry */}
                {state === "error" ? (
                  <div className="mt-2">
                    <Button size="sm" variant="outline" onClick={retry}>
                      Retry step
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Footer: start / artifact */}
      <div className="border-t border-border/60 px-5 py-3.5">
        {status === "idle" ? (
          <Button className="w-full" onClick={() => runFrom(0, -1)}>
            Run plan
          </Button>
        ) : null}
        {status === "rejected" ? (
          <Button className="w-full" variant="outline" onClick={() => runFrom(stepIdx, -1)}>
            Resume run
          </Button>
        ) : null}
        {status === "complete" ? (
          artifact ? (
            <ArtifactReveal reduced={reduced}>{artifact}</ArtifactReveal>
          ) : (
            <p className="text-center text-xs text-success">Run complete</p>
          )
        ) : null}
        {status === "running" || status === "waiting-approval" || status === "error" ? (
          <p className="text-center type-meta numeric text-muted-foreground">
            step {Math.min(stepIdx + 1, steps.length)}/{steps.length} · 12.4k tokens · $0.08
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ArtifactReveal({
  children,
  reduced,
}: {
  children: React.ReactNode;
  reduced: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      if (reduced) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power3.out", clearProps: "filter" }
      );
    },
    { scope: ref }
  );
  return (
    <div ref={ref}>
      <p className="mb-2 type-overline text-muted-foreground">
        Artifact
      </p>
      {children}
    </div>
  );
}
