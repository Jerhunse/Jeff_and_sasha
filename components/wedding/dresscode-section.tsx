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
  return (
    <section id="dresscode" className="scroll-mt-20 relative bg-[#fdfcf9]">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="font-serif text-5xl md:text-7xl mb-6">Attire Guide</h1>
          <div className="h-px w-48 mx-auto mb-6 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent" />
          <p className="font-serif italic text-xl text-gray-600">Formal & Semi-Formal</p>
        </div>

        {/* Editorial Grid - Formal Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-32">
          {/* Large Image Left */}
          <div className="lg:col-span-7 aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
            <Image
              src="/dress-code-1.jpg"
              alt="Woman in a floor-length emerald green satin evening gown"
              width={800}
              height={1000}
              className="w-full h-full object-cover object-bottom grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
            />
          </div>

          {/* Text Content Right */}
          <div className="lg:col-span-5 flex flex-col justify-center p-8 lg:p-12 bg-white/50 backdrop-blur-sm border border-[#c5a059]/10">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold mb-4">
              The Standard
            </span>
            <h2 className="font-serif text-3xl mb-6 leading-tight">Formal Attire</h2>
            <p className="font-serif text-lg leading-relaxed text-gray-700 mb-8">
              For our formal evening, we invite ladies to wear floor-length gowns or very dressy
              cocktail suits. Gentlemen are encouraged to wear a dark suit and tie or a classic
              tuxedo. Think timeless elegance with a modern edge.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-[#c5a059]" />
              <span className="font-serif italic">Refinement is key.</span>
            </div>
          </div>

          {/* Text Content Left */}
          <div className="lg:col-span-5 order-last lg:order-none flex flex-col justify-center p-8 lg:p-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold mb-4">
              The Nuance
            </span>
            <h2 className="font-serif text-3xl mb-6 leading-tight">Semi-Formal Options</h2>
            <p className="font-serif text-lg leading-relaxed text-gray-700 mb-8">
              As the celebration continues, comfort meets style. Elegant midi dresses, tailored
              trousers, and refined separates are perfect for a semi-formal touch. We encourage
              velvets, silks, and structured silhouettes that move beautifully.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square relative overflow-hidden rounded shadow-md">
                <Image
                  src="/dress-code-2.jpg"
                  alt="Elegant attire detail"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="aspect-square relative overflow-hidden rounded shadow-md">
                <Image
                  src="/dress-code-3.png"
                  alt="Formal attire detail"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Large Image Right */}
          <div className="lg:col-span-7 aspect-[3/4] overflow-hidden rounded-sm shadow-2xl">
            <Image
              src="/dress-code-4.jpg"
              alt="Man in a sharp classic black tuxedo with bow tie"
              width={800}
              height={1067}
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Palette Guide */}
        <section className="mb-32">
          <div className="flex items-center gap-8 mb-16">
            <div className="flex-1 h-[1px] bg-[#c5a059]/30" />
            <h3 className="font-serif text-2xl tracking-widest uppercase text-center">
              Palette Guide
            </h3>
            <div className="flex-1 h-[1px] bg-[#c5a059]/30" />
          </div>

          <div className="flex flex-wrap justify-center gap-12 lg:gap-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#c5a059] shadow-inner border-4 border-white" />
              <span className="text-xs uppercase tracking-widest font-bold">Gold</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#5a1010] shadow-inner border-4 border-white" />
              <span className="text-xs uppercase tracking-widest font-bold">Burgundy</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#1a2a44] shadow-inner border-4 border-white" />
              <span className="text-xs uppercase tracking-widest font-bold">Navy</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#000000] shadow-inner border-4 border-white" />
              <span className="text-xs uppercase tracking-widest font-bold">Black</span>
            </div>
          </div>

          <p className="text-center mt-12 font-serif italic text-gray-500 max-w-xl mx-auto">
            Guests are invited, but not required, to coordinate their attire with our wedding
            palette for a cohesive aesthetic.
          </p>
        </section>

        {/* Bottom Image Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="relative group overflow-hidden aspect-[2/3]">
            <Image
              src="/dress-code-5.jpg"
              alt="Elegant formal attire"
              width={400}
              height={600}
              className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-110"
            />
          </div>

          <div className="relative group overflow-hidden aspect-[2/3]">
            <Image
              src="/dress-code-6.jpg"
              alt="Sophisticated evening wear"
              width={400}
              height={600}
              className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-110"
            />
          </div>

          <div className="relative group overflow-hidden aspect-[2/3]">
            <Image
              src="/dress-code-7.png"
              alt="Classic formal style"
              width={400}
              height={600}
              className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-110"
            />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white py-20 border-t border-[#c5a059]/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="h-px w-24 mx-auto mb-10 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent" />
          <p className="font-serif text-2xl mb-4">Questions regarding the code?</p>
          <p className="text-gray-500 mb-8">We are happy to help you find the perfect look.</p>
          <a
            className="inline-block px-10 py-4 bg-[#c5a059] text-white font-bold tracking-widest uppercase text-xs hover:bg-opacity-90 transition-all rounded-sm"
            href="#contact"
          >
            Contact Us
          </a>
          <div className="mt-20 flex justify-center gap-8 text-[#c5a059]/40">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 8h10M7 12h10M7 16h10M3 4h18v16H3z" stroke="currentColor" fill="none" />
            </svg>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
        </div>
      </footer>
    </section>
  )
}
