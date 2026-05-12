import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { ThemeProvider } from "@intelligence/ui";

import { EdgeSwipeBack } from "@/components/atoms/EdgeSwipeBack";

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
      <body className="text-fg flex h-full flex-col">
        <ThemeProvider>
          <EdgeSwipeBack />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
