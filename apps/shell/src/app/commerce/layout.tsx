import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commerce",
  description: "Commerce vertical — JBIQ daily commerce assistant.",
};

/*
 * Wraps every commerce page in [data-commerce-prototype], which switches on
 * the A2UI / JDS token values defined in globals.css (purple scale, JioType,
 * light-pinned surfaces). Scoped here so no other vertical is affected.
 */
export default function CommerceLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div data-commerce-prototype className="bg-bg text-fg flex h-full flex-col">
      {children}
    </div>
  );
}
