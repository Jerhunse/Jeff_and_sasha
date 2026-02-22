import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle connection errors gracefully and ensure connection on startup
prisma.$connect()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Database connected successfully')
    }
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err)
  })

// Graceful shutdown - disconnect on process termination
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

