import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle } from "lucide-react"

interface FaqPageProps {
  params: Promise<{ slug: string }>
}

async function getFaqData(slug: string) {
  const wedding = await prisma.wedding.findUnique({
    where: { slug },
    include: {
      faqs: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { slug } = await params
  const wedding = await getFaqData(slug)

  if (!wedding) {
    notFound()
  }

  // Group FAQs by category
  const faqsByCategory = wedding.faqs.reduce((acc, faq) => {
    const category = faq.category || "General"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(faq)
    return acc
  }, {} as Record<string, typeof wedding.faqs>)

  const categories = Object.keys(faqsByCategory)

  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about our special day
          </p>
        </div>

        {wedding.faqs.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center py-12">
              <p className="text-muted-foreground">
                Have a question? Reach out to us and we'll get back to you soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                {categories.length > 1 && (
                  <div className="mb-4">
                    <Badge variant="outline" className="font-serif text-sm">
                      {category}
                    </Badge>
                  </div>
                )}
                <div className="space-y-4">
                  {faqsByCategory[category].map((faq) => (
                    <Card key={faq.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="font-serif text-xl flex items-start gap-3">
                          <span className="text-primary mt-1">Q:</span>
                          <span>{faq.question}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-3">
                          <span className="text-primary font-semibold mt-1">A:</span>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Card className="mt-12 bg-muted/50">
          <CardContent className="pt-8 text-center">
            <p className="font-medium mb-2">Still have questions?</p>
            <p className="text-sm text-muted-foreground">
              Feel free to reach out to us directly. We're happy to help!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

