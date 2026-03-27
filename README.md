# Fastbreak Event Dashboard

This project is my take on a practical event management dashboard: create events, attach venues, filter quickly, and keep auth + permissions tight.

I wanted the build to feel simple to use but deliberate under the hood, so this README explains not just what I built, but how I thought about it and where I accepted tradeoffs.

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and add your Supabase keys.

## My Approach

### 1. Keep the data flow boring and predictable

I used Server Components + Server Actions for all reads/writes to Supabase. The goal was to keep browser code focused on UI interactions while keeping data access and auth-sensitive work on the server.

Why I like this:
- Less client-side complexity
- Easier to reason about permissions
- Cleaner separation between UI and data concerns

Tradeoff:
- Server Actions can feel more magical than explicit REST endpoints, so debugging requires comfort with Next.js action patterns.

### 2. Put security at the database layer first

I leaned on Supabase RLS as the primary authorization boundary. UI hiding is helpful for UX, but RLS is the part that actually prevents unauthorized reads/writes.

Why:
- Defense in depth
- Safer against accidental server-side mistakes

Tradeoff:
- Policy logic lives in SQL, which is less visible than TypeScript unless you keep migrations disciplined.

### 3. Optimize for real UX feedback

I made sure success/error toasts exist for create, update, and delete flows, and fixed edge cases where redirects could produce false “failure” signals.

Why:
- Event management is a CRUD-heavy workflow
- Fast feedback reduces “did that work?” uncertainty

Tradeoff:
- More state handling around async actions and loading transitions.

## Architecture Notes

### Frontend
- Next.js App Router
- Server-rendered dashboard pages
- Client forms with `react-hook-form` + `zodResolver`
- shadcn/Base UI components for consistent a11y primitives

### Backend + Data
- Supabase Postgres for persistence
- Supabase Auth for session/user identity
- RLS policies tied to `created_by` ownership
- Server Actions as the single mutation entry point

### Current Event Model
- `events` is the root entity
- `venues` are child records (`event_id`)
- Event time range now includes `starts_at` and `ends_at`
- Validation enforces `ends_at > starts_at`

## Key Tradeoffs I Chose

### Server Actions instead of API routes
- Pro: less boilerplate, strong co-location with UI
- Con: less explicit contract surface than a dedicated API layer

### String sport values instead of strict enum in DB
- Pro: flexible and easy to iterate
- Con: weaker DB-level constraints

### Hide edit/delete for non-owners in UI
- Pro: cleaner UX than disabled controls
- Con: less visible discoverability of permissions model
- Note: authorization is still enforced server-side + via RLS

### Dynamic sport filters with counts
- Pro: filter stays relevant (`Sport (count)` only when data exists)
- Con: extra query and slight coupling to current dataset

## What I’d Improve Next

1. Add migration tooling/automation around Supabase policies and schema diffs.
2. Add tests around action-level authorization and validation failures.
3. Add optimistic UI for create/update/delete flows.
4. Model deeper competition structure (matches/rounds) under each event.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Database/Auth: Supabase (Postgres + Auth)
- Styling: Tailwind CSS v4
- UI: shadcn/ui + Base UI primitives
- Forms/Validation: react-hook-form + Zod
