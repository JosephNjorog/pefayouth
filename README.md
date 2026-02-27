# YouthConnect — PEFA Youth Church Management System

A modern youth church management platform built for PEFA Youth, enabling members, secretaries, finance admins, and pastors to manage attendance, events, media, finances, and communications.

## Tech Stack

- **Frontend**: React + Vite + TypeScript, Radix UI, Tailwind CSS, React Query v5
- **Backend**: Vercel serverless functions (single consolidated handler)
- **Database**: Neon PostgreSQL via Drizzle ORM
- **Auth**: JWT via HttpOnly cookies (jose)
- **Payments**: M-Pesa Daraja STK Push

## Getting Started

```bash
# Install dependencies
npm install

# Run frontend dev server
cd apps/web && npm run dev

# Build for production
cd apps/web && npm run build
```

## Environment Variables

Set these in your Vercel dashboard:

```
DATABASE_URL=...
JWT_SECRET=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=...
MPESA_ENV=sandbox
```

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Member | grace@pefayouth.org | member123 |
| Super Admin | admin@pefayouth.org | admin123 |
| Finance Admin | finance@pefayouth.org | finance123 |
| Secretary | secretary@pefayouth.org | secretary123 |

## Deployment

Deploy to Vercel. The project uses a single `api/index.ts` function to stay within the Vercel Hobby plan 12-function limit.
