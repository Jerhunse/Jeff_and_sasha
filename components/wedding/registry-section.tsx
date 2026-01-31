import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ExternalLink, DollarSign, Heart } from "lucide-react"
import Link from "next/link"

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
                      webkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
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

        {/* Registry Items Section */}
        {registryLinks.length > 0 && (
          <div className="mb-8">
            <div className="h-px w-32 bg-gold/30 mx-auto mb-12" />
            <div className="text-center mb-8">
              <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-gold mb-2 drop-shadow-sm">Gift Registries</h2>
              <p className="font-serif italic text-sm md:text-base text-muted-foreground">
                Browse our registry at these retailers
              </p>
            </div>
          </div>
        )}

        {registryLinks.length === 0 && cashFunds.length === 0 ? (
          <Card 
            className="rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              webkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
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
        ) : registryLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {registryLinks.map((item) => (
              <Card 
                key={item.id} 
                className="card-hover overflow-hidden rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                  webkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
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
          </div>
        ) : null}

        {cashFunds.length === 0 && registryLinks.length > 0 && (
          <Card 
            className="mt-12 bg-primary/5 border-primary/20"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              webkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <CardContent className="pt-8 text-center">
              <p className="text-sm font-serif text-muted-foreground">
                <strong>Cash Gift Alternative:</strong> If you prefer to give a monetary gift,
                we&rsquo;ll provide details closer to the wedding date.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
