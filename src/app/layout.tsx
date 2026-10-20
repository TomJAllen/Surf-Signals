import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.patrolready.au";
const TITLE = "Patrol Ready: brush up on your surf lifesaving patrol skills";
const DESCRIPTION =
  "A quick, free refresher for surf lifesavers: hand signals (with on-camera practice), first aid acronyms and radio calls, plus four new questions every day. Use it alongside your club training. No account needed.";

// Title, description and share preview (the picture is opengraph-image.tsx)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  applicationName: "Patrol Ready",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Patrol Ready",
    locale: "en_AU",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  appleWebApp: { title: "Patrol Ready" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}
      >
        <SessionProvider>
          {children}
          <Footer />
          <AnalyticsProvider />
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
