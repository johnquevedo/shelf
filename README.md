# Shelf

Shelf is a production-style Goodreads-lite built with Next.js App Router, TypeScript, Tailwind, Prisma, PostgreSQL, NextAuth credentials auth, Zod, React Hook Form, Vitest, Playwright, and Docker Compose for local Postgres.

## Feature checklist

- [x] Landing page with hero, features, FAQs, and auth modal triggers
- [x] Credentials auth with sign up, log in, forgot-password token logging, bcrypt hashing, and protected app shell
- [x] Dark navy app shell with sidebar, search bar, counters, avatar, privacy, and terms
- [x] Open Library search, canonical book caching on click, and detailed book page
- [x] Default + custom shelves with add/remove flows and shelf-filtered library view
- [x] Reviews, home feed, likes, and follow/unfollow recommendations
- [x] Explore sections powered by real DB queries and deterministic recommendations
- [x] Journal logging, stats cards, reading streak, and currently-reading state
- [x] Settings profile form, production-safe object storage uploads, Goodreads CSV import, and idempotent dedupe
- [x] Email verification flow with resend support and login gated on verified accounts
- [x] Password reset flow with token emails and reset form
- [x] Persisted comments, notifications, and real user profile pages
- [x] Prisma schema, migration SQL, seed script, Vitest unit coverage, Playwright auth flow, and Docker Postgres

## Stack

- Next.js 14 App Router
- TypeScript
- TailwindCSS
- Prisma + PostgreSQL
- NextAuth Credentials
- Zod + React Hook Form
- Vitest + Playwright

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env vars:

```bash
cp .env.example .env
```

3. Start Postgres:

```bash
docker compose up -d
```

This project’s Docker Postgres is exposed on host port `5433`, so `DATABASE_URL` should point to `localhost:5433`.

4. Run migrations and seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

If you already ran an earlier version locally, use `npx prisma migrate reset` once so the newer comment, email-verification, and password-reset tables are recreated cleanly.

5. Start the dev server:

```bash
npm run dev
```

6. Optional test commands:

```bash
npm test
npm run test:e2e
```

## Deployment

GitHub only stores the code. It does not host the app or database.

For real multi-user persistence after deployment you need:

1. A deployed Next.js app.
2. A hosted PostgreSQL database.
3. Production environment variables configured on the hosting platform.

Example production env:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=...
RESEND_API_KEY=re_...
EMAIL_FROM="Shelf <onboarding@resend.dev>"
STORAGE_BUCKET=...
STORAGE_REGION=auto
STORAGE_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_PUBLIC_BASE_URL=https://cdn.your-domain.com
```

Or use SMTP instead:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM="Shelf <no-reply@your-domain.com>"
```

Without hosted Postgres, user data disappears with your local environment. In production you should configure `Resend` or SMTP so verification is delivered to a real inbox.

Profile uploads should use S3-compatible object storage in production. This app supports that directly through the `STORAGE_*` env vars and falls back to `public/uploads` only in local development.

For pooled Postgres providers, use:

- `DATABASE_URL`: pooled connection string for the running app
- `DIRECT_URL`: direct connection string for Prisma migrations and schema operations

Recommended deployment stack:

1. `Vercel` for the Next.js app
2. `Neon` or `Supabase` for PostgreSQL
3. `Resend` for verification and password reset email
4. `Cloudflare R2` or `Amazon S3` for profile image storage

For Cloudflare R2:

```bash
STORAGE_BUCKET=shelf
STORAGE_REGION=auto
STORAGE_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_PUBLIC_BASE_URL=https://pub-<id>.r2.dev
STORAGE_FORCE_PATH_STYLE=true
```

For Amazon S3:

```bash
STORAGE_BUCKET=shelf-production
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_PUBLIC_BASE_URL=https://shelf-production.s3.amazonaws.com
STORAGE_FORCE_PATH_STYLE=false
```

## Demo credentials

- Email: `demo@shelf.app`
- Password: `password123`

## Important commands

```bash
npm run dev
npm run build
npm run prisma:migrate
npm run prisma:seed
npm test
npm run test:e2e
docker compose up -d
docker compose down
```

## File tree

```text
.
├── app
│   ├── (app)
│   │   ├── books
│   │   ├── explore
│   │   ├── home
│   │   ├── journal
│   │   ├── library
│   │   ├── notifications
│   │   ├── settings
│   │   ├── users
│   │   └── layout.tsx
│   ├── (marketing)
│   │   └── page.tsx
│   ├── api
│   │   ├── auth
│   │   ├── books
│   │   ├── feed
│   │   ├── follows
│   │   ├── import
│   │   ├── journal
│   │   ├── likes
│   │   ├── profile
│   │   ├── reviews
│   │   └── shelves
│   ├── forgot-password
│   ├── privacy
│   ├── reset-password
│   ├── terms
│   ├── verify-email
│   ├── globals.css
│   ├── layout.tsx
│   └── providers.tsx
├── components
│   ├── app-shell
│   ├── auth
│   ├── books
│   ├── feed
│   ├── journal
│   ├── library
│   ├── settings
│   └── ui
├── lib
│   ├── actions
│   ├── auth
│   ├── books
│   ├── feed
│   ├── import
│   ├── journal
│   ├── recommendations
│   ├── validators
│   ├── prisma.ts
│   └── utils.ts
├── prisma
│   ├── migrations
│   ├── schema.prisma
│   └── seed.ts
├── public
│   └── uploads
├── tests
│   ├── e2e
│   └── recommendations.test.ts
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

## Notes

- Open Library search runs server-side through `/api/books/search`.
- Clicking a search result imports the canonical book into the local database before rendering `/books/[id]`.
- Goodreads import is idempotent by ISBN or title+author heuristic and also merges shelves, ratings, reviews, and reading dates where present.
- Profile image uploads use S3-compatible object storage in production and only fall back to `public/uploads` in local development.
- Email verification uses `Resend` first when `RESEND_API_KEY` is set and falls back to SMTP when configured.
- Password reset uses the same email delivery pipeline and sends users to `/reset-password` with a signed token.
