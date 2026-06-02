import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { GsapProvider, ThemeProvider } from "@intelligence/ui";

import { EdgeSwipeBack } from "@/components/atoms/EdgeSwipeBack";
import { ShellJobsMessageBridge } from "@/components/ShellJobsMessageBridge";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "intelligence-prototype",
    template: "%s · intelligence-prototype",
  },
  description:
    "Multi-vertical chat assistant. PWA-ready, immersive, accessible — built on Next.js, Tailwind v4 and Radix.",
  applicationName: "intelligence-prototype",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "intelligence-prototype",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="text-fg flex h-full flex-col md:bg-white">
        <ThemeProvider>
          <GsapProvider>
            <EdgeSwipeBack />
            <ShellJobsMessageBridge />
            {/* Mobile: full-screen direct. Desktop: centered phone frame on light bg. */}
            <div className="flex h-full flex-1 flex-col md:items-center md:justify-center md:py-8">
              <div
                className={[
                  "flex h-full w-full flex-1 flex-col overflow-hidden",
                  "md:h-[844px] md:w-[390px] md:flex-none md:rounded-[3rem]",
                  "md:shadow-[0_0_0_12px_#1c1c1e,0_32px_64px_rgba(0,0,0,0.18)]",
                ].join(" ")}
              >
                {children}
              </div>
            </div>
          </GsapProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
