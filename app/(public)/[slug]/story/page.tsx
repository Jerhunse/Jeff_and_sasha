import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"

interface StoryPageProps {
  params: Promise<{ slug: string }>
}

async function getStoryPage(slug: string) {
  const page = await prisma.page.findFirst({
    where: {
      wedding: { slug },
      slug: "our-story",
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
      wedding: true,
    },
  })

  return page
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params
  const page = await getStoryPage(slug)

  if (!page) {
    // Return default story page
    return (
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-center mb-4">
            Our Story
          </h1>
          <p className="text-center text-muted-foreground mb-16">
            The journey of {page?.wedding.partner1Name || "us"}
          </p>

          <div className="space-y-16">
            <Card>
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-3xl font-bold mb-2">How We Met</h2>
                  <p className="text-muted-foreground">Our beginning</p>
                </div>
                <p className="text-lg leading-relaxed">
                  Your love story begins here. Share how you met, what made you fall in love,
                  and the special moments that brought you together.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-3xl font-bold mb-2">The Proposal</h2>
                  <p className="text-muted-foreground">The moment we said yes</p>
                </div>
                <p className="text-lg leading-relaxed">
                  Tell the story of your proposal - the planning, the moment, and the joy
                  that followed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-3xl font-bold mb-2">Looking Forward</h2>
                  <p className="text-muted-foreground">Our future together</p>
                </div>
                <p className="text-lg leading-relaxed">
                  Share your dreams and excitement for the future as you embark on this new
                  chapter together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Render custom sections if they exist
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-center mb-4">
          {page.title}
        </h1>
        
        <div className="space-y-16 mt-12">
          {page.sections.map((section) => {
            const content = JSON.parse(section.content)
            
            return (
              <Card key={section.id}>
                <CardContent className="pt-8">
                  {content.title && (
                    <div className="text-center mb-6">
                      <h2 className="font-serif text-3xl font-bold mb-2">{content.title}</h2>
                      {content.subtitle && (
                        <p className="text-muted-foreground">{content.subtitle}</p>
                      )}
                    </div>
                  )}
                  {content.text && (
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                      {content.text}
                    </p>
                  )}
                  {content.imageUrl && (
                    <div className="mt-6 rounded-lg overflow-hidden">
                      <img
                        src={content.imageUrl}
                        alt={content.imageAlt || ""}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

