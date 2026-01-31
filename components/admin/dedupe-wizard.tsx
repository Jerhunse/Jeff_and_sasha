"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Merge,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import type { DuplicateMatch, MergeStrategy } from "@/lib/dedupe-algorithm"

export function DedupeWizard() {
  const [loading, setLoading] = useState(true)
  const [merging, setMerging] = useState(false)
  const [matches, setMatches] = useState<DuplicateMatch[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confidence, setConfidence] = useState("medium")
  const [stats, setStats] = useState({ high: 0, medium: 0, low: 0 })

  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>({
    firstName: "guest1",
    lastName: "guest1",
    email: "guest1",
    phone: "guest1",
    address: "guest1",
    household: "guest1",
    tags: "merge",
    rsvpResponses: "merge",
    invitations: "merge",
  })

  useEffect(() => {
    fetchDuplicates()
  }, [confidence])

  const fetchDuplicates = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/guests/dedupe/find?confidence=${confidence}`
      )
      if (!response.ok) throw new Error("Failed to fetch duplicates")

      const data = await response.json()
      setMatches(data.matches)
      setStats(data.byConfidence)
      setCurrentIndex(0)
    } catch (error) {
      console.error("Fetch duplicates error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMerge = async (keepGuestId: "guest1" | "guest2") => {
    const currentMatch = matches[currentIndex]
    if (!currentMatch) return

    setMerging(true)

    try {
      const response = await fetch("/api/admin/guests/dedupe/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest1Id: currentMatch.guest1.id,
          guest2Id: currentMatch.guest2.id,
          strategy: mergeStrategy,
          keepGuestId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to merge guests")
      }

      // Move to next match
      const newMatches = matches.filter((_, i) => i !== currentIndex)
      setMatches(newMatches)

      if (currentIndex >= newMatches.length) {
        setCurrentIndex(Math.max(0, newMatches.length - 1))
      }

      // Reset strategy for next pair
      setMergeStrategy({
        firstName: "guest1",
        lastName: "guest1",
        email: "guest1",
        phone: "guest1",
        address: "guest1",
        household: "guest1",
        tags: "merge",
        rsvpResponses: "merge",
        invitations: "merge",
      })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setMerging(false)
    }
  }

  const handleSkip = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const currentMatch = matches[currentIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Dedupe Wizard</h2>
          <p className="text-muted-foreground">
            {matches.length} potential duplicate
            {matches.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Select value={confidence} onValueChange={setConfidence}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              High Confidence Only ({stats.high})
            </SelectItem>
            <SelectItem value="medium">
              Medium & High ({stats.high + stats.medium})
            </SelectItem>
            <SelectItem value="all">
              All Matches ({stats.high + stats.medium + stats.low})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-white" />
              <h3 className="text-lg font-semibold mb-2">No Duplicates Found!</h3>
              <p className="text-muted-foreground">
                Your guest list looks clean at this confidence level.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Match {currentIndex + 1} of {matches.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentIndex(Math.min(matches.length - 1, currentIndex + 1))
                    }
                    disabled={currentIndex === matches.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentIndex + 1) / matches.length) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {currentMatch && (
            <>
              {/* Match Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Potential Duplicate</CardTitle>
                    <Badge
                      variant={
                        currentMatch.confidence === "high"
                          ? "destructive"
                          : currentMatch.confidence === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {currentMatch.confidence.toUpperCase()} Confidence (
                      {currentMatch.score})
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.matchReasons.map((reason, i) => (
                      <Badge key={i} variant="outline">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Guest 1 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Guest 1</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">
                        {currentMatch.guest1.firstName} {currentMatch.guest1.lastName}
                      </p>
                    </div>
                    {currentMatch.guest1.email && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p>{currentMatch.guest1.email}</p>
                      </div>
                    )}
                    {currentMatch.guest1.phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p>{currentMatch.guest1.phone}</p>
                      </div>
                    )}
                    {/* Address display removed - address is stored in Address model, not directly on Guest */}
                  </CardContent>
                </Card>

                {/* Guest 2 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Guest 2</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">
                        {currentMatch.guest2.firstName} {currentMatch.guest2.lastName}
                      </p>
                    </div>
                    {currentMatch.guest2.email && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p>{currentMatch.guest2.email}</p>
                      </div>
                    )}
                    {currentMatch.guest2.phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p>{currentMatch.guest2.phone}</p>
                      </div>
                    )}
                    {/* Address display removed - address is stored in Address model, not directly on Guest */}
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Merge Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Choose which guest to keep and select data from each:
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleMerge("guest1")}
                      disabled={merging}
                      variant="default"
                      className="h-auto py-6 flex-col"
                    >
                      {merging ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Merge className="h-5 w-5 mb-2" />
                          <span>Keep Guest 1</span>
                          <span className="text-xs font-normal mt-1">
                            Delete Guest 2
                          </span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleMerge("guest2")}
                      disabled={merging}
                      variant="default"
                      className="h-auto py-6 flex-col"
                    >
                      {merging ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Merge className="h-5 w-5 mb-2" />
                          <span>Keep Guest 2</span>
                          <span className="text-xs font-normal mt-1">
                            Delete Guest 1
                          </span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      className="w-full"
                      disabled={merging}
                    >
                      Skip This Pair
                    </Button>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium mb-1">Merge Strategy</p>
                      <p>
                        By default, we'll keep the selected guest's info and merge
                        tags, RSVP responses, and invitations from both.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}

