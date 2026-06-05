import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Creator · Microlearning" };

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return (
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
