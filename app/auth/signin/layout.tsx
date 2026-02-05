import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | Wedding Admin",
  description: "Sign in to your wedding admin dashboard",
}

export default function AuthSignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
