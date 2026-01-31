"use client"

import Image from "next/image"

interface DresscodeSectionProps {
  partner1Name?: string
  partner2Name?: string
}

export function DresscodeSection({
  partner1Name = "",
  partner2Name = "",
}: DresscodeSectionProps) {
  const coupleNames =
    partner1Name && partner2Name
      ? `${partner1Name.toUpperCase()} & ${partner2Name.toUpperCase()}`
      : ""

  return (
    <section id="dresscode" className="scroll-mt-20 relative">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="text-center mb-16 md:mb-24">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-gold mb-4 drop-shadow-sm">
            Dress Code
          </h2>
          {coupleNames && (
            <p className="font-sans text-base md:text-xl lg:text-2xl tracking-[0.2em] uppercase text-foreground/90">
              {coupleNames}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-8 md:w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-muted-foreground">
              What to Wear
            </p>
            <div className="h-px w-8 md:w-12 bg-gold" />
          </div>
        </header>

        {/* Dresscode Image with Faded Edges */}
        <div className="relative mx-auto max-w-4xl">
          <div
            className="relative w-full overflow-hidden rounded-lg"
            style={{
              maskImage:
                "radial-gradient(ellipse 90% 85% at center, black 40%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 90% 85% at center, black 40%, transparent 100%)",
            }}
          >
            <Image
              src="/dresscode.png"
              alt="Wedding Dress Code"
              width={1200}
              height={800}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Optional Footer Text */}
        <footer className="mt-16 text-center">
          <p className="font-serif italic text-muted-foreground text-lg max-w-2xl mx-auto">
            We want you to feel comfortable and celebrate with us in style. 
            The dress code is semi-formal to formal attire.
          </p>
        </footer>
      </div>
    </section>
  )
}
