"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import { Field } from "@/registry/default/ui/field";
import { Alert } from "@/registry/default/ui/alert";
import { Badge } from "@/registry/default/ui/badge";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface KycData {
  name: string;
  email: string;
  dob: string;
  pan: string;
}

export type KycOutcome = "approved" | "manual-review";

export interface KycFlowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onComplete"> {
  /** Final verification outcome once submitted. Default "approved". */
  outcome?: KycOutcome;
  onComplete?: (data: KycData, outcome: KycOutcome) => void;
  onStepChange?: (step: number) => void;
  initialData?: Partial<KycData>;
  ref?: React.Ref<HTMLDivElement>;
}

const STEPS = ["Details", "PAN", "Documents", "Liveness", "Review"] as const;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                  */
/* ------------------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-3.5", className)}
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/** Big success check that draws itself. */
function SuccessCheck() {
  const ref = React.useRef<SVGPathElement>(null);
  const reduced = useReducedMotion();
  useGSAP(() => {
    if (!ref.current) return;
    if (reduced) {
      gsap.set(ref.current, { strokeDashoffset: 0 });
      return;
    }
    gsap.fromTo(
      ref.current,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", delay: 0.2 }
    );
  });
  return (
    <span className="flex size-14 items-center justify-center rounded-full bg-success/15">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7 text-success"
        aria-hidden="true"
      >
        <path
          ref={ref}
          d="M5 13l4 4L19 7"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
        />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Progress rail                                                        */
/* ------------------------------------------------------------------ */

function StepRail({ step }: { step: number }) {
  const reduced = useReducedMotion();
  const fillRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!fillRef.current) return;
      const pct = (Math.min(step, STEPS.length - 1) / (STEPS.length - 1)) * 100;
      if (reduced) gsap.set(fillRef.current, { width: `${pct}%` });
      else
        gsap.to(fillRef.current, {
          width: `${pct}%`,
          duration: 0.5,
          ease: "power3.inOut",
        });
    },
    { dependencies: [step, reduced] }
  );

  return (
    <ol
      aria-label="Verification progress"
      className="relative mb-6 flex items-start justify-between"
    >
      <span
        aria-hidden="true"
        className="absolute left-3 right-3 top-[11px] h-0.5 bg-border"
      />
      <span
        aria-hidden="true"
        className="absolute left-3 top-[11px] h-0.5 max-w-[calc(100%-1.5rem)] rounded-full"
        ref={fillRef}
        style={{
          width: 0,
          background: "linear-gradient(90deg, color-mix(in oklab, var(--primary) 55%, transparent), var(--primary))",
        }}
      />
      {STEPS.map((label, i) => {
        const done = step > i;
        const active = step === i;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="relative flex w-12 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border-2 type-caption font-semibold transition-colors duration-300",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : active
                    ? "border-primary bg-background text-foreground"
                    : "border-border bg-background text-muted-foreground"
              )}
            >
              {done ? <CheckIcon className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "type-caption font-medium",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Step container: directional slide-in on step change                  */
/* ------------------------------------------------------------------ */

function StepPanel({
  step,
  dir,
  children,
}: {
  step: number;
  dir: 1 | -1;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;
      if (reduced) {
        gsap.set(ref.current, { x: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { x: 28 * dir, opacity: 0, filter: "blur(6px)" },
        {
          x: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power3.out",
          clearProps: "filter",
        }
      );
    },
    { dependencies: [step], scope: ref }
  );

  return (
    <div ref={ref} key={step}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2: document capture card                                        */
/* ------------------------------------------------------------------ */

type DocState = "idle" | "checking" | "glare" | "done";

function DocCapture({
  label,
  state,
  onCapture,
}: {
  label: string;
  state: DocState;
  onCapture: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-xl border border-dashed p-4 text-center transition-colors duration-300",
        state === "done"
          ? "border-success/60 bg-success/5"
          : state === "glare"
            ? "border-warning/60 bg-warning/5"
            : "border-border"
      )}
    >
      <span className="text-xs font-medium text-foreground">{label}</span>
      {state === "idle" ? (
        <>
          <span className="type-meta text-muted-foreground">
            Align inside the frame — we check focus and glare
          </span>
          <Button size="sm" variant="outline" onClick={onCapture}>
            Capture
          </Button>
        </>
      ) : null}
      {state === "checking" ? (
        <>
          <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span className="absolute inset-y-0 w-1/3 animate-duku-shimmer rounded-full bg-primary/60" />
          </span>
          <span className="type-meta text-muted-foreground">
            Checking edges, blur and glare…
          </span>
        </>
      ) : null}
      {state === "glare" ? (
        <>
          <span className="type-meta text-warning">
            Glare detected — tilt the document away from the light
          </span>
          <Button size="sm" variant="outline" onClick={onCapture}>
            Retake
          </Button>
        </>
      ) : null}
      {state === "done" ? (
        <span className="flex items-center gap-1.5 type-meta font-medium text-success">
          <CheckIcon /> Quality passed
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3: liveness arc                                                 */
/* ------------------------------------------------------------------ */

const LIVENESS_PROMPTS = [
  "Center your face",
  "Turn your head left",
  "Turn your head right",
  "Blink twice",
] as const;

function LivenessCheck({
  running,
  done,
  prompt,
  progress,
}: {
  running: boolean;
  done: boolean;
  prompt: string;
  progress: number;
}) {
  const arcRef = React.useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!arcRef.current) return;
      if (reduced) {
        gsap.set(arcRef.current, { strokeDashoffset: 1 - progress });
        return;
      }
      gsap.to(arcRef.current, {
        strokeDashoffset: 1 - progress,
        duration: 0.8,
        ease: "power2.inOut",
      });
    },
    { dependencies: [progress, reduced] }
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg viewBox="0 0 120 120" className="size-32" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            strokeWidth="4"
            className="stroke-muted"
          />
          <circle
            ref={arcRef}
            cx="60"
            cy="60"
            r="54"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
            transform="rotate(-90 60 60)"
            className={cn(done ? "stroke-success" : "stroke-primary")}
          />
          {/* abstract face silhouette */}
          <circle cx="60" cy="50" r="14" className="fill-muted-foreground/30" />
          <path
            d="M36 92c4-14 14-20 24-20s20 6 24 20"
            className="fill-muted-foreground/30"
          />
        </svg>
        {done ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <SuccessCheck />
          </span>
        ) : null}
      </div>
      <p
        aria-live="polite"
        className={cn(
          "text-sm font-medium",
          done ? "text-success" : "text-foreground"
        )}
      >
        {done ? "Liveness confirmed" : running ? prompt : "Ready when you are"}
      </p>
      <p className="max-w-xs text-center type-meta leading-4 text-muted-foreground">
        Frames are processed on-device for this check and never stored. This
        demo simulates the camera.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The flow                                                             */
/* ------------------------------------------------------------------ */

export function KycFlow({
  outcome = "approved",
  onComplete,
  onStepChange,
  initialData,
  className,
  ref,
  ...rest
}: KycFlowProps) {
  const [step, setStepRaw] = React.useState(0);
  const [dir, setDir] = React.useState<1 | -1>(1);
  const [data, setData] = React.useState<KycData>({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    dob: initialData?.dob ?? "",
    pan: initialData?.pan ?? "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof KycData, string>>>({});
  const [panState, setPanState] = React.useState<"idle" | "verifying" | "verified">("idle");
  const [docFront, setDocFront] = React.useState<DocState>("idle");
  const [docBack, setDocBack] = React.useState<DocState>("idle");
  const frontAttempts = React.useRef(0);
  const [liveRunning, setLiveRunning] = React.useState(false);
  const [liveDone, setLiveDone] = React.useState(false);
  const [livePrompt, setLivePrompt] = React.useState<string>(LIVENESS_PROMPTS[0]);
  const [liveProgress, setLiveProgress] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<KycOutcome | null>(null);

  const setStep = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStepRaw(next);
    onStepChange?.(next);
  };

  const patch = (k: keyof KycData, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  /* Step 0 */
  const submitDetails = () => {
    const next: typeof errors = {};
    if (data.name.trim().length < 2) next.name = "Enter your full legal name.";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) next.email = "Enter a valid email.";
    if (!data.dob) next.dob = "Date of birth is required.";
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setStep(1);
  };

  /* Step 1 */
  const verifyPan = async () => {
    if (!PAN_RE.test(data.pan)) {
      setErrors((e) => ({
        ...e,
        pan: "PAN must look like ABCDE1234F.",
      }));
      return;
    }
    setPanState("verifying");
    await wait(1200);
    setPanState("verified");
  };

  /* Step 2 */
  const capture = async (side: "front" | "back") => {
    const set = side === "front" ? setDocFront : setDocBack;
    set("checking");
    await wait(1100);
    if (side === "front" && frontAttempts.current === 0) {
      frontAttempts.current += 1;
      set("glare"); // first front attempt fails: the state is the product
      return;
    }
    set("done");
  };

  /* Step 3 */
  const runLiveness = async () => {
    setLiveRunning(true);
    for (let i = 0; i < LIVENESS_PROMPTS.length; i++) {
      setLivePrompt(LIVENESS_PROMPTS[i]);
      setLiveProgress((i + 1) / LIVENESS_PROMPTS.length);
      await wait(900);
    }
    setLiveRunning(false);
    setLiveDone(true);
  };

  /* Step 4 */
  const submitAll = async () => {
    setSubmitting(true);
    await wait(1500);
    setSubmitting(false);
    setResult(outcome);
    setStep(5);
    onComplete?.(data, outcome);
  };

  const review: [string, string, number][] = [
    ["Name", data.name, 0],
    ["Email", data.email, 0],
    ["Date of birth", data.dob, 0],
    ["PAN", data.pan, 1],
    ["ID document", "Front + back verified", 2],
    ["Liveness", "Confirmed", 3],
  ];

  return (
    <div
      ref={ref}
      data-slot="kyc-flow"
      className={cn(
        "w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-md",
        className
      )}
      {...rest}
    >
      {step < 5 ? <StepRail step={step} /> : null}

      <StepPanel step={step} dir={dir}>
        {step === 0 ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitDetails();
            }}
          >
            <Field
              label="Full name"
              state={errors.name ? "error" : null}
              message={errors.name}
            >
              <Input
                value={data.name}
                invalid={!!errors.name}
                autoComplete="name"
                onChange={(e) => patch("name", e.target.value)}
              />
            </Field>
            <Field
              label="Email"
              state={errors.email ? "error" : null}
              message={errors.email}
            >
              <Input
                type="email"
                value={data.email}
                invalid={!!errors.email}
                autoComplete="email"
                onChange={(e) => patch("email", e.target.value)}
              />
            </Field>
            <Field
              label="Date of birth"
              state={errors.dob ? "error" : null}
              message={errors.dob}
            >
              <Input
                type="date"
                value={data.dob}
                invalid={!!errors.dob}
                onChange={(e) => patch("dob", e.target.value)}
              />
            </Field>
            <Button type="submit" className="mt-1">
              Continue
            </Button>
          </form>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-4">
            <Field
              label="PAN"
              state={errors.pan ? "error" : panState === "verified" ? "success" : "hint"}
              message={
                errors.pan ??
                (panState === "verified"
                  ? "Verified against the income-tax registry."
                  : "Permanent Account Number, e.g. ABCDE1234F.")
              }
            >
              <Input
                value={data.pan}
                invalid={!!errors.pan}
                valid={panState === "verified"}
                maxLength={10}
                autoCapitalize="characters"
                disabled={panState !== "idle"}
                onChange={(e) => patch("pan", e.target.value.toUpperCase())}
              />
            </Field>
            {panState === "verified" ? (
              <Alert variant="success" title="Name match">
                Registered name matches your PAN record.
              </Alert>
            ) : null}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              {panState === "verified" ? (
                <Button className="flex-1" onClick={() => setStep(2)}>
                  Continue
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  loading={panState === "verifying"}
                  onClick={verifyPan}
                >
                  Verify PAN
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <DocCapture
                label="ID front"
                state={docFront}
                onCapture={() => capture("front")}
              />
              <DocCapture
                label="ID back"
                state={docBack}
                onCapture={() => capture("back")}
              />
            </div>
            <p className="type-meta text-muted-foreground">
              No camera? You can also upload a scan — the same quality checks
              apply.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={docFront !== "done" || docBack !== "done"}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-4">
            <LivenessCheck
              running={liveRunning}
              done={liveDone}
              prompt={livePrompt}
              progress={liveProgress}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              {liveDone ? (
                <Button className="flex-1" onClick={() => setStep(4)}>
                  Continue
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  loading={liveRunning}
                  onClick={runLiveness}
                >
                  Start liveness check
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="flex flex-col gap-4">
            <dl className="divide-y divide-border rounded-xl border border-border">
              {review.map(([k, v, target]) => (
                <div
                  key={k}
                  className="flex items-center justify-between gap-2 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <dt className="type-overline text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="truncate text-sm text-foreground">{v}</dd>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(target)}
                    className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </dl>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button className="flex-1" loading={submitting} onClick={submitAll}>
                Submit for verification
              </Button>
            </div>
          </div>
        ) : null}

        {step === 5 && result === "approved" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <SuccessCheck />
            <h3 className="text-lg font-semibold text-foreground">
              Identity verified
            </h3>
            <p className="max-w-xs text-sm text-muted-foreground">
              {data.name.split(" ")[0] || "You"}, your account is fully
              activated. A confirmation is on its way to {data.email}.
            </p>
          </div>
        ) : null}

        {step === 5 && result === "manual-review" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Badge variant="outline" pulse className="text-warning">
              Manual review
            </Badge>
            <h3 className="text-lg font-semibold text-foreground">
              A specialist is taking a look
            </h3>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your documents passed automated checks but need one human
              confirmation. Typical turnaround is under 2 hours — we&apos;ll
              email {data.email} the moment it completes. Nothing else is
              needed from you.
            </p>
          </div>
        ) : null}
      </StepPanel>
    </div>
  );
}
