import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/language-context";
import { AuthorizedPurchaseBanner } from "@/components/layout/authorized-purchase-banner";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { PageTracker } from "@/components/analytics/tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LBDevz — Premium Software Solutions",
    template: "%s | LBDevz",
  },
  description:
    "Minecraft Plugin, FiveM Script, Discord Bot ve daha fazlası için premium yazılım çözümleri.",
  keywords: ["minecraft plugin", "fivem script", "discord bot", "lbdevz", "yazılım", "premium software"],
  authors: [{ name: "LBDevz" }],
  creator: "LBDevz",
  metadataBase: new URL("https://lbdevz.com"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://lbdevz.com",
    siteName: "LBDevz",
    title: "LBDevz — Premium Software Solutions",
    description: "Minecraft Plugin, FiveM Script, Discord Bot ve daha fazlası için profesyonel yazılım çözümleri.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LBDevz — Premium Software Solutions",
    description: "Minecraft Plugin, FiveM Script, Discord Bot ve daha fazlası için premium yazılım çözümleri.",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",   sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",   sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col">
        <Script
          id="turnstile-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `window._turnstilePending=window._turnstilePending||[];window.onTurnstileLoad=function(){var q=window._turnstilePending||[];window._turnstilePending=[];q.forEach(function(fn){fn();});};` }}
        />
        <SessionProvider>
          <LanguageProvider>
            <SmoothScroll>
              <PageTracker />
              <AuthorizedPurchaseBanner />
              {children}
            </SmoothScroll>
          </LanguageProvider>
        </SessionProvider>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}