"use client"

import { X } from "lucide-react"

interface FloorPlanModalProps {
  isOpen: boolean
  onClose: () => void
  tableName: string
}

export function FloorPlanModal({ isOpen, onClose, tableName }: FloorPlanModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-charcoal/90 z-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-4xl w-full max-h-[80vh] relative p-12 overflow-hidden rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-charcoal hover:text-gold-leaf transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="h-full flex flex-col">
          <h3 className="font-display text-2xl mb-8 text-charcoal">Reception Floor Plan</h3>
          
          <div className="flex-1 bg-ivory border border-charcoal/5 relative flex items-center justify-center">
            <div className="text-center space-y-6 p-12">
              <div className="text-6xl mb-4">🗺️</div>
              <h4 className="font-display text-3xl text-charcoal mb-4">Floor Plan Coming Soon</h4>
              <p className="font-sans text-charcoal/60 max-w-md mx-auto">
                We're preparing the venue floor plan. Your assigned table is <span className="font-script text-2xl text-gold-leaf">{tableName}</span>
              </p>
              <p className="font-sans text-sm text-charcoal/40 mt-8">
                Check back soon or ask venue staff for assistance on the day of the event.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
