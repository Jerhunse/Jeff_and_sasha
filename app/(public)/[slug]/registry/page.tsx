import { redirect } from "next/navigation"

interface RegistryPageProps {
  params: Promise<{ slug: string }>
}

export default async function RegistryPage({ params }: RegistryPageProps) {
  const { slug } = await params
  redirect(`/${slug}#registry`)
}
