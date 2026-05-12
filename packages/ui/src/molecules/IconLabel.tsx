import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface IconLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon;
  label: React.ReactNode;
  iconClassName?: string;
}

export function IconLabel({
  icon: Icon,
  label,
  className,
  iconClassName,
  ...rest
}: IconLabelProps) {
  return (
    <span className={cn("text-fg inline-flex items-center gap-2 text-sm", className)} {...rest}>
      <Icon aria-hidden strokeWidth={1.75} className={cn("text-fg-muted h-4 w-4", iconClassName)} />
      <span>{label}</span>
    </span>
  );
}
