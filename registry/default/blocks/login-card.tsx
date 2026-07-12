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

export interface LoginCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit" | "title"> {
  onSubmit: (data: {
    email: string;
    password: string;
    remember: boolean;
  }) => Promise<void>;
  title?: string;
  forgotHref?: string;
  signupHref?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginCard({
  onSubmit,
  title = "Welcome back",
  forgotHref = "#forgot",
  signupHref,
  className,
  ref,
  ...rest
}: LoginCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const prevBodyHeight = React.useRef(0);
  const reduced = useReducedMotion();
  React.useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

  const [values, setValues] = React.useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});
  const erred = React.useRef(new Set<"email" | "password">());
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const validate = (
    field: "email" | "password",
    v = values
  ): string | undefined => {
    if (field === "email")
      return EMAIL_RE.test(v.email)
        ? undefined
        : "Enter a valid email address";
    return v.password.length > 0 ? undefined : "Enter your password";
  };

  const handleBlur = (field: "email" | "password") => {
    const msg = validate(field);
    if (msg) erred.current.add(field);
    setErrors((e) => ({ ...e, [field]: msg }));
  };
  const handleChange = (
    field: "email" | "password",
    next: Partial<typeof values>
  ) => {
    const merged = { ...values, ...next };
    setValues(merged);
    if (erred.current.has(field)) {
      setErrors((e) => ({ ...e, [field]: validate(field, merged) }));
    }
  };

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
      if (circle)
        gsap.fromTo(
          circle,
          { scale: 0 },
          { scale: 1, duration: 0.4, ease: "back.out(1.7)", delay: 0.1 }
        );
      if (check)
        gsap.fromTo(
          check,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", delay: 0.45 }
        );
      if (headline)
        gsap.fromTo(
          headline,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.25 }
        );
    },
    { dependencies: [done, reduced], scope: cardRef }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    for (const f of ["email", "password"] as const) {
      const msg = validate(f);
      if (msg) {
        nextErrors[f] = msg;
        erred.current.add(f);
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.email) emailRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }
    setErrors({});
    setSubmitError(null);
    setLoading(true);
    try {
      await onSubmit(values);
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setSubmitError(
        err instanceof Error ? err.message : "Invalid email or password."
      );
    }
  };

  return (
    <div
      ref={cardRef}
      data-slot="login-card"
      className={cn(
        "w-full max-w-md rounded-2xl border border-border bg-card p-8 opacity-0 shadow-sm",
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
              You&apos;re in
            </h2>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="flex flex-col">
            <div data-slot="cascade-item">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to continue to your account.
              </p>
            </div>

            {submitError != null ? (
              <div className="mt-4">
                <Alert variant="destructive" title={submitError} />
              </div>
            ) : null}

            <div data-slot="cascade-item" className="mt-6">
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
                label={
                  <span className="flex w-full items-center justify-between">
                    Password
                    <a
                      href={forgotHref}
                      tabIndex={0}
                      className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Forgot password?
                    </a>
                  </span>
                }
                state={errors.password ? "error" : null}
                message={errors.password}
              >
                <Input
                  ref={passwordRef}
                  type="password"
                  name="current-password"
                  autoComplete="current-password"
                  value={values.password}
                  invalid={!!errors.password}
                  onChange={(e) =>
                    handleChange("password", {
                      password: e.currentTarget.value,
                    })
                  }
                  onBlur={() => handleBlur("password")}
                  disabled={loading || success}
                />
              </Field>
            </div>

            <div data-slot="cascade-item" className="mt-4">
              <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Checkbox
                  checked={values.remember}
                  onCheckedChange={(c) =>
                    setValues((v) => ({ ...v, remember: c === true }))
                  }
                  disabled={loading || success}
                />
                Remember me
              </label>
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
                Sign in
              </Button>
            </div>

            {signupHref ? (
              <p
                data-slot="cascade-item"
                className="mt-5 text-center text-sm text-muted-foreground"
              >
                No account?{" "}
                <a
                  href={signupHref}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Create one
                </a>
              </p>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
