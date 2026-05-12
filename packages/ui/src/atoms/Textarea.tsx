import * as React from "react";

import { cn } from "../lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "border-border bg-surface-elevated text-fg placeholder:text-fg-muted focus-visible:border-primary focus-visible:ring-primary/40 flex min-h-20 w-full resize-y rounded-md border px-3 py-2 text-sm shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...rest}
  />
));
Textarea.displayName = "Textarea";
