import { prisma } from "@/lib/prisma";
import { SplashRsvpGate } from "@/components/wedding/splash-rsvp-gate";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Splash image shown first; user must click center to reveal RSVP form. */
const SPLASH_IMAGE_URL = "/Gemini_Generated_Image_x4mqmsx4mqmsx4mq-Firefly-Upscaler-2x-scale.png";

export default async function Home() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.has("wedding_access");

  // Find the first published wedding
  const wedding = await prisma.couple.findFirst({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
  });

  // In development, skip the gate and go straight to the wedding site so localhost:3000 is usable
  // if (process.env.NODE_ENV === "development" && wedding) {
  //   redirect(`/${wedding.slug}`);
  // }

  // If user has access and wedding exists, redirect to wedding site
  if (hasAccess && wedding) {
    redirect(`/${wedding.slug}`);
  }

  // Splash gate: full-screen image first; click center → RSVP form; must complete before access
  if (wedding) {
    return (
      <SplashRsvpGate
        rsvpSlug={wedding.slug}
        imageUrl={wedding.heroImageUrl || SPLASH_IMAGE_URL}
      />
    );
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
