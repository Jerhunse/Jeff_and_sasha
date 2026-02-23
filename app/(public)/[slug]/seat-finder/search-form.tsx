"use client"

import { useState } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { searchGuestSeat, SearchResult } from "./actions"

interface SearchFormProps {
  slug: string
}

export function SearchForm({ slug }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

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
  }

  return (
    <div className="w-full space-y-12">
      <form onSubmit={handleSearch} className="relative group">
        <input
          className="w-full bg-transparent border-0 border-b border-border py-4 px-0 font-heading text-2xl italic focus:ring-0 focus:border-primary placeholder:text-muted-foreground transition-all disabled:opacity-50"
          placeholder="First or Last Name"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSearching}
        />
        <button
          type="submit"
          className="absolute right-0 bottom-4 text-primary hover:scale-110 transition-transform disabled:opacity-50"
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Search className="h-6 w-6" />
          )}
        </button>
      </form>

      {hasSearched && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result ? (
            <div className="pt-12 border-t border-border/50 space-y-10">
              <div className="text-center space-y-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.5em] text-primary font-bold">
                  Assigned Table
                </span>
                <div className="font-cursive text-7xl md:text-8xl text-primary pt-4">
                  {result.table.name}
                </div>
                {result.seatingChart.description && (
                  <p className="font-heading italic text-muted-foreground text-lg">
                    {result.seatingChart.description}
                  </p>
                )}
              </div>

              {result.tablemates.length > 0 && (
                <div className="bg-muted/50 p-8 rounded-lg space-y-6">
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center mb-4">
                    Your Tablemates
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm font-sans text-muted-foreground">
                    {result.tablemates.map((mate, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                        <span>
                          {mate.firstName} {mate.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  className="w-full bg-foreground text-background py-5 px-8 font-sans text-xs uppercase tracking-[0.3em] hover:bg-primary transition-colors flex items-center justify-center gap-3"
                  onClick={() => alert("Floor plan coming soon!")}
                >
                  <MapPin className="h-4 w-4" />
                  View Floor Plan
                </button>
                <button
                  type="button"
                  className="w-full border border-border py-4 font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted transition-colors"
                  onClick={handleReset}
                >
                  Search Different Name
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-12 border-t border-border/50 text-center space-y-4">
              <p className="font-sans text-muted-foreground">
                No seating assignment found
              </p>
              <p className="font-sans text-sm text-muted-foreground/80">
                Please check your spelling or try searching by phone number
              </p>
              <button
                type="button"
                className="mt-6 border border-border py-4 px-8 font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted transition-colors"
                onClick={handleReset}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
