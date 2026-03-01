import type { Metadata } from "next"
import {
  Inter,
  Crimson_Pro,
  Quicksand,
  Playfair_Display,
  Montserrat,
  Great_Vibes,
} from "next/font/google"
import "./photobooth.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
})

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
})

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
})

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Lumina Booth - Wedding Photobooth",
  description: "Capture and share your wedding memories",
}

export default function PhotoboothLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      className={`${inter.variable} ${crimsonPro.variable} ${quicksand.variable} ${playfairDisplay.variable} ${montserrat.variable} ${greatVibes.variable}`}
    >
      {children}
    </div>
  )
}
