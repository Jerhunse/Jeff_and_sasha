import { Badge } from "@/components/ui/badge"

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
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-black mb-4 drop-shadow-sm">
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
          <div className="text-center py-12">
            <p className="font-serif italic text-muted-foreground">
              Have a question? Reach out to us and we&rsquo;ll get back to you soon!
            </p>
          </div>
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
                <div className="space-y-6">
                  {faqsByCategory[category].map((faq) => (
                    <div key={faq.id} className="space-y-2">
                      <div className="font-serif text-base md:text-lg lg:text-xl flex items-start gap-2 md:gap-3">
                        <span className="text-gold mt-1 font-sans text-sm md:text-base">Q:</span>
                        <span className="flex-1" style={{ color: '#8b1a1a' }}>{faq.question}</span>
                      </div>
                      <div className="flex items-start gap-2 md:gap-3">
                        <span className="text-gold font-semibold mt-1 font-sans text-sm md:text-base">A:</span>
                        <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base flex-1" style={{ color: '#2d3e1f' }}>
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="font-medium mb-2">Still have questions?</p>
          <p className="text-sm font-serif italic text-muted-foreground">
            Feel free to reach out to us directly. We&rsquo;re happy to help!
          </p>
        </div>
      </div>
    </section>
  )
}
