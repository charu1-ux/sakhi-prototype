import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News · Breaking",
  description: "Live breaking news as it happens",
};

export default function BreakingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
