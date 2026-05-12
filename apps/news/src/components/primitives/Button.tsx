"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-primary text-primary-fg shadow-low hover:brightness-110 active:brightness-95 disabled:opacity-50",
  secondary:
    "bg-surface text-fg border border-border hover:bg-surface-elevated active:brightness-95 disabled:opacity-50",
  ghost: "text-fg hover:bg-surface active:bg-surface-elevated disabled:opacity-50",
  danger:
    "bg-danger text-primary-fg shadow-low hover:brightness-110 active:brightness-95 disabled:opacity-50",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm rounded-sm gap-1.5",
  md: "h-10 px-4 text-sm rounded-md gap-2",
  lg: "h-12 px-6 text-base rounded-md gap-2",
  icon: "h-10 w-10 rounded-md",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", asChild = false, className, ...rest }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "focus-visible:ring-primary focus-visible:ring-offset-bg inline-flex items-center justify-center font-medium transition-[background-color,color,box-shadow,filter] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...rest}
      />
    );
  },
);
Button.displayName = "Button";
