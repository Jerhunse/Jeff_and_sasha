import { redirect } from "next/navigation"

interface SchedulePageProps {
  params: Promise<{ slug: string }>
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { slug } = await params
  redirect(`/${slug}#schedule`)
}
