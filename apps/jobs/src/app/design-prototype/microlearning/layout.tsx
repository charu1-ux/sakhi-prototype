import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Microlearning",
};

export default function MicrolearningLayout({ children }: { children: ReactNode }) {
  return (
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
