# Shelf

Shelf is a social reading app inspired by Goodreads, built with a modern full-stack TypeScript setup. Users can discover books, organize shelves, write reviews, follow readers, track reading activity, and import existing Goodreads data.

## Live app

- Production URL: `https://shelf.johnfquevedo.com`

## Documentation

- Architecture: [docs/ARCHITECTURE.md](/Users/johnquevedo/Downloads/project-one/docs/ARCHITECTURE.md)
- Deployment: [docs/DEPLOYMENT.md](/Users/johnquevedo/Downloads/project-one/docs/DEPLOYMENT.md)
- Contributing: [CONTRIBUTING.md](/Users/johnquevedo/Downloads/project-one/CONTRIBUTING.md)

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- NextAuth (Credentials) + bcrypt
- Zod + React Hook Form
- Vitest + Playwright

## What the app does

Shelf provides:

- Email-verified authentication (sign up, log in, password reset)
- Dark app shell with global search, responsive sidebar/bottom nav, and notifications
- Book discovery via Open Library with canonical book caching in local DB
- Shelves: Want to Read, Reading, Read, plus custom shelves
- Reviews, likes, comments, and follow/unfollow social activity
- Home feed and explore sections backed by real database queries
- Reading journal with page logs, streak, and period stats
- Profile settings with image uploads (S3-compatible storage in production)
- Goodreads CSV import with idempotent merge logic

## Local development

If you want to run Shelf locally:

1. Install dependencies

```bash
npm install
```

2. Copy env file

```bash
cp .env.example .env
```

3. Start local Postgres

```bash
docker compose up -d
```

4. Apply DB schema and seed

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Run the app

```bash
npm run dev
```

## Environment variables

Main required vars:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=...
RESEND_API_KEY=re_...
EMAIL_FROM="Shelf <hello@your-domain.com>"
```

Object storage vars (for profile photos in production):

```bash
STORAGE_BUCKET=...
STORAGE_REGION=...
STORAGE_ENDPOINT=...
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_PUBLIC_BASE_URL=...
STORAGE_FORCE_PATH_STYLE=true|false
```

## Database and migrations

- Use `DATABASE_URL` for app runtime
- Use `DIRECT_URL` for Prisma schema operations/migrations

Deploy migrations:

```bash
npx prisma migrate deploy
```

Check migration status:

```bash
npx prisma migrate status
```

## Testing and build

```bash
npm run build
npm test
npm run test:e2e
```

## Useful commands

```bash
npm run dev
npm run build
npm run prisma:migrate
npm run prisma:seed
npx prisma migrate deploy
docker compose up -d
docker compose down
```

## Demo account

- Email: `demo@shelf.app`
- Password: `password123`
