import * as React from "react";

import { Avatar, AvatarFallback } from "../primitives/Avatar";
import { cn } from "../lib/cn";

export interface MessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant";
  authorName?: string;
  timestamp?: string;
  children: React.ReactNode;
}

export function MessageBubble({
  role,
  authorName,
  timestamp,
  children,
  className,
  ...rest
}: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={cn("flex w-full gap-3", isUser ? "flex-row-reverse" : "flex-row", className)}
      {...rest}
    >
      <Avatar size="md" className={isUser ? "bg-primary/15" : undefined}>
        <AvatarFallback>
          {(authorName ?? (isUser ? "You" : "AI")).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex max-w-[75%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "shadow-low rounded-lg px-3 py-2 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-fg rounded-tr-sm"
              : "bg-surface-elevated text-fg rounded-tl-sm",
          )}
        >
          {children}
        </div>
        {timestamp ? <span className="text-fg-muted text-xs">{timestamp}</span> : null}
      </div>
    </div>
  );
}
