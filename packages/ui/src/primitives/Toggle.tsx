"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import * as React from "react";

import { cn } from "../lib/cn";

export const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, ...rest }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      "text-fg-muted hover:bg-surface focus-visible:ring-primary data-[state=on]:bg-primary data-[state=on]:text-primary-fg inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...rest}
  />
));
Toggle.displayName = "Toggle";
