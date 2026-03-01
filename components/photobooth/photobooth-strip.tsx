"use client"

interface PhotoboothStripProps {
  photos: Array<{ url: string; order: number }>
}

export function PhotoboothStrip({ photos }: PhotoboothStripProps) {
  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order)

  return (
    <div className="relative bg-white p-6 rounded-2xl shadow-2xl max-w-md mx-auto">
      <div className="text-center mb-4 pb-4 border-b-2 border-[var(--pb-champagne)]">
        <h3 className="text-2xl photobooth-header-font text-[var(--pb-espresso)] italic">
          Lumina Booth
        </h3>
        <p className="text-xs text-[var(--pb-mocha)] uppercase tracking-wider mt-1">
          {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-4">
        {sortedPhotos.map((photo) => (
          <div
            key={photo.order}
            className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-4 border-white shadow-md"
          >
            <img
              src={photo.url}
              alt={`Photo ${photo.order}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t-2 border-[var(--pb-champagne)] text-center">
        <p className="text-xs text-[var(--pb-mocha)] photobooth-script text-lg">
          Memories to cherish forever
        </p>
      </div>

      <div className="absolute -inset-2 border-8 border-white rounded-3xl -z-10" />
      <div className="absolute -inset-3 bg-gradient-to-br from-[var(--pb-champagne)] to-[var(--pb-mocha)]/20 rounded-3xl -z-20" />
    </div>
  )
}
