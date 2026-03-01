import { Suspense } from "react"
import { DownloadPageContent } from "./download-content"
import { Loader2 } from "lucide-react"

export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="photobooth-page flex items-center justify-center" style={{ minHeight: '100dvh' }}>
          <Loader2 className="w-12 h-12 animate-spin text-[var(--pb-champagne)]" />
        </div>
      }
    >
      <DownloadPageContent />
    </Suspense>
  )
}
