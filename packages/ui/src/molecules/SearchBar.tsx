"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { Input } from "../atoms/Input";
import { cn } from "../lib/cn";

export interface SearchBarProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value?: string;
  onValueChange?: (value: string) => void;
  containerClassName?: string;
}

export function SearchBar({
  value,
  onValueChange,
  placeholder = "Search…",
  containerClassName,
  className,
  ...rest
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Search
        aria-hidden
        strokeWidth={1.75}
        className="text-fg-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
        placeholder={placeholder}
        className={cn("pr-9 pl-9", className)}
        {...rest}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange?.("")}
          aria-label="Clear search"
          className="text-fg-muted hover:bg-surface focus-visible:ring-primary absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
