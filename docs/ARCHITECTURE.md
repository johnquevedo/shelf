# Architecture

Shelf is a full-stack Next.js 14 app using the App Router with server components by default and client components only where interaction is required.

## High-level design

- `app/`
  - UI routes and API route handlers
  - App shell pages under `app/(app)`
  - Marketing/auth entry under `app/(marketing)`
- `components/`
  - Reusable UI and feature components
- `lib/`
  - Domain logic, auth, validators, recommendation logic, import logic, and persistence helpers
- `prisma/`
  - Schema, migrations, and seed data
- `tests/`
  - Vitest unit tests and Playwright e2e coverage

## Runtime model

- **Frontend:** Next.js App Router + Tailwind CSS
- **Backend:** Next.js route handlers + server actions where useful
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth credentials flow with email verification and password reset
- **Validation:** Zod schemas at API boundaries

## Data flow examples

- **Search books**
  - Client search input calls `/api/books/search`
  - Open Library results are normalized
  - Selected books are upserted into local `Book` records for stable IDs

- **Reviews and social feed**
  - Users create/update one review per book
  - Feed joins reviews, users, likes, and comments for social activity
  - Likes/comments/follows power notifications

- **Library and journal**
  - Default and custom shelves store `ShelfItem` records
  - Reading logs roll up into daily/weekly/monthly/yearly totals and streaks

## Production integrations

- **Email:** Resend (or SMTP fallback)
- **File uploads:** S3-compatible object storage (R2/S3)
- **Hosting:** Vercel
- **DB hosting:** Supabase/Neon-compatible PostgreSQL
