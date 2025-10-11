import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ExternalLink } from "lucide-react"

interface RegistryPageProps {
  params: Promise<{ slug: string }>
}

async function getRegistryData(slug: string) {
  const wedding = await prisma.wedding.findUnique({
    where: { slug },
    include: {
      registry: {
        orderBy: { order: "asc" },
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
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Registry
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your presence at our wedding is the greatest gift of all. However, if you wish
            to honor us with a gift, we've registered at the following stores.
          </p>
        </div>

        {wedding.registry.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center py-12">
              <p className="text-muted-foreground mb-4">
                Registry details coming soon!
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later for our registry information.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wedding.registry.map((item) => (
              <Card key={item.id} className="card-hover overflow-hidden">
                {item.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="pt-6">
                  <h3 className="font-serif text-2xl font-bold mb-2">{item.name}</h3>
                  {item.storeName && (
                    <p className="text-sm text-muted-foreground mb-3">{item.storeName}</p>
                  )}
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
        )}

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="pt-8 text-center">
            <p className="text-sm">
              <strong>Cash Gift Alternative:</strong> If you prefer to give a monetary gift,
              we'll provide details closer to the wedding date.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

