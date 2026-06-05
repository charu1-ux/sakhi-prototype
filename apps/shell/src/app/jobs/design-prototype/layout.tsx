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
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
