import { redirect } from "next/navigation"

interface FaqPageProps {
  params: Promise<{ slug: string }>
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { slug } = await params
  redirect(`/${slug}#faq`)
}
