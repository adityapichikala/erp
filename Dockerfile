# syntax=docker/dockerfile:1

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install dependencies
RUN npm ci
COPY . .
# Generate prisma client and build Next.js
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Prisma schema and engine for migrations/runtime if needed
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "run", "start"]
