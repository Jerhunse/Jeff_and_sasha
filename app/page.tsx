import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  // Find the first published wedding to get the slug
  const wedding = await prisma.couple.findFirst({
    where: { isPublished: true },
    select: { slug: true, partner1Name: true, partner2Name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <h1 className="font-cursive text-4xl text-gold mb-4">Wedding Platform</h1>
        {wedding ? (
          <>
            <p className="text-muted-foreground mb-8">
              Welcome to {wedding.partner1Name} & {wedding.partner2Name}&apos;s wedding site!
            </p>
            <div className="flex flex-col gap-4">
              <Link
                href={`/${wedding.slug}`}
                className="inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
              >
                View Wedding Site
              </Link>
              <Link
                href="/admin/rsvp-dashboard"
                className="inline-block rounded-full border border-primary text-primary px-6 py-3 font-medium hover:bg-primary/10 transition-colors"
              >
                RSVP Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-8">
              No wedding site found. Please set up your wedding in the admin panel.
            </p>
            <Link
              href="/admin/rsvp-dashboard"
              className="inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Admin Panel
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
