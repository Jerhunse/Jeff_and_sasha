"use client"

export default function SeatFinderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-card p-8">
      <div className="text-center space-y-6">
        <h1 className="font-heading text-3xl text-foreground">
          Something went wrong
        </h1>
        <p className="font-sans text-muted-foreground">
          We couldn’t load the seat finder. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-foreground text-background py-3 px-8 font-sans text-xs uppercase tracking-wider hover:bg-primary transition-colors rounded-md"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
