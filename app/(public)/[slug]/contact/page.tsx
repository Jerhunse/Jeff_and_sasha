import { redirect } from "next/navigation"

interface ContactPageProps {
  params: Promise<{ slug: string }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug } = await params
  redirect(`/${slug}#contact`)
}
