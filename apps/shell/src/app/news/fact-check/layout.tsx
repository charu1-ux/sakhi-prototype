import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News · Fact Check",
  description: "Verify claims and separate fact from fiction",
};

export default function FactCheckLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
