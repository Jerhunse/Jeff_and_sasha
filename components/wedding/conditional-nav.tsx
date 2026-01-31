"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Same minimal nav as SiteHeader — gentle structure for guest reassurance
const navItems = (slug: string) => [
  { href: `/${slug}`, label: "Home" },
  { href: `/${slug}#schedule`, label: "Timeline" },
  { href: `/${slug}#travel`, label: "Travel" },
  { href: `/${slug}#registry`, label: "Registry" },
  { href: `/${slug}#faq`, label: "FAQ" },
  { href: `/${slug}#contact`, label: "Contact" },
]

/**
 * Conditional navbar shown on all pages except the landing page (/).
 * Minimal nav: Home, Details, RSVP, Registry, Q&A.
 */
export function ConditionalNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [weddingData, setWeddingData] = useState<{
    slug: string
    partner1Name: string
    partner2Name: string
  } | null>(null)

  // Hide on landing page and wedding slug pages (which have their own SiteHeader)
  const isLandingPage = pathname === "/"
  const isWeddingPage = pathname?.match(/^\/[^/]+$/) && !pathname.startsWith("/admin") && !pathname.startsWith("/rsvp")
  const isWeddingSubPage = pathname?.match(/^\/[^/]+\//)

  useEffect(() => {
    // Fetch wedding data for nav
    if (!isLandingPage && !isWeddingPage && !isWeddingSubPage) {
      fetch("/api/wedding/current")
        .then((res) => res.json())
        .then((data) => {
          if (data.slug) {
            setWeddingData(data)
          }
        })
        .catch(() => {
          // Ignore errors, just don't show nav
        })
    }
  }, [isLandingPage, isWeddingPage, isWeddingSubPage])

  // Don't render on landing page or wedding pages (they have their own headers)
  if (isLandingPage || isWeddingPage || isWeddingSubPage) {
    return null
  }

  const items = weddingData ? navItems(weddingData.slug) : []

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        {weddingData ? (
          <>
            <Link href={`/${weddingData.slug}`} className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-gold fill-gold" />
              <span className="font-heading text-2xl text-foreground">
                {weddingData.partner1Name} & {weddingData.partner2Name}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild variant="default" size="sm" className="rounded-full ml-2">
                <Link href={`/rsvp/${weddingData.slug}`}>RSVP</Link>
              </Button>
            </nav>

            <div className="flex items-center gap-2">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="font-heading text-2xl text-gold">
                      {weddingData.partner1Name} & {weddingData.partner2Name}
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-8 text-muted-foreground">
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg py-3 px-2 -mx-2 rounded-md transition-colors hover:text-foreground hover:bg-muted/50"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="pt-4 mt-2 border-t border-border/50">
                      <Button asChild className="rounded-full w-full" size="lg">
                        <Link href={`/rsvp/${weddingData.slug}`} onClick={() => setMobileMenuOpen(false)}>
                          RSVP
                        </Link>
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-gold fill-gold" />
            <span className="font-heading text-2xl text-foreground">Wedding Platform</span>
          </div>
        )}
      </div>
    </header>
  )
}
