import { Loader2 } from "lucide-react";

import { cn } from "@/lib/cn";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function Spinner({ size = 16, className, ...rest }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      width={size}
      height={size}
      className={cn("text-fg-muted animate-spin", className)}
      {...rest}
    />
  );
}
