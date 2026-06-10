import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cricket · Match Scorecard",
  description: "Live scores and full scorecard for cricket matches.",
};

export default function CricketScorecardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div data-design-prototype className="flex h-full flex-col">
      {children}
    </div>
  );
}
