"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Initials (or short string) shown when the image is missing/failed. */
  fallback?: string;
  ref?: React.Ref<HTMLSpanElement>;
}

type LoadState = "loading" | "loaded" | "error";

export function Avatar({
  src,
  alt = "",
  fallback,
  className,
  ref,
  ...rest
}: AvatarProps) {
  const [state, setState] = React.useState<LoadState>(
    src ? "loading" : "error"
  );

  React.useEffect(() => {
    setState(src ? "loading" : "error");
  }, [src]);

  return (
    <span
      ref={ref}
      data-slot="avatar"
      data-state={state}
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted align-middle",
        className
      )}
      {...rest}
    >
      {/* shimmer while the image loads */}
      {state === "loading" ? (
        <span
          data-slot="shimmer"
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden"
        >
          <span className="absolute inset-0 animate-[duku-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
        </span>
      ) : null}
      {src && state !== "error" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-slot="image"
          src={src}
          alt={alt}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={cn(
            "size-full object-cover transition-opacity duration-300",
            state === "loaded" ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <span
          data-slot="fallback"
          className="animate-[duku-fade-in_0.3s_ease-out] text-xs font-medium uppercase text-muted-foreground"
        >
          {fallback ?? alt.slice(0, 2)}
        </span>
      )}
    </span>
  );
}

export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Max avatars shown before collapsing into a +N counter. */
  max?: number;
  ref?: React.Ref<HTMLDivElement>;
}

export function AvatarGroup({
  max,
  className,
  children,
  ref,
  ...rest
}: AvatarGroupProps) {
  const items = React.Children.toArray(children);
  const visible = max != null ? items.slice(0, max) : items;
  const overflow = max != null ? items.length - max : 0;

  return (
    <div
      ref={ref}
      data-slot="avatar-group"
      className={cn(
        "flex items-center -space-x-2 hover:-space-x-0.5",
        "[&>*]:ring-2 [&>*]:ring-background",
        "[&>*]:transition-[margin] [&>*]:duration-[250ms] [&>*]:ease-out",
        className
      )}
      {...rest}
    >
      {visible}
      {overflow > 0 ? (
        <span
          data-slot="counter"
          className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground"
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
