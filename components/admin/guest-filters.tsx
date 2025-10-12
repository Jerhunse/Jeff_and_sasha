"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"
import { Tag, Household } from "@prisma/client"
import { useState, useEffect } from "react"

interface GuestFiltersProps {
  tags: (Tag & { _count: { guests: number } })[]
  households: (Household & { _count: { guests: number } })[]
  currentFilters: {
    search?: string
    tag?: string
    rsvpStatus?: string
    household?: string
    isChild?: string
  }
}

export function GuestFilters({ tags, households, currentFilters }: GuestFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentFilters.search || "")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setSearchValue(currentFilters.search || "")
  }, [currentFilters.search])

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to page 1 when filtering
    params.delete("page")
    
    router.push(`/admin/guests?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter("search", searchValue || null)
  }

  const clearAllFilters = () => {
    router.push("/admin/guests")
    setSearchValue("")
  }

  const activeFilterCount = Object.values(currentFilters).filter(v => v && v !== "all").length

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search guests by name, email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button type="button" variant="ghost" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </form>
      </Card>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* RSVP Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="rsvp-filter">RSVP Status</Label>
              <Select
                value={currentFilters.rsvpStatus || "all"}
                onValueChange={(value) => updateFilter("rsvpStatus", value)}
              >
                <SelectTrigger id="rsvp-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ATTENDING">Attending</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                  <SelectItem value="MAYBE">Maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
              <Label htmlFor="tag-filter">Tag</Label>
              <Select
                value={currentFilters.tag || "all"}
                onValueChange={(value) => updateFilter("tag", value)}
              >
                <SelectTrigger id="tag-filter">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name} ({tag._count.guests})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Household Filter */}
            <div className="space-y-2">
              <Label htmlFor="household-filter">Household</Label>
              <Select
                value={currentFilters.household || "all"}
                onValueChange={(value) => updateFilter("household", value)}
              >
                <SelectTrigger id="household-filter">
                  <SelectValue placeholder="All households" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Households</SelectItem>
                  {households.map((household) => (
                    <SelectItem key={household.id} value={household.id}>
                      {household.name} ({household._count.guests})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Guest Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type-filter">Guest Type</Label>
              <Select
                value={currentFilters.isChild || "all"}
                onValueChange={(value) => updateFilter("isChild", value)}
              >
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="true">Children Only</SelectItem>
                  <SelectItem value="false">Adults Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.search && (
            <Badge variant="secondary" className="gap-2">
              Search: {currentFilters.search}
              <button
                onClick={() => {
                  setSearchValue("")
                  updateFilter("search", null)
                }}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.rsvpStatus && currentFilters.rsvpStatus !== "all" && (
            <Badge variant="secondary" className="gap-2">
              RSVP: {currentFilters.rsvpStatus}
              <button
                onClick={() => updateFilter("rsvpStatus", null)}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.tag && (
            <Badge variant="secondary" className="gap-2">
              Tag: {tags.find(t => t.id === currentFilters.tag)?.name}
              <button
                onClick={() => updateFilter("tag", null)}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.household && (
            <Badge variant="secondary" className="gap-2">
              Household: {households.find(h => h.id === currentFilters.household)?.name}
              <button
                onClick={() => updateFilter("household", null)}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.isChild === "true" && (
            <Badge variant="secondary" className="gap-2">
              Type: Children
              <button
                onClick={() => updateFilter("isChild", null)}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

