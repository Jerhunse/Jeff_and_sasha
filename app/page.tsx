import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  // Find the first published wedding to get the slug
  const wedding = await prisma.couple.findFirst({
    where: { isPublished: true },
    select: { slug: true },
    orderBy: { createdAt: "asc" },
  });

  // Redirect directly to the wedding site if it exists
  if (wedding) {
    redirect(`/${wedding.slug}`);
  }

  // If no wedding exists, show a message
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <h1 className="font-cursive text-4xl text-gold mb-4">Wedding Platform</h1>
        <p className="text-muted-foreground mb-8">
          No wedding site found. Please contact the administrator.
        </p>
      </div>
    </div>
  );
}
