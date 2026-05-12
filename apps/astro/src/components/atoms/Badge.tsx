import * as React from "react";

import { cn } from "@/lib/cn";

const variants = {
  neutral: "bg-surface text-fg-muted",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  live: "bg-live text-primary-fg",
} as const;

export type BadgeVariant = keyof typeof variants;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs leading-tight font-medium",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
