import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle } from "lucide-react"

interface Faq {
  id: string
  question: string
  answer: string
  category: string | null
  order: number
}

interface FaqSectionProps {
  faqs: Faq[]
}

export function FaqSection({ faqs }: FaqSectionProps) {
  // Group FAQs by category
  const faqsByCategory = faqs.reduce((acc, faq) => {
    const category = faq.category || "General"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(faq)
    return acc
  }, {} as Record<string, typeof faqs>)

  const categories = Object.keys(faqsByCategory)

  return (
    <section id="faq" className="scroll-mt-20 relative">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header — matches timeline section */}
        <header className="text-center mb-16 md:mb-24">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-gold mb-4 drop-shadow-sm">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-base md:text-xl lg:text-2xl tracking-[0.2em] uppercase text-foreground/90">
            Everything You Need To Know
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-8 md:w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-muted-foreground">
              About our special day
            </p>
            <div className="h-px w-8 md:w-12 bg-gold" />
          </div>
        </header>

        {faqs.length === 0 ? (
          <Card 
            className="rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              webkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <CardContent className="pt-8 text-center py-12">
              <p className="font-serif italic text-muted-foreground">
                Have a question? Reach out to us and we&rsquo;ll get back to you soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                {categories.length > 1 && (
                  <div className="mb-4">
                    <Badge variant="outline" className="font-sans text-sm tracking-wider">
                      {category}
                    </Badge>
                  </div>
                )}
                <div className="space-y-4">
                  {faqsByCategory[category].map((faq) => (
                    <Card 
                      key={faq.id} 
                      className="card-hover rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
                      style={{
                        maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                        webkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="font-serif text-base md:text-lg lg:text-xl text-foreground flex items-start gap-2 md:gap-3">
                          <span className="text-gold mt-1 font-sans text-sm md:text-base">Q:</span>
                          <span className="flex-1">{faq.question}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-2 md:gap-3">
                          <span className="text-gold font-semibold mt-1 font-sans text-sm md:text-base">A:</span>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base flex-1">
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

        <Card 
          className="mt-12 bg-muted/50 border-border/50"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
            webkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <CardContent className="pt-8 text-center">
            <p className="font-medium mb-2">Still have questions?</p>
            <p className="text-sm font-serif italic text-muted-foreground">
              Feel free to reach out to us directly. We&rsquo;re happy to help!
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
