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
    // Desktop: dark bg + centered phone frame. Mobile: full-screen direct render.
    <div className="md:flex md:min-h-screen md:items-center md:justify-center md:bg-neutral-950">
      <div
        data-design-prototype
        className={[
          // Mobile — fill the whole screen
          "h-dvh w-full overflow-hidden text-fg",
          // Desktop — phone frame
          "md:h-[844px] md:w-[390px] md:rounded-[3rem]",
          "md:shadow-[0_0_0_12px_#1c1c1e,0_48px_96px_rgba(0,0,0,0.65)]",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
