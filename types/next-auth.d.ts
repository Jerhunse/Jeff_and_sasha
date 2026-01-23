import { Role } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
      weddingId?: string | null
      coupleId?: string | null
    }
  }

  interface User {
    role: Role
    weddingId?: string | null
    coupleId?: string | null
  }
}

