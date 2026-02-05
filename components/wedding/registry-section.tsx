"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ExternalLink, DollarSign, Heart } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RegistryLink {
  id: string
  label: string
  url: string
  description: string | null
  imageUrl: string | null
}

interface CashFund {
  id: string
  title: string
  description: string | null
  goal: number | null
  received: number
  imageUrl: string | null
  isActive: boolean
}

interface RegistrySectionProps {
  registryLinks: RegistryLink[]
  cashFunds: CashFund[]
  slug: string
}

export function RegistrySection({ registryLinks, cashFunds, slug }: RegistrySectionProps) {
  const [isCashFundDialogOpen, setIsCashFundDialogOpen] = useState(false)

  return (
    <section id="registry" className="scroll-mt-20 relative">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header — matches timeline section */}
        <header className="text-center mb-16 md:mb-24">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-gold mb-4 drop-shadow-sm">
            Registry
          </h2>
          <p className="font-sans text-base md:text-xl lg:text-2xl tracking-[0.2em] uppercase text-foreground/90 mb-6">
            Your Presence Is The Greatest Gift
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-8 md:w-12 bg-gold" />
            <p className="font-serif italic text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl px-4">
              If you wish to honor us with a gift, we&rsquo;ve registered at the following stores
            </p>
            <div className="h-px w-8 md:w-12 bg-gold" />
          </div>
        </header>

        {/* Cash Funds Section */}
        {cashFunds.length > 0 && (
          <div className="mb-12">
            <div className="h-px w-32 bg-gold/30 mx-auto mb-12" />
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl md:text-3xl text-gold mb-2 drop-shadow-sm">Cash Funds</h2>
              <p className="font-serif italic text-muted-foreground">
                Help us create unforgettable memories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              {cashFunds.map((fund) => {
                const progressPercentage = fund.goal
                  ? Math.min((fund.received / fund.goal) * 100, 100)
                  : 0

                return (
                  <Card 
                    key={fund.id} 
                    className="card-hover overflow-hidden rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
                    style={{
                      maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                    }}
                  >
                      {fund.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={fund.imageUrl}
                            alt={fund.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-serif text-lg md:text-xl lg:text-2xl text-foreground uppercase tracking-wide mb-1">
                            {fund.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 shrink-0">
                          <Heart className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                        </div>
                      </div>

                      {fund.description && (
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">{fund.description}</p>
                      )}

                        {fund.goal && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs md:text-sm mb-2">
                              <span className="font-medium">
                                ${fund.received.toFixed(0)} raised
                              </span>
                              <span className="text-muted-foreground">
                                ${fund.goal.toFixed(0)} goal
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                      <Button asChild className="w-full min-h-[44px]">
                        <Link href={`/${slug}/registry/contribute/${fund.id}`}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Contribute
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Combined Registry Section */}
        {registryLinks.length === 0 && cashFunds.length === 0 ? (
          <Card 
            className="rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <CardContent className="pt-8 text-center py-12">
              <p className="font-serif italic text-muted-foreground mb-4">
                Registry details coming soon!
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later for our registry information.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Registry Links */}
              {registryLinks.map((item) => (
                <Card 
                  key={item.id} 
                  className="card-hover overflow-hidden rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
                  style={{
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                  }}
                >
                  {item.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <h3 className="font-serif text-lg md:text-xl lg:text-2xl text-foreground uppercase tracking-wide mb-2">{item.label}</h3>
                    {item.description && (
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                    )}
                    <Button asChild className="w-full min-h-[44px]">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        View Registry
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Cash Fund Card */}
              <Card 
                className="card-hover overflow-hidden rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-serif text-lg md:text-xl lg:text-2xl text-foreground uppercase tracking-wide mb-1">
                        Cash Fund
                      </h3>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 shrink-0">
                      <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
                    If you prefer to give a monetary gift, we accept contributions through multiple platforms for your convenience.
                  </p>

                  <Button 
                    className="w-full min-h-[44px]"
                    onClick={() => setIsCashFundDialogOpen(true)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Payment Options
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Optional message if there are no cash funds in the database but registries exist */}
            {cashFunds.length === 0 && registryLinks.length > 0 && (
              <p className="text-center text-xs text-muted-foreground mt-8 font-serif italic">
                Cash Gift Alternative: If you prefer to give a monetary gift, we&rsquo;ll provide details closer to the wedding date.
              </p>
            )}
          </>
        )}

        {/* Cash Fund Dialog */}
        <Dialog open={isCashFundDialogOpen} onOpenChange={setIsCashFundDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white/98 dark:bg-neutral-900/98 backdrop-blur-md border border-gold/20">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl text-center text-gold mb-2">
                Cash Fund
              </DialogTitle>
              <DialogDescription className="text-center font-serif italic text-base">
                Choose your preferred payment method
              </DialogDescription>
            </DialogHeader>
            
            <div className="h-px w-20 bg-gold/30 mx-auto my-4" />
            
            <div className="space-y-3 py-2">
              {/* PayPal */}
              <Button
                asChild
                variant="outline"
                className="w-full h-16 text-base justify-start gap-4 hover:bg-gold/5 hover:border-gold/40 transition-all duration-200 bg-white/50 dark:bg-neutral-800/50"
              >
                <a
                  href="https://www.paypal.com/paypalme/yourhandle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#0070BA] to-[#1546a0] shadow-sm">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <div className="flex-1 text-left ml-1">
                    <div className="font-serif text-foreground">PayPal</div>
                    <div className="text-xs text-muted-foreground font-sans">Send via PayPal.me</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gold/60" />
                </a>
              </Button>

              {/* Zelle */}
              <Button
                variant="outline"
                className="w-full h-16 text-base justify-start gap-4 hover:bg-gold/5 hover:border-gold/40 transition-all duration-200 bg-white/50 dark:bg-neutral-800/50"
                onClick={() => {
                  navigator.clipboard.writeText('your-email@example.com')
                  alert('Zelle email copied to clipboard!')
                }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#6D1ED4] to-[#4a1591] shadow-sm">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <div className="flex-1 text-left ml-1">
                  <div className="font-serif text-foreground">Zelle</div>
                  <div className="text-xs text-muted-foreground font-sans">your-email@example.com</div>
                </div>
                <div className="text-xs text-gold/70 font-serif italic">Tap to copy</div>
              </Button>

              {/* Cash App */}
              <Button
                asChild
                variant="outline"
                className="w-full h-16 text-base justify-start gap-4 hover:bg-gold/5 hover:border-gold/40 transition-all duration-200 bg-white/50 dark:bg-neutral-800/50"
              >
                <a
                  href="https://cash.app/$yourcashtag"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#00D64B] to-[#00a83a] shadow-sm">
                    <span className="text-white font-bold text-xl">$</span>
                  </div>
                  <div className="flex-1 text-left ml-1">
                    <div className="font-serif text-foreground">Cash App</div>
                    <div className="text-xs text-muted-foreground font-sans">$yourcashtag</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gold/60" />
                </a>
              </Button>

              {/* Venmo */}
              <Button
                asChild
                variant="outline"
                className="w-full h-16 text-base justify-start gap-4 hover:bg-gold/5 hover:border-gold/40 transition-all duration-200 bg-white/50 dark:bg-neutral-800/50"
              >
                <a
                  href="https://venmo.com/u/yourhandle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#008CFF] to-[#0066cc] shadow-sm">
                    <span className="text-white font-bold text-lg">V</span>
                  </div>
                  <div className="flex-1 text-left ml-1">
                    <div className="font-serif text-foreground">Venmo</div>
                    <div className="text-xs text-muted-foreground font-sans">@yourhandle</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gold/60" />
                </a>
              </Button>
            </div>

            <div className="h-px w-20 bg-gold/30 mx-auto mt-4" />
            
            <p className="text-center text-xs text-muted-foreground font-serif italic mt-2">
              Thank you for your generous contribution
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
