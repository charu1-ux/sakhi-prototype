import type { ReactNode } from "react";
import type { Metadata } from "next";
import { LangProvider } from "./LangContext";
import { VoiceLayer } from "./voice/VoiceLayer";

export const metadata: Metadata = { title: "Women's Health · Hub" };

export default function WomensHealthLayout({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      {/* `relative` anchors the additive voice FAB / listening sheet to the app
          frame. VoiceLayer is a sibling of the screen content, so it overlays
          every screen without any page needing to change. */}
      <div data-design-prototype className="relative flex h-full flex-col">
        {children}
        <VoiceLayer />
      </div>
    </LangProvider>
  );
}
