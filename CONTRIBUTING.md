# Contributing

Thanks for contributing to Shelf.

## Local setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Before opening a PR

```bash
npm run build
npm test
```

If your change affects user flows, run:

```bash
npm run test:e2e
```

## Engineering guidelines

- Keep route input/output validation in Zod.
- Prefer server components by default; use client components only for interaction.
- Keep Prisma schema changes paired with migrations.
- Keep API and UI behavior idempotent where possible (especially imports and social actions).
