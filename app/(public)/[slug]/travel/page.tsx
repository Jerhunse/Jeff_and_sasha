import { redirect } from "next/navigation"

interface TravelPageProps {
  params: Promise<{ slug: string }>
}

export default async function TravelPage({ params }: TravelPageProps) {
  const { slug } = await params
  redirect(`/${slug}#travel`)
}
