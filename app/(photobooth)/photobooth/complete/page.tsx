"use client"

import { Suspense } from "react"
import { CompletePageContent } from "./complete-content"
import { Loader2 } from "lucide-react"

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <div className="photobooth-page min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--pb-champagne)]" />
        </div>
      }
    >
      <CompletePageContent />
    </Suspense>
  )
}
