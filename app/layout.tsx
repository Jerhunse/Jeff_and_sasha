import type { Metadata } from "next";
import {
  Inter,
  Cormorant_Garamond,
  EB_Garamond,
  Dancing_Script,
} from "next/font/google";
import "../src/styles/theme.css";
import "./globals.css";
import "../src/styles/components.css";
import TextureLayer from "../src/components/TextureLayer";
import { ConditionalNav } from "@/components/wedding/conditional-nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Our Wedding | Jeff & Sasha",
  description: "Join us in celebrating our special day",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} ${ebGaramond.variable} ${dancingScript.variable} font-sans antialiased`}
      >
        <TextureLayer />
        <ConditionalNav />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
