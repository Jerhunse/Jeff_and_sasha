"use client"

import { useState } from "react"
import { searchGuestSeat, SearchResult } from "./actions"
import { FloorPlanModal } from "./floor-plan-modal"

interface SearchFormProps {
  slug: string
}

export function SearchForm({ slug }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFloorPlan, setShowFloorPlan] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    if (!searchQuery.trim()) {
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const data = await searchGuestSeat(slug, searchQuery)
      setResult(data)
    } catch (error) {
      console.error("Search error:", error)
      setResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  function handleReset() {
    setSearchQuery("")
    setResult(null)
    setHasSearched(false)
    setShowFloorPlan(false)
  }

  return (
    <>
      <div className="w-full space-y-8 sm:space-y-12">
        <form onSubmit={handleSearch} className="relative group">
          <input
            className="w-full bg-transparent border-0 border-b border-charcoal/10 py-3 sm:py-4 px-0 font-display text-lg sm:text-xl md:text-2xl italic focus:ring-0 focus:border-gold-leaf placeholder:text-charcoal/20 transition-all disabled:opacity-50"
            placeholder="First name, last name, or phone number"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearching}
          />
          <button
            type="submit"
            className="absolute right-0 bottom-3 sm:bottom-4 p-2 -mr-2 text-gold-leaf hover:scale-110 transition-transform disabled:opacity-50 touch-manipulation"
            disabled={isSearching}
          >
            <span className="material-symbols-outlined">
              {isSearching ? "progress_activity" : "search"}
            </span>
          </button>
        </form>

        {hasSearched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result ? (
              <div className="pt-8 sm:pt-12 border-t border-charcoal/5 space-y-6 sm:space-y-10">
                <div className="text-center space-y-2">
                  <span className="font-sans text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-gold-leaf font-bold">
                    Assigned Table
                  </span>
                  <div className="font-script text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gold-leaf pt-3 sm:pt-4 break-words">
                    {result.table.name}
                  </div>
                  {result.seatingChart.description && (
                    <p className="font-display italic text-charcoal/60 text-lg">
                      {result.seatingChart.description}
                    </p>
                  )}
                </div>

                {result.tablemates.length > 0 && (
                  <div className="bg-ivory/50 p-4 sm:p-6 md:p-8 rounded-sm space-y-4 sm:space-y-6">
                    <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] text-charcoal/40 text-center mb-3 sm:mb-4">
                      Your Tablemates
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 sm:gap-x-8 text-sm font-sans text-charcoal/70">
                      {result.tablemates.map((mate, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gold-leaf rounded-full" />
                          <span>
                            {mate.firstName} {mate.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:gap-4">
                  <button
                    type="button"
                    className="w-full min-h-[44px] bg-charcoal text-white py-4 sm:py-5 px-6 sm:px-8 font-sans text-xs uppercase tracking-[0.3em] hover:bg-gold-leaf transition-colors flex items-center justify-center gap-3 touch-manipulation"
                    onClick={() => setShowFloorPlan(true)}
                  >
                    <span className="material-symbols-outlined text-sm">map</span>
                    View Floor Plan
                  </button>
                  <button
                    type="button"
                    className="w-full min-h-[44px] border border-charcoal/10 py-4 font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hover:bg-ivory transition-colors touch-manipulation"
                    onClick={handleReset}
                  >
                    Search Different Name
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-8 sm:pt-12 border-t border-charcoal/5 text-center space-y-4">
                <p className="font-sans text-charcoal/60">
                  No seating assignment found
                </p>
                <p className="font-sans text-sm text-charcoal/40">
                  Please check your spelling or try searching by phone number
                </p>
                <button
                  type="button"
                  className="mt-6 min-h-[44px] border border-charcoal/10 py-4 px-6 sm:px-8 font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hover:bg-ivory transition-colors touch-manipulation"
                  onClick={handleReset}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {result && (
        <FloorPlanModal
          isOpen={showFloorPlan}
          onClose={() => setShowFloorPlan(false)}
          tableName={result.table.name}
        />
      )}
    </>
  )
}
