import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "noreply@wedding.app",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, weddingId: true }
        })
        
        session.user.id = user.id
        session.user.role = dbUser?.role || 'GUEST'
        session.user.weddingId = dbUser?.weddingId
      }
      return session
    },
  },
  session: {
    strategy: "database",
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
    select: { role: true, weddingId: true }
  })
  
  const canAccess = 
    user?.weddingId === weddingId && 
    (user?.role === 'OWNER' || user?.role === 'COLLABORATOR')
  
  if (!canAccess) {
    throw new Error("Forbidden")
  }
  
  return session
}

