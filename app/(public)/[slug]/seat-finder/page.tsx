import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { SearchForm } from "./search-form"

interface SeatFinderPageProps {
  params: Promise<{ slug: string }>
}

async function getWedding(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      partner1Name: true,
      partner2Name: true,
      weddingDate: true,
      isPublished: true,
      heroImageUrl: true,
      venueName: true,
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export async function generateMetadata({
  params,
}: SeatFinderPageProps): Promise<Metadata> {
  const { slug } = await params
  const wedding = await getWedding(slug)

  if (!wedding) {
    return {
      title: "Wedding Not Found",
    }
  }

  return {
    title: `Find Your Seat | ${wedding.partner1Name} & ${wedding.partner2Name}`,
    description: `Find your table assignment for ${wedding.partner1Name} and ${wedding.partner2Name}'s wedding.`,
  }
}

export default async function SeatFinderPage({ params }: SeatFinderPageProps) {
  const { slug } = await params
  const wedding = await getWedding(slug)

  if (!wedding) {
    notFound()
  }

  const lastName = wedding.partner1Name.split(" ").pop() ?? "Couple"

  return (
    <div className="flex min-h-[80dvh] sm:min-h-[80vh] w-full -mt-4 overflow-x-hidden">
      {/* Hero Image Section - Desktop Only */}
      <aside className="hidden lg:block lg:w-1/2 relative min-h-[60vh] overflow-hidden rounded-lg shrink-0">
        <img
          alt={`${wedding.partner1Name} & ${wedding.partner2Name}`}
          className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-[3000ms]"
          src={
            wedding.heroImageUrl ||
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=1600&fit=crop"
          }
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-12 left-12 text-white z-10">
          <p className="font-sans text-xs tracking-[0.4em] uppercase opacity-80 mb-2">
            Celebrating Love
          </p>
          <h2 className="font-heading text-4xl italic">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h2>
        </div>
      </aside>

      {/* Main Content Section */}
      <main className="w-full min-w-0 lg:w-1/2 flex flex-col bg-card overflow-y-auto overflow-x-hidden relative rounded-lg border border-border/50">
        {/* Header */}
        <header className="p-4 sm:p-6 md:p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-leaf">flare</span>
            <span className="font-display tracking-widest uppercase text-xs text-charcoal">
              The {lastName}s
            </span>
          </div>
          <a
            className="text-xs uppercase tracking-widest text-charcoal/60 hover:text-gold-leaf transition-colors"
            href={`/${wedding.slug}`}
          >
            Back to home
          </a>
        </header>

        {/* Content Area - Will contain search form */}
        <div className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 sm:px-6 md:px-20 py-6 sm:py-8 md:py-12 min-h-0">
          <div className="w-full max-w-md space-y-8 sm:space-y-12">
            <div className="space-y-3 sm:space-y-4 text-center">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-charcoal">
                Find Your Seat
              </h1>
              <p className="font-sans text-xs sm:text-sm text-charcoal/50 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                Enter your name or phone number to view your table
              </p>
            </div>
            <SearchForm slug={wedding.slug} />
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 sm:p-6 md:p-8 text-center shrink-0">
          <p className="font-display italic text-charcoal/30 text-sm">
            {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            • {wedding.venueName || "The Estate"}
          </p>
        </footer>
      </main>
    </div>
  )
}
