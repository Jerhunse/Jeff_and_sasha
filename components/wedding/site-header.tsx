"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface SiteHeaderProps {
  weddingSlug: string
  partner1Name: string
  partner2Name: string
  weddingDate: Date
}

export function SiteHeader({ weddingSlug, partner1Name, partner2Name, weddingDate }: SiteHeaderProps) {
  const navItems = [
    { href: `/${weddingSlug}`, label: "Home" },
    { href: `/${weddingSlug}/schedule`, label: "Schedule" },
    { href: `/${weddingSlug}/travel`, label: "Travel" },
    { href: `/${weddingSlug}/registry`, label: "Registry" },
    { href: `/${weddingSlug}/faq`, label: "FAQ" },
    { href: `/${weddingSlug}/contact`, label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={`/${weddingSlug}`} className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-gold fill-gold" />
          <span className="font-cursive text-2xl text-foreground">
            {partner1Name} & {partner2Name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Button asChild variant="default" className="rounded-full">
            <Link href={`/rsvp/${weddingSlug}`}>RSVP</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

