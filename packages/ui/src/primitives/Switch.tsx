"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "../lib/cn";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...rest }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer focus-visible:ring-primary focus-visible:ring-offset-bg data-[state=checked]:bg-primary data-[state=unchecked]:bg-border-strong inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...rest}
  >
    <SwitchPrimitive.Thumb className="bg-bg shadow-low pointer-events-none block h-5 w-5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
