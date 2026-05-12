import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

const sizes = {
  sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
} as const;

export type IconBoxSize = keyof typeof sizes;

export interface IconBoxProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon;
  size?: IconBoxSize;
  label?: string;
}

export function IconBox({ icon: Icon, size = "md", label, className, ...rest }: IconBoxProps) {
  return (
    <span
      role={label ? "img" : "presentation"}
      aria-label={label}
      className={cn(
        "bg-surface text-fg-muted inline-flex items-center justify-center rounded-md",
        sizes[size],
        className,
      )}
      {...rest}
    >
      <Icon strokeWidth={1.75} aria-hidden />
    </span>
  );
}
