import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News · Pulse of Nation",
  description: "What India is talking about right now",
};

export default function PulseLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
