"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import { Field } from "@/registry/default/ui/field";
import { Checkbox } from "@/registry/default/ui/checkbox";
import { Alert } from "@/registry/default/ui/alert";

export interface SignupCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit" | "title"> {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onOAuth?: (provider: "google" | "github") => void;
  title?: string;
  loginHref?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = "name" | "email" | "password" | "terms";

const MESSAGES: Record<FieldName, string> = {
  name: "Enter your name",
  email: "Enter a valid email address",
  password: "Password must be at least 8 characters",
  terms: "Accept the terms to continue",
};

function passwordLevel(pw: string): number {
  if (pw.length < 8) return pw.length > 0 ? 1 : 0;
  let level = 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) level++;
  if (/\d/.test(pw)) level++;
  if (/[^a-zA-Z0-9]/.test(pw)) level++;
  return level;
}

const LEVEL_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

function levelColor(level: number): string {
  if (level >= 3) return "bg-emerald-500";
  if (level === 2) return "bg-amber-500";
  if (level === 1) return "bg-destructive";
  return "bg-muted";
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
        opacity="0.9"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
        opacity="0.7"
      />
      <path
        fill="currentColor"
        d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9L6.4 14Z"
        opacity="0.5"
      />
      <path
        fill="currentColor"
        d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 5A10 10 0 0 0 3 7.5L6.4 10A5.9 5.9 0 0 1 12 6Z"
        opacity="0.8"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"
      />
    </svg>
  );
}

function EyeToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={visible ? "Hide password" : "Show password"}
      onClick={onToggle}
      tabIndex={-1}
      className="relative flex size-6 items-center justify-center rounded text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          "absolute size-4 transition-opacity duration-150",
          visible ? "opacity-0" : "opacity-100"
        )}
      >
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          "absolute size-4 transition-opacity duration-150",
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M4 20 20 4" />
      </svg>
    </button>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const wasVisible = React.useRef(false);
  const reduced = useReducedMotion();
  const visible = password.length > 0;
  const level = passwordLevel(password);

  // Mounts via height-auto after the first keystroke.
  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      if (visible && !wasVisible.current) {
        wasVisible.current = true;
        if (reduced) {
          gsap.set(el, { height: "auto", opacity: 1 });
          return;
        }
        gsap.fromTo(
          el,
          { height: 0, opacity: 0 },
          {
            height: el.scrollHeight,
            opacity: 1,
            duration: 0.45,
            ease: "power3.inOut",
            onComplete: () => gsap.set(el, { height: "auto" }),
          }
        );
      }
    },
    { dependencies: [visible, reduced], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-slot="strength-meter"
      className="overflow-hidden"
      style={{ height: 0 }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 pt-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((seg) => (
            <span
              key={seg}
              className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <span
                className={cn(
                  "block h-full w-full origin-left rounded-full",
                  "transition-[transform,background-color] duration-200 ease-out",
                  seg <= level ? "scale-x-100" : "scale-x-0",
                  levelColor(level)
                )}
                style={{ transitionDelay: `${(seg - 1) * 60}ms` }}
              />
            </span>
          ))}
        </div>
        <span
          key={LEVEL_LABELS[level]}
          className="w-12 animate-[duku-fade-in_0.2s_ease-out] text-right text-xs text-muted-foreground"
          aria-live="polite"
        >
          {LEVEL_LABELS[level]}
        </span>
      </div>
    </div>
  );
}

export function SignupCard({
  onSubmit,
  onOAuth,
  title = "Create your account",
  loginHref,
  className,
  ref,
  ...rest
}: SignupCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const prevBodyHeight = React.useRef(0);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

  const [values, setValues] = React.useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<FieldName, string>>
  >({});
  const erred = React.useRef(new Set<FieldName>());
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const termsRef = React.useRef<HTMLButtonElement>(null);

  const validate = React.useCallback(
    (field: FieldName, v = values): string | undefined => {
      switch (field) {
        case "name":
          return v.name.trim().length >= 2 ? undefined : MESSAGES.name;
        case "email":
          return EMAIL_RE.test(v.email) ? undefined : MESSAGES.email;
        case "password":
          return v.password.length >= 8 ? undefined : MESSAGES.password;
        case "terms":
          return v.terms ? undefined : MESSAGES.terms;
      }
    },
    [values]
  );

  // "Reward early, punish late": validate on blur first; once a field has
  // erred, re-validate on every change.
  const handleBlur = (field: FieldName) => {
    const msg = validate(field);
    if (msg) erred.current.add(field);
    setErrors((e) => ({ ...e, [field]: msg }));
  };
  const handleChange = (field: FieldName, next: Partial<typeof values>) => {
    const merged = { ...values, ...next };
    setValues(merged);
    if (erred.current.has(field)) {
      setErrors((e) => ({ ...e, [field]: validate(field, merged) }));
    }
  };

  // Card entrance: pop-in + children cascade.
  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;
      const items = gsap.utils.toArray<HTMLElement>(
        card.querySelectorAll('[data-slot="cascade-item"]')
      );
      if (reduced) {
        gsap.set(card, { opacity: 1, scale: 1 });
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        card,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out" }
      );
      gsap.fromTo(
        items,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.05,
          delay: 0.05,
        }
      );
    },
    { scope: cardRef }
  );

  // Crossfade to the success panel with a height-auto morph.
  useGSAP(
    () => {
      const body = bodyRef.current;
      if (!body || !done) return;
      const panel = body.querySelector<HTMLElement>(
        '[data-slot="success-panel"]'
      );
      if (!panel) return;
      if (reduced) {
        gsap.set(body, { height: "auto" });
        gsap.set(panel, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        body,
        { height: prevBodyHeight.current },
        {
          height: body.scrollHeight,
          duration: 0.45,
          ease: "power3.inOut",
          onComplete: () => gsap.set(body, { height: "auto" }),
        }
      );
      gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      const circle = panel.querySelector<HTMLElement>('[data-slot="circle"]');
      const check = panel.querySelector<SVGPathElement>('[data-slot="check"]');
      const headline = panel.querySelector<HTMLElement>(
        '[data-slot="headline"]'
      );
      const subtext = panel.querySelector<HTMLElement>('[data-slot="subtext"]');
      if (circle) {
        gsap.fromTo(
          circle,
          { scale: 0 },
          { scale: 1, duration: 0.4, ease: "back.out(1.7)", delay: 0.1 }
        );
      }
      if (check) {
        gsap.fromTo(
          check,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", delay: 0.45 }
        );
      }
      if (headline) {
        gsap.fromTo(
          headline,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.25 }
        );
      }
      if (subtext) {
        gsap.fromTo(
          subtext,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.4 }
        );
      }
    },
    { dependencies: [done, reduced], scope: cardRef }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fields: FieldName[] = ["name", "email", "password", "terms"];
    const nextErrors: Partial<Record<FieldName, string>> = {};
    for (const f of fields) {
      const msg = validate(f);
      if (msg) {
        nextErrors[f] = msg;
        erred.current.add(f);
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      // Focus the first invalid field; its Field shake plays on error.
      const refs: Record<FieldName, React.RefObject<HTMLElement | null>> = {
        name: nameRef,
        email: emailRef,
        password: passwordRef,
        terms: termsRef,
      };
      for (const f of fields) {
        if (nextErrors[f]) {
          refs[f].current?.focus();
          break;
        }
      }
      return;
    }
    setErrors({});
    setSubmitError(null);
    setLoading(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email,
        password: values.password,
      });
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    }
  };

  const emailValid = values.email !== "" && EMAIL_RE.test(values.email);

  return (
    <div
      ref={cardRef}
      data-slot="signup-card"
      className={cn(
        "w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 opacity-0 shadow-md",
        className
      )}
      {...rest}
    >
      <div ref={bodyRef} className="overflow-hidden">
        {done ? (
          <div
            data-slot="success-panel"
            className="flex flex-col items-center gap-2 py-6 text-center opacity-0"
          >
            <span
              data-slot="circle"
              className="flex size-12 items-center justify-center rounded-full bg-emerald-600/10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              >
                <path
                  data-slot="check"
                  d="M5 13l4 4L19 7"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1}
                />
              </svg>
            </span>
            <h2
              data-slot="headline"
              className="mt-2 text-xl font-semibold text-foreground opacity-0"
            >
              Check your inbox
            </h2>
            <p
              data-slot="subtext"
              className="text-sm text-muted-foreground opacity-0"
            >
              We sent a confirmation link to {values.email}.
            </p>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="flex flex-col">
            <div data-slot="cascade-item">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start your 14-day free trial. No credit card required.
              </p>
            </div>

            {submitError != null ? (
              <div className="mt-4">
                <Alert variant="destructive" title={submitError} />
              </div>
            ) : null}

            {onOAuth ? (
              <div data-slot="cascade-item" className="mt-6">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOAuth("google")}
                  >
                    <GoogleMark />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOAuth("github")}
                  >
                    <GitHubMark />
                    GitHub
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex-1 border-t border-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <span className="flex-1 border-t border-border" />
                </div>
              </div>
            ) : null}

            <div data-slot="cascade-item" className="mt-5">
              <Field
                label="Name"
                state={errors.name ? "error" : null}
                message={errors.name}
              >
                <Input
                  ref={nameRef}
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  invalid={!!errors.name}
                  onChange={(e) =>
                    handleChange("name", { name: e.currentTarget.value })
                  }
                  onBlur={() => handleBlur("name")}
                  disabled={loading || success}
                />
              </Field>
            </div>

            <div data-slot="cascade-item" className="mt-4">
              <Field
                label="Email"
                state={errors.email ? "error" : null}
                message={errors.email}
              >
                <Input
                  ref={emailRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={values.email}
                  invalid={!!errors.email}
                  valid={emailValid}
                  onChange={(e) =>
                    handleChange("email", { email: e.currentTarget.value })
                  }
                  onBlur={() => handleBlur("email")}
                  disabled={loading || success}
                />
              </Field>
            </div>

            <div data-slot="cascade-item" className="mt-4">
              <Field
                label="Password"
                state={errors.password ? "error" : null}
                message={errors.password}
              >
                <Input
                  ref={passwordRef}
                  type={showPw ? "text" : "password"}
                  name="new-password"
                  autoComplete="new-password"
                  value={values.password}
                  invalid={!!errors.password}
                  suffixEl={
                    <EyeToggle
                      visible={showPw}
                      onToggle={() => setShowPw((v) => !v)}
                    />
                  }
                  onChange={(e) =>
                    handleChange("password", {
                      password: e.currentTarget.value,
                    })
                  }
                  onBlur={() => handleBlur("password")}
                  disabled={loading || success}
                />
              </Field>
              <StrengthMeter password={values.password} />
            </div>

            <div data-slot="cascade-item" className="mt-5">
              <Field
                state={errors.terms ? "error" : null}
                message={errors.terms}
              >
                <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Checkbox
                    ref={termsRef}
                    checked={values.terms}
                    onCheckedChange={(c) =>
                      handleChange("terms", { terms: c === true })
                    }
                    disabled={loading || success}
                    className="mt-0.5"
                  />
                  <span>
                    I agree to the{" "}
                    <a
                      href="#terms"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#privacy"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              </Field>
            </div>

            <div data-slot="cascade-item" className="mt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                success={success}
                onSuccessEnd={() => {
                  prevBodyHeight.current = bodyRef.current?.offsetHeight ?? 0;
                  setSuccess(false);
                  setDone(true);
                }}
              >
                Create account
              </Button>
            </div>

            {loginHref ? (
              <p
                data-slot="cascade-item"
                className="mt-5 text-center text-sm text-muted-foreground"
              >
                Already have an account?{" "}
                <a
                  href={loginHref}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Sign in
                </a>
              </p>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
