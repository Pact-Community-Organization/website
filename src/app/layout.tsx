import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DisclosureBanner from "@/components/token/DisclosureBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION = "Making it easy and safe for businesses to start building with Pact.";

// Link previews and wallet dApp lists (Linx shows a site's name and icon) read these. The icons
// and the preview image are the files beside this one: icon.png, apple-icon.png, favicon.ico and
// opengraph-image.png, all drawn from the organization's mark (design/brand-guidelines.md §2).
export const metadata: Metadata = {
  metadataBase: new URL("https://pact-community.org"),
  title: {
    default: "Pact Community Organization",
    template: "%s — Pact Community Organization",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Pact Community Organization",
    description: DESCRIPTION,
    siteName: "Pact Community Organization",
    url: "/",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DisclosureBanner />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
