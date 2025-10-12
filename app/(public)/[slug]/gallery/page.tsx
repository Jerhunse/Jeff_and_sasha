import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Camera } from "lucide-react"

interface GalleryPageProps {
  params: Promise<{ slug: string }>
}

async function getGalleryData(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    include: {
      gallery: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { slug } = await params
  const wedding = await getGalleryData(slug)

  if (!wedding) {
    notFound()
  }

  // Group images by category
  const imagesByCategory = wedding.gallery.reduce((acc, image) => {
    const category = image.category || "All Photos"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(image)
    return acc
  }, {} as Record<string, typeof wedding.gallery>)

  const categories = Object.keys(imagesByCategory)

  return (
    <div className="container py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Our Gallery
          </h1>
          <p className="text-lg text-muted-foreground">
            Moments we've captured along the way
          </p>
        </div>

        {wedding.gallery.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Photos coming soon! Check back after the wedding.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category}>
                {categories.length > 1 && (
                  <div className="mb-6">
                    <Badge variant="outline" className="font-serif text-base px-4 py-2">
                      {category}
                    </Badge>
                  </div>
                )}

                {/* Masonry Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                  {imagesByCategory[category].map((image) => (
                    <div
                      key={image.id}
                      className="break-inside-avoid group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300"
                    >
                      <img
                        src={image.url}
                        alt={image.altText || image.caption || "Gallery image"}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {image.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-sm font-medium">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

