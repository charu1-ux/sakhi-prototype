import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: "Jobs · Hub",
  description: "Jobs vertical hub — Micro learning, English, Interview prep, Govt. exams.",
};

const jioType = localFont({
  src: [
    {
      path: "../../../../../public/fonts/JioTypeVarW05-Regular.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-jio-type",
  display: "swap",
});

export default function DesignPrototypeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div data-design-prototype className={`${jioType.variable} flex h-full flex-col`}>
      {children}
    </div>
  );
}
