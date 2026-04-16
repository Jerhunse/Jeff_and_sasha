import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SiteHeader } from "@/components/wedding/site-header"
import { FloralDivider } from "@/components/wedding"
import { Metadata } from "next"

interface WeddingLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

async function getWedding(slug: string) {
  let wedding = null
  try {
    wedding = await prisma.couple.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        partner1Name: true,
        partner2Name: true,
        weddingDate: true,
        isPublished: true,
        primaryColor: true,
        secondaryColor: true,
        heroImageUrl: true,
        venueName: true,
        venueCity: true,
        venueState: true,
      },
    })
  } catch (error) {
    console.error("[WeddingLayout] Failed to load wedding data", { slug, error })
    return null
  }

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const wedding = await getWedding(slug)

  if (!wedding) {
    return {
      title: "Wedding Not Found",
    }
  }

  const title = `${wedding.partner1Name} & ${wedding.partner2Name}'s Wedding`
  const description = `Join us in celebrating the wedding of ${wedding.partner1Name} and ${wedding.partner2Name} on ${new Date(
    wedding.weddingDate
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}${wedding.venueName ? ` at ${wedding.venueName}` : ""}${
    wedding.venueCity ? `, ${wedding.venueCity}` : ""
  }${wedding.venueState ? `, ${wedding.venueState}` : ""}.`

  const ogImage = wedding.heroImageUrl || "/og-default-wedding.jpg"
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "Wedding Platform",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function WeddingLayout({ children, params }: WeddingLayoutProps) {
  const { slug } = await params
  const wedding = await getWedding(slug)

  if (!wedding) {
    notFound()
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <SiteHeader
        weddingSlug={wedding.slug}
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={wedding.weddingDate}
      />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 py-12 bg-card/50">
        <div className="container text-center text-sm text-muted-foreground">
          <FloralDivider />
          <p className="font-cursive text-2xl text-gold mb-2">
            {wedding.partner1Name} & {wedding.partner2Name}
          </p>
          <p>
            {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </footer>
    </div>
  )
}

