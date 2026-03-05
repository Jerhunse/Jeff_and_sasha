"use client"

import Image from "next/image"
import { X } from "lucide-react"

interface FloorPlanModalProps {
  isOpen: boolean
  onClose: () => void
  tableName: string
}

export function FloorPlanModal({ isOpen, onClose, tableName }: FloorPlanModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-charcoal/90 z-50 flex items-center justify-center p-4 sm:p-6 overscroll-contain">
      <div className="bg-white max-w-4xl w-full max-h-[85dvh] sm:max-h-[80vh] relative p-4 sm:p-8 md:p-12 overflow-y-auto overflow-x-hidden rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 -m-2 text-charcoal hover:text-gold-leaf transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <div className="h-full flex flex-col min-h-0">
          <h3 className="font-display text-xl sm:text-2xl mb-4 sm:mb-6 text-charcoal pr-10">Reception Floor Plan</h3>
          <p className="font-sans text-sm text-charcoal/60 mb-4">
            Your assigned table: <span className="font-script text-lg text-gold-leaf">{tableName}</span>
          </p>
          
          <div className="flex-1 relative min-h-[200px] bg-ivory border border-charcoal/5 rounded overflow-hidden">
            <Image
              src="/floor-plan.png"
              alt="Reception floor plan showing head table, dance floor, DJ setup, and guest tables"
              width={1024}
              height={1024}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
