import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Saathi",
  description:
    "Daily Saathi — your unified home inside JioBharatIQ. One tap to Dil Ki Baat (companion) or Kaam Ki Baat (assistant), plus today's reminders, briefing and diary.",
};

// Pin a JDS light surface for the Daily Saathi PM-Design flow (same approach as
// the jobs / commerce design-prototypes). `data-daily-saathi` scopes the token
// overrides in globals.css; `color-scheme: light` stops the OS dark preference
// from flipping the backgrounds. font-jio applies JioType throughout.
export default function DailySaathiLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div
      data-daily-saathi
      className="font-jio flex h-full flex-col"
      style={{ colorScheme: "light" }}
    >
      {children}
    </div>
  );
}
