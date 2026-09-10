import { PrismaClient } from '@prisma/client'

// Prevent multiple Prisma client instances during Next.js hot-reloads in development.
// In production, a fresh instance is created per process (long-running servers) or
// per cold-start (serverless) — this is fine since we use the pooled Supabase connection.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
