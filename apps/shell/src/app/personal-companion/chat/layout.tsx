import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dil Ki Baat",
  description:
    "Dil Ki Baat — your warm, always-available personal companion inside JioBharatIQ. Text, voice note, or live call.",
};

// Pin a light surface for the companion prototype (same approach as the jobs
// design-prototype). `data-personal-companion` scopes any token overrides and
// `color-scheme: light` stops the OS dark preference flipping backgrounds.
export default function PersonalCompanionChatLayout({
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
