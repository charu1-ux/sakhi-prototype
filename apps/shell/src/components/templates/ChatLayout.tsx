import * as React from "react";

import { ChatInputDock, NavHeader, cn } from "@intelligence/ui";

export interface ChatLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  dock?: React.ReactNode;
  children: React.ReactNode;
}

export function ChatLayout({
  header,
  sidebar,
  dock,
  children,
  className,
  ...rest
}: ChatLayoutProps) {
  return (
    <div className={cn("bg-bg text-fg flex min-h-dvh flex-col", className)} {...rest}>
      {header ?? <NavHeader />}
      <div className="flex min-h-0 flex-1">
        {sidebar ? (
          <aside className="border-border bg-surface hidden w-72 shrink-0 border-r md:block">
            {sidebar}
          </aside>
        ) : null}
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">{children}</div>
          {dock ?? <ChatInputDock />}
        </main>
      </div>
    </div>
  );
}
