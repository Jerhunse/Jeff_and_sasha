import { prisma } from "@/lib/prisma";
import { EnvelopeLanding } from "@/components/wedding/envelope-landing";

export default async function Home() {
  // Find the first published wedding with events
  const wedding = await prisma.couple.findFirst({
    where: { isPublished: true },
    include: {
      events: {
        where: { visibility: "PUBLIC" },
        orderBy: { startTime: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (wedding) {
    // Pass the raw date string for envelope formatting
    const weddingDate = wedding.weddingDate.toISOString();

    // Prepare wedding details
    const weddingDetails = {
      venueName: wedding.venueName,
      venueAddress: wedding.venueAddress,
      venueCity: wedding.venueCity,
      venueState: wedding.venueState,
      venueZip: wedding.venueZip,
      events: wedding.events.map((event) => ({
        name: event.name,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime?.toISOString() || null,
        location: event.location,
        address: event.address,
        venue: event.venue,
      })),
    };

    return (
      <EnvelopeLanding
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={weddingDate}
        redirectTo={`/${wedding.slug}`}
        weddingDetails={weddingDetails}
      />
    );
  }

  // If no published wedding exists, show a simple landing page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary to-accent/10">
      <div className="text-center p-8">
        <h1 className="font-serif text-4xl font-bold mb-4">Wedding Platform</h1>
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
