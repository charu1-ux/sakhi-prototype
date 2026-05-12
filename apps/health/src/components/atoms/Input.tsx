import * as React from "react";

import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...rest }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "border-border bg-surface-elevated text-fg placeholder:text-fg-muted focus-visible:border-primary focus-visible:ring-primary/40 flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...rest}
  />
));
Input.displayName = "Input";
