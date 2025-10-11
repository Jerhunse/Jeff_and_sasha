import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SiteHeader } from "@/components/wedding/site-header"

interface WeddingLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

async function getWedding(slug: string) {
  const wedding = await prisma.wedding.findUnique({
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
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
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
      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-serif text-lg mb-2">
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

