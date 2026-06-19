import type { ReactNode } from "react";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
