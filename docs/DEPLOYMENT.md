# Deployment

This project is deployed on Vercel and uses hosted PostgreSQL plus external services for email and object storage.

## Current production stack

- Vercel (app)
- Supabase (PostgreSQL)
- Resend (verification and reset email)
- Cloudflare R2 (profile image uploads)

## Required environment variables

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=...
RESEND_API_KEY=re_...
EMAIL_FROM="Shelf <hello@your-domain.com>"
STORAGE_BUCKET=...
STORAGE_REGION=...
STORAGE_ENDPOINT=...
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_PUBLIC_BASE_URL=...
STORAGE_FORCE_PATH_STYLE=true|false
```

## Database deployment

Apply migrations to the target database before testing the live app:

```bash
npx prisma migrate deploy
```

Optional seed (staging only):

```bash
npm run prisma:seed
```

## Supabase connection guidance

- Use a pooled runtime URL for `DATABASE_URL` in serverless environments.
- Keep `DIRECT_URL` available for migration/schema operations.
- If using Supabase poolers with Prisma, follow Supabase's Prisma connection guidance.

## Post-deploy smoke test

Run these checks on the deployed URL:

1. Sign up and verify email
2. Log in and reset password
3. Search/import a book
4. Add/remove shelves and shelf items
5. Create review, like, comment, and delete comment
6. Upload profile image
7. Confirm notifications clear after opening notifications page
