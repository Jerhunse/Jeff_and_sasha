import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourwedding.com"

  // Get all published weddings
  const weddings = await prisma.couple.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      updatedAt: true,
      weddingDate: true,
    },
  })

  // Generate sitemap entries for each wedding
  const weddingSitemapEntries: MetadataRoute.Sitemap = weddings.flatMap(
    (wedding) => {
      const weddingPages = [
        {
          url: `${baseUrl}/${wedding.slug}`,
          lastModified: wedding.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 1,
        },
        {
          url: `${baseUrl}/${wedding.slug}/schedule`,
          lastModified: wedding.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.9,
        },
        {
          url: `${baseUrl}/${wedding.slug}/travel`,
          lastModified: wedding.updatedAt,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/${wedding.slug}/registry`,
          lastModified: wedding.updatedAt,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/${wedding.slug}/faq`,
          lastModified: wedding.updatedAt,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        },
        {
          url: `${baseUrl}/${wedding.slug}/contact`,
          lastModified: wedding.updatedAt,
          changeFrequency: "yearly" as const,
          priority: 0.5,
        },
      ]

      return weddingPages
    }
  )

  // Root pages
  const rootPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ]

  return [...rootPages, ...weddingSitemapEntries]
}

