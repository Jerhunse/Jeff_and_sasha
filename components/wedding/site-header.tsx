"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Menu } from "lucide-react"
import { useScrollSpy } from "@/hooks/use-scroll-spy"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SiteHeaderProps {
  weddingSlug: string
  partner1Name: string
  partner2Name: string
  weddingDate: Date
}

// Right-side nav — white/foreground style, same as hero
const navItems = [
  { href: "#home", label: "HOME" },
  { href: "#schedule", label: "TIMELINE" },
  { href: "#travel", label: "TRAVEL" },
  { href: "#registry", label: "REGISTRY" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "CONTACT" },
] as const

const sectionIds = ["home", "schedule", "travel", "registry", "faq", "contact"]

const REQUIRED_RSVP_CODE = "sj2026"

export function SiteHeader({ weddingSlug, partner1Name, partner2Name }: SiteHeaderProps) {
  const activeSection = useScrollSpy(sectionIds)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [codeError, setCodeError] = useState("")
  const [hasRsvpAccess, setHasRsvpAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has already entered the RSVP code
    const rsvpAccess = sessionStorage.getItem("rsvp_access_granted")
    if (rsvpAccess === "true") {
      setHasRsvpAccess(true)
    }
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    
    // If clicking "Home", scroll to top
    if (href === "#home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
      setMobileMenuOpen(false)
      return
    }
    
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)
    
    if (element) {
      const headerOffset = 80 // Account for sticky header height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
    
    setMobileMenuOpen(false)
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  const handleRsvpClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    // Check if user has RSVP access
    if (hasRsvpAccess) {
      router.push(`/rsvp/${weddingSlug}`)
    } else {
      // Show code dialog
      setShowCodeDialog(true)
      setCodeError("")
      setCodeInput("")
    }
    
    // Close mobile menu if open
    setMobileMenuOpen(false)
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (codeInput.trim().toLowerCase() === REQUIRED_RSVP_CODE.toLowerCase()) {
      // Grant access
      sessionStorage.setItem("rsvp_access_granted", "true")
      setHasRsvpAccess(true)
      setShowCodeDialog(false)
      setCodeError("")
      
      // Navigate to RSVP page
      router.push(`/rsvp/${weddingSlug}`)
    } else {
      setCodeError("Invalid code. Please try again.")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="w-full flex h-14 md:h-16 items-center justify-between px-4 md:px-6 lg:px-10 xl:px-12">
        {/* Left: branding — left-justified */}
        <Link 
          href="#home" 
          className="flex items-center space-x-2 shrink-0 min-h-[44px] py-2"
          onClick={handleLogoClick}
        >
          <Heart className="h-5 w-5 md:h-6 md:w-6 text-gold fill-gold" />
          <span className="font-heading text-xl md:text-2xl text-white">
            Jeff & Sasha
          </span>
        </Link>

        {/* Right: nav — right-justified */}
        <nav className="hidden md:flex items-center justify-end gap-4 lg:gap-6 xl:gap-8 text-sm font-medium text-white shrink-0">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.replace("#", "")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`font-sans text-[10px] tracking-[0.2em] uppercase transition-colors hover:text-gold min-h-[44px] flex items-center px-2 ${
                  isActive ? "text-gold font-medium" : ""
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <Button 
            variant="default" 
            size="sm" 
            className="rounded-full ml-2 bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-[10px] tracking-[0.2em] uppercase min-h-[44px] px-6"
            onClick={handleRsvpClick}
          >
            RSVP
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden min-h-[44px] min-w-[44px]">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="font-heading text-2xl text-gold">
                  Jeff & Sasha
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-8 text-muted-foreground">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.replace("#", "")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`text-base md:text-lg py-3 px-2 -mx-2 rounded-md transition-colors hover:text-foreground hover:bg-muted/50 min-h-[44px] flex items-center ${
                        isActive ? "text-gold font-medium" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <div className="pt-4 mt-2 border-t border-border/50">
                  <Button 
                    className="rounded-full w-full min-h-[48px]" 
                    size="lg"
                    onClick={handleRsvpClick}
                  >
                    RSVP
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-gold">Enter RSVP Code</DialogTitle>
            <DialogDescription>
              Please enter your invitation code to access the RSVP page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Invitation Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter code"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value)
                  setCodeError("")
                }}
                className="mt-1"
                autoFocus
              />
              {codeError && (
                <p className="text-sm text-destructive mt-2">{codeError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCodeDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
