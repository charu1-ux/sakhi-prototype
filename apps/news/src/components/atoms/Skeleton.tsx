import * as React from "react";

import { cn } from "@/lib/cn";

export function Skeleton({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-hidden className={cn("bg-surface animate-pulse rounded-md", className)} {...rest} />
  );
}
