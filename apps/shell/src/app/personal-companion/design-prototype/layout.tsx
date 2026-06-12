import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Companion · Design Prototype",
  description: "Personal Companion home — design prototype.",
};

// Pin the companion's light surface (same approach as the chat route).
export default function PersonalCompanionDesignPrototypeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div data-personal-companion className="flex h-full flex-col" style={{ colorScheme: "light" }}>
      {children}
    </div>
  );
}
