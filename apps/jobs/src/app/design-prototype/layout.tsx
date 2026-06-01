import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs · Hub",
  description: "Jobs vertical hub — Micro learning, English, Interview prep, Govt. exams.",
};

export default function DesignPrototypeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    /*
     * data-design-prototype scopes the Figma-matched light-mode tokens
     * (see globals.css [data-design-prototype] block).
     * The phone frame itself lives in the jobs root layout so every jobs
     * route is consistently wrapped — no nested frame here.
     */
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
