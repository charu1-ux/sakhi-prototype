import { Settings } from "lucide-react";
import * as React from "react";

import { ThemeToggle } from "../atoms/ThemeToggle";
import { AvatarName } from "../molecules/AvatarName";
import { Button } from "../primitives/Button";
import { cn } from "../lib/cn";

export interface NavHeaderProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  user?: { name: string; src?: string; secondary?: string };
}

export function NavHeader({ brand, user, className, ...rest }: NavHeaderProps) {
  return (
    <header
      className={cn(
        "border-border bg-bg/80 pt-safe supports-[backdrop-filter]:bg-bg/60 sticky top-0 z-30 flex items-center justify-between gap-4 border-b px-4 py-3 backdrop-blur",
        className,
      )}
      {...rest}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-fg font-semibold tracking-tight">{brand ?? "intelligence-core"}</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" aria-hidden />
        </Button>
        {user ? <AvatarName name={user.name} src={user.src} secondary={user.secondary} /> : null}
      </div>
    </header>
  );
}
