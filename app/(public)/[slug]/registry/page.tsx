import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PaperCard } from "@/components/ui/paper-card"
import { FloralDivider } from "@/components/wedding"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ExternalLink, DollarSign, Heart } from "lucide-react"
import Link from "next/link"

interface RegistryPageProps {
  params: Promise<{ slug: string }>
}

async function getRegistryData(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    include: {
      registryLinks: {
        orderBy: { order: "asc" },
      },
      cashFunds: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export default async function RegistryPage({ params }: RegistryPageProps) {
  const { slug } = await params
  const wedding = await getRegistryData(slug)

  if (!wedding) {
    notFound()
  }

  return (
    <PaperCard>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Gift className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-cursive text-5xl md:text-6xl text-gold mb-4">
            Registry
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your presence at our wedding is the greatest gift of all. However, if you wish
            to honor us with a gift, we&rsquo;ve registered at the following stores.
          </p>
        </div>

        <FloralDivider />

        {/* Cash Funds Section */}
        {wedding.cashFunds.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="font-cursive text-3xl text-gold mb-2">Cash Funds</h2>
              <p className="text-muted-foreground">
                Help us create unforgettable memories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {wedding.cashFunds.map((fund) => {
                const progressPercentage = fund.goal
                  ? Math.min((fund.received / fund.goal) * 100, 100)
                  : 0

                return (
                  <Card key={fund.id} className="card-hover overflow-hidden border-border/50 bg-card/50">
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
                          <h3 className="font-cursive text-2xl text-gold mb-1">
                            {fund.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                          <Heart className="h-6 w-6 text-gold" />
                        </div>
                      </div>

                      {fund.description && (
                        <p className="text-sm mb-4">{fund.description}</p>
                      )}

                      {fund.goal && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
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

                      <Button asChild className="w-full">
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
        {wedding.registryLinks.length > 0 && (
          <div className="mb-8">
            <FloralDivider />
            <div className="text-center mb-8">
              <h2 className="font-cursive text-3xl text-gold mb-2">Gift Registries</h2>
              <p className="text-muted-foreground">
                Browse our registry at these retailers
              </p>
            </div>
          </div>
        )}

        {wedding.registryLinks.length === 0 && wedding.cashFunds.length === 0 ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-8 text-center py-12">
              <p className="text-muted-foreground mb-4">
                Registry details coming soon!
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later for our registry information.
              </p>
            </CardContent>
          </Card>
        ) : wedding.registryLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wedding.registryLinks.map((item) => (
              <Card key={item.id} className="card-hover overflow-hidden border-border/50 bg-card/50">
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
                  <h3 className="font-cursive text-2xl text-gold mb-2">{item.label}</h3>
                  {item.description && (
                    <p className="text-sm mb-4">{item.description}</p>
                  )}
                  <Button asChild className="w-full">
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

        {wedding.cashFunds.length === 0 && wedding.registryLinks.length > 0 && (
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="pt-8 text-center">
              <p className="text-sm">
                <strong>Cash Gift Alternative:</strong> If you prefer to give a monetary gift,
                we&rsquo;ll provide details closer to the wedding date.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PaperCard>
  )
}

