import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const jioType = localFont({
  src: [
    {
      path: "../../public/fonts/JioTypeVarW05-Regular.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-jio-type",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "intelligence-core",
    template: "%s · intelligence-core",
  },
  description:
    "Multi-vertical chat assistant. PWA-ready, immersive, accessible — built on Next.js, Tailwind v4 and Radix.",
  applicationName: "intelligence-core",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "intelligence-core",
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
    <html lang="en" className={`${jioType.variable} h-full antialiased`} suppressHydrationWarning>
      {/*
       * Mobile: body safe-area padding keeps content away from the notch/home bar.
       * Desktop: white bg outside the phone frame; the inner div becomes the
       * phone-frame container (390×844 px, dark bezel shadow, rounded corners).
       */}
      <body className="bg-bg text-fg flex h-full flex-col md:items-center md:justify-center md:bg-white md:p-0">
        {/* Phone frame — visible only on desktop (md+). Mobile fills full screen. */}
        <div
          className={[
            "flex w-full flex-1 flex-col overflow-hidden",
            "md:flex-none md:h-[844px] md:w-[390px] md:rounded-[3rem]",
            "md:shadow-[0_0_0_12px_#1c1c1e,0_32px_64px_rgba(0,0,0,0.18)]",
          ].join(" ")}
          style={{ transform: "translateZ(0)" }}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </div>
      </body>
    </html>
  );
}
