# Supabase Workflow

## Prerequisites

1. Install Supabase CLI.
2. Authenticate CLI: `supabase login`.

## Local database setup

1. Initialize project config if not initialized: `supabase init`.
2. Start local stack: `supabase start`.
3. Apply all migrations and run seed: `supabase db reset`.

`supabase db reset` applies SQL files in `supabase/migrations/` and runs `supabase/seed.sql`.

## Apply migrations to linked remote project

1. Link project: `supabase link --project-ref <your-project-ref>`.
2. Push local migrations: `supabase db push`.

## Add a new migration

1. Create migration: `supabase migration new <name>`.
2. Edit generated SQL in `supabase/migrations/`.
3. Validate locally: `supabase db reset`.
4. Push remotely after verification: `supabase db push`.

## Regenerate schema snapshot

The authoritative execution order is migration files in `supabase/migrations/`.
Keep `supabase/schema.sql` in sync by appending the same SQL changes or rebuilding from migration history.
