# Fastbreak Event Dashboard

This is my submission for the coding challenge.

I built Fastbreak as a practical event dashboard: create events, attach venues, filter fast, and keep permissions locked down so users can only edit their own data.

I wanted this write-up to feel like a real build log, not a marketing page, so this is how I actually approached it.

## What I built

- Event CRUD (create, edit, delete)
- Event start/end date support (`starts_at`, `ends_at`)
- Multi-venue support per event
- Structured venue address fields (`street`, `city`, `state`, `zip`)
- Search + sport filter with counts
- Email/password auth + Google OAuth
- Ownership-aware actions (edit/delete only for event creator)
- Toasts for create/update/delete feedback

## How I approached it

I tried to keep the data flow boring.

Reads and writes happen through Server Components + Server Actions, with Supabase as the backend. On the UI side, I used React Hook Form + Zod so form validation is explicit and predictable.

For auth/authorization, I treated the UI as a convenience layer and RLS as the real protection layer. Hiding controls in the UI helps clarity, but the database policies are what actually stop bad writes.

## Main tradeoffs I made

1. Server Actions instead of a separate API layer  
Pro: less boilerplate, faster iteration.  
Con: less explicit than REST routes when debugging.

2. Flexible sport strings instead of hard DB enums  
Pro: easier to iterate during product changes.  
Con: requires normalization to avoid casing drift (`E-Mls` vs `E-MLS`).

3. Hide unauthorized actions instead of disabling them  
Pro: cleaner experience, less clutter.  
Con: users do not see "why" unless we add explicit permission messaging.

## Real issues I hit in deployment (and how I fixed them)

### 1) Google OAuth redirect issue in production

I ran into a bad callback URL that looked like this:

`https://<project>.supabase.co/fastbreak-event-dashboard-dusky.vercel.app?...`

Root cause: one redirect URL was missing `https://`, so Supabase treated it like a path.

Fix:
- Corrected Supabase auth URL settings
- Standardized redirect origin handling in code
- Kept `/auth/callback` as the OAuth exchange route

### 2) Vercel TypeScript failures

I hit a few build blockers:
- Resolver type mismatch in login/signup form
- `string | null` values flowing into string-only route params

Fix:
- Tightened form typings and resolver usage
- Normalized nullable values before passing them along

### 3) UI library warnings

I saw warnings around:
- Controlled/uncontrolled inputs
- Non-native button semantics in button-like components

Fix:
- Made form fields consistently controlled (`value ?? ''`)
- Updated button usage to keep native button semantics for accessibility

### 4) Hydration warning noise

There was a hydration mismatch warning tied to attributes modified at runtime. I verified app behavior and narrowed this down to non-core rendering differences, then kept server/client rendering paths consistent where needed.

## What I’d do next if I had more time

1. Add action-level integration tests (especially auth callback + RLS-protected mutations).
2. Add end-to-end tests for the full event form flow.
3. Add CI checks for migrations before deploy.
4. Add better auth error telemetry in production.

## Run locally

```bash
npm install
npm run dev
```

`.env.local` needs:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (Postgres, Auth, RLS)
- Tailwind CSS + shadcn/Base UI
- React Hook Form + Zod
