import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage, type AvatarSize } from "../primitives/Avatar";
import { cn } from "../lib/cn";

export interface AvatarNameProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  secondary?: React.ReactNode;
  size?: AvatarSize;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AvatarName({
  name,
  src,
  secondary,
  size = "md",
  className,
  ...rest
}: AvatarNameProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...rest}>
      <Avatar size={size}>
        {src ? <AvatarImage src={src} alt={name} /> : null}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-fg truncate text-sm font-medium">{name}</span>
        {secondary ? <span className="text-fg-muted truncate text-xs">{secondary}</span> : null}
      </div>
    </div>
  );
}
