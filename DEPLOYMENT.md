# Deployment Guide

This document outlines how to deploy the University ERP to three different target environments: Vercel, Render, or AWS ECS/Fargate. The entire infrastructure is environment-config-driven, meaning you can switch providers simply by changing the CI/CD destination, with no application code changes required.

## Required Environment Variables

Regardless of where you deploy, the following environment variables MUST be provided to the production environment:

- `DATABASE_URL`: The connection string for Prisma. (See the Supabase Connection Rules below).
- `DIRECT_URL`: The direct connection string, used exclusively for running database migrations (`prisma migrate deploy`).
- `JWT_SECRET`: A strong, random string used to sign user session cookies.
- `NEXT_PUBLIC_SUPABASE_URL`: The URL for your Supabase project (used for Storage uploads).
- `SUPABASE_SERVICE_ROLE_KEY`: The Service Role key for your Supabase project (bypasses RLS to allow server-side bucket access).

### Supabase Connection Rules (Pooled vs Direct)

Supabase provides two types of connection strings:
1. **Transaction Pooler URL** (Port 6543, `?pgbouncer=true`): Built to handle thousands of rapid, short-lived connections from serverless functions.
2. **Direct URL** (Port 5432): Built for long-lived, persistent database connections and executing migrations.

**Rule of Thumb:**
- If deploying to a **Serverless** environment (like Vercel), `DATABASE_URL` **MUST** be the Transaction Pooler URL. If you use the Direct URL, you will quickly exhaust the Postgres connection limit.
- If deploying to a **Long-Running Server** (like Render or an AWS container), `DATABASE_URL` can be either, but the Direct URL is perfectly safe since Prisma will internally manage a strict connection pool.
- `DIRECT_URL` must ALWAYS be the Direct URL (Port 5432) for running migrations.

---

## Target 1: Vercel (Recommended for Next.js)

Vercel provides native support for Next.js App Router and edge caching. The deployment is entirely serverless. No `vercel.json` is required as standard routing is supported out of the box.

1. Connect your GitHub repository to Vercel.
2. In the Vercel project settings, go to **Environment Variables**.
3. Add the 5 required environment variables listed above. 
   > **CRITICAL**: `DATABASE_URL` must be the Supabase POOLED connection string.
4. Deploy. Vercel automatically runs `npm run build`, which triggers `prisma generate`.
5. *Note*: Ensure you manually run `npx prisma migrate deploy` locally or via GitHub Actions against the production database, as Vercel's build step does not run migrations by default.

---

## Target 2: Render

Render provides a long-running Node.js server environment rather than serverless functions. We have provided a `render.yaml` blueprint.

1. In the Render Dashboard, create a new **Blueprint Instance** and connect your repository.
2. Render will automatically detect the `render.yaml` file and configure the Web Service to run `npm run build` and `npm run start`.
3. Render will prompt you to enter the environment variables defined in the blueprint.
   > **Note**: Since Render is a long-running server, `DATABASE_URL` can be the Direct Supabase URL, though the Pooled URL is also fine.
4. Render will automatically build and start the server.

---

## Target 3: AWS (ECS Fargate)

For full IT-team ownership, the app can be containerized and run on AWS. We have provided a `Dockerfile` and a `docker-compose.yml` (for local testing).

### Local Container Testing
1. Copy your `.env.local` variables to `.env`.
2. Run `docker-compose up --build`. This simulates the production container locally (the database remains external on Supabase).

### AWS Architecture Setup
1. **ECR**: Build the Docker image (`docker build -t erp-app .`) and push it to Amazon Elastic Container Registry (ECR).
2. **ECS Fargate**: Create an ECS Fargate cluster. Define a Task Definition using the ECR image. Pass the 5 required environment variables into the container definition (using AWS Secrets Manager for security).
3. **Application Load Balancer (ALB)**: Place the Fargate service behind an ALB to route HTTP/HTTPS traffic to port `3000` on the container.
4. **Route 53**: Point your custom domain alias to the ALB.
5. **Database**: Supabase remains the external managed database. No Amazon RDS instance is required unless you plan to migrate the data off Supabase completely.
