"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [activeDialog, setActiveDialog] = useState<"amazon" | "cashfund" | null>(null)

  return (
    <section id="registry" className="scroll-mt-20 relative bg-[#FDFCF9]">
      {/* Hero image */}
      <div className="w-full h-[60vh] relative overflow-hidden">
        <img
          alt="Romantic candid of the couple"
          className="absolute inset-0 w-full h-full object-cover"
          src="/registry-hero-image.png"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className="max-w-4xl w-full mx-auto px-6 py-20 text-center">
        {/* Monogram */}
        <div className="mb-10 mx-auto border border-[#B4975A]/30 rounded-full w-20 h-20 flex items-center justify-center">
          <span className="font-heading text-3xl text-[#B4975A] italic">J&amp;S</span>
        </div>

        {/* Heading */}
        <h2 className="font-heading text-5xl lg:text-6xl mb-12 text-zinc-800 font-light tracking-wider">
          Registry
        </h2>

        {/* Description */}
        <div className="max-w-2xl mx-auto mb-16 space-y-8">
          <p className="font-serif text-2xl italic text-zinc-700 leading-relaxed">
            Your presence at our wedding is the greatest gift we could ask for.
            However, if you would like to honor us with a gift, we have
            registered at the following places.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-20">
          <button
            onClick={() => setActiveDialog("amazon")}
            className="min-w-[240px] px-12 py-4 border border-[#B4975A] text-[#B4975A] font-heading text-xl tracking-widest hover:bg-[#B4975A] hover:text-white transition-all duration-500 uppercase"
          >
            Amazon
          </button>
          <button
            onClick={() => setActiveDialog("cashfund")}
            className="min-w-[240px] px-12 py-4 border border-[#B4975A] text-[#B4975A] font-heading text-xl tracking-widest hover:bg-[#B4975A] hover:text-white transition-all duration-500 uppercase"
          >
            Cash Fund
          </button>
        </div>
      </div>

      {/* Amazon Dialog */}
      <Dialog open={activeDialog === "amazon"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-lg bg-[#FDFCF9] border border-[#B4975A]/20">
          <DialogHeader>
            <DialogTitle className="font-heading text-3xl text-center text-zinc-800 mb-2">
              Amazon Registry
            </DialogTitle>
            <DialogDescription className="text-center font-serif italic text-lg text-zinc-600 leading-relaxed pt-4">
              Help us make our house a home, thank you
            </DialogDescription>
          </DialogHeader>

          <div className="h-px w-20 bg-[#B4975A]/30 mx-auto my-6" />

          <div className="text-center pb-2">
            {registryLinks.length > 0 ? (
              <a
                href={registryLinks[0]?.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block min-w-[200px] px-10 py-3 border border-[#B4975A] text-[#B4975A] font-heading text-lg tracking-widest hover:bg-[#B4975A] hover:text-white transition-all duration-500 uppercase"
              >
                View Registry
              </a>
            ) : (
              <p className="font-serif italic text-zinc-500 text-sm">
                Registry details coming soon!
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash Fund Dialog */}
      <Dialog open={activeDialog === "cashfund"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-lg bg-[#FDFCF9] border border-[#B4975A]/20">
          <DialogHeader>
            <DialogTitle className="font-heading text-3xl text-center text-zinc-800 mb-2">
              Cash Fund
            </DialogTitle>
            <DialogDescription className="text-center font-serif italic text-lg text-zinc-600 leading-relaxed pt-4">
              We&rsquo;ve got the love, the home, and the toaster. If you&rsquo;re feeling generous, a gift toward our next chapter would mean so much to us
            </DialogDescription>
          </DialogHeader>

          <div className="h-px w-20 bg-[#B4975A]/30 mx-auto my-6" />

          <div className="space-y-3 py-2">
            {/* Zelle */}
            <button
              onClick={() => {
                navigator.clipboard.writeText("4049809690")
                alert("Zelle phone number copied to clipboard!")
              }}
              className="flex items-center w-full h-16 px-4 border border-zinc-200 hover:border-[#B4975A]/40 hover:bg-[#B4975A]/5 transition-all duration-200 rounded-md text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#6D1ED4] to-[#4a1591] shadow-sm">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div className="flex-1 text-left ml-4">
                <div className="font-serif text-zinc-800">Zelle</div>
                <div className="text-xs text-zinc-500">(404) 980-9690</div>
              </div>
              <div className="text-xs text-[#B4975A]/70 font-serif italic">Tap to copy</div>
            </button>

            {/* Cash App */}
            <a
              href="https://cash.app/$Jerhunse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full h-16 px-4 border border-zinc-200 hover:border-[#B4975A]/40 hover:bg-[#B4975A]/5 transition-all duration-200 rounded-md"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#00D64B] to-[#00a83a] shadow-sm">
                <span className="text-white font-bold text-xl">$</span>
              </div>
              <div className="flex-1 text-left ml-4">
                <div className="font-serif text-zinc-800">Cash App</div>
                <div className="text-xs text-zinc-500">$Jerhunse</div>
              </div>
            </a>

            {/* Venmo */}
            <a
              href="https://venmo.com/u/Jeffery-Erhunse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full h-16 px-4 border border-zinc-200 hover:border-[#B4975A]/40 hover:bg-[#B4975A]/5 transition-all duration-200 rounded-md"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#008CFF] to-[#0066cc] shadow-sm">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div className="flex-1 text-left ml-4">
                <div className="font-serif text-zinc-800">Venmo</div>
                <div className="text-xs text-zinc-500">@Jeffery-Erhunse</div>
              </div>
            </a>
          </div>

          <div className="h-px w-20 bg-[#B4975A]/30 mx-auto mt-4" />

          <p className="text-center text-xs text-zinc-500 font-serif italic mt-2">
            Thank you for your generous contribution
          </p>
        </DialogContent>
      </Dialog>
    </section>
  )
}
