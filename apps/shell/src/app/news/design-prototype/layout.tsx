import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News · Daily Briefing",
  description: "Your morning news digest — top stories curated for you.",
};

export default function NewsBriefingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
