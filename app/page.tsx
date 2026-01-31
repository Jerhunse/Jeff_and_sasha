import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  // Find the first published wedding
  const wedding = await prisma.couple.findFirst({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
  });

  // Redirect to the wedding site
  if (wedding) {
    redirect(`/${wedding.slug}`);
  }

  // If no published wedding exists, show a simple landing page
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="font-cursive text-4xl text-gold mb-4">Wedding Platform</h1>
        <p className="text-muted-foreground mb-8">
          No published wedding found. Please set up your wedding in the admin panel.
        </p>
        <a
          href="/admin/overview"
          className="inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
        >
          Go to Admin
        </a>
      </div>
    </div>
  );
}
