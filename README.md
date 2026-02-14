[![English](https://img.shields.io/badge/Language-English-2ea44f)](README.md)
[![한국어](https://img.shields.io/badge/Language-한국어-1f6feb)](README.ko.md)

# Lounge FW

Community web app built with React + Vite + Supabase.

## Overview

- Authentication with Supabase Auth (email/password + GitHub OAuth)
- Post creation/editing with Markdown-style content and tag selection
- Comment and like interactions with realtime updates
- Full-text search and tag-based filtering
- Protected routes for authenticated pages

## Tech Stack

- React 18
- Vite
- TypeScript
- TanStack Query
- Supabase (Auth, Postgres, Realtime)

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env` from `.env.example` and set values:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

`VITE_SUPABASE_ANON_KEY` is still supported as a legacy fallback, but `VITE_SUPABASE_PUBLISHABLE_KEY` is recommended.

### 3) Run development server

```bash
npm run dev
```

## Supabase Local Development

```bash
npx supabase start
npx supabase db reset
```

## Scripts

- `npm run dev`: start Vite dev server
- `npm run typecheck`: run TypeScript checks
- `npm run build`: build production assets
- `npm run preview`: preview production build

## Project Structure

See `src/README.md` for source architecture details.
