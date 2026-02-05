import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as NextAuthConfig["adapter"],
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Simple hardcoded check for admin
        if (email === "sashaplusjeff@gmail.com" && password === "admin1") {
          // Find or create the user in the database
          const user = await prisma.user.findUnique({
            where: { email: "sashaplusjeff@gmail.com" }
          })

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              coupleId: user.coupleId
            }
          }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.coupleId = user.coupleId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.coupleId = token.coupleId as string | null
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})

// Helper to check if user has required role
export async function requireRole(roles: Role[]) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  const userRole = session.user.role as Role
  
  if (!roles.includes(userRole)) {
    throw new Error("Forbidden")
  }
  
  return session
}

// Helper to check if user can manage wedding
export async function requireWeddingAccess(weddingId: string) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, coupleId: true }
  })
  
  const canAccess = 
    user?.coupleId === weddingId && 
    (user?.role === 'OWNER' || user?.role === 'COLLABORATOR')
  
  if (!canAccess) {
    throw new Error("Forbidden")
  }
  
  return session
}

