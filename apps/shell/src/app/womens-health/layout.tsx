import type { ReactNode } from "react";
import type { Metadata } from "next";
import { LangProvider } from "./LangContext";

export const metadata: Metadata = { title: "Women's Health · Hub" };

export default function WomensHealthLayout({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <div data-design-prototype className="flex h-full flex-col">
        {children}
      </div>
    </LangProvider>
  );
}
