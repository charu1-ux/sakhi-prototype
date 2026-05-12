"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "../lib/cn";

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { value?: number }
>(({ className, value = 0, ...rest }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("bg-surface relative h-2 w-full overflow-hidden rounded-full", className)}
    {...rest}
  >
    <ProgressPrimitive.Indicator
      className="bg-primary h-full w-full flex-1 transition-transform duration-300 ease-out"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";
