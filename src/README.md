# Source Structure

This source tree follows a feature-first architecture with a repository layer.

- `app/`: app-level providers, layouts, and route definitions
- `shared/`: reusable UI, utilities, and infrastructure wrappers
- `entities/`: domain models and type definitions
- `features/`: feature modules (auth, feed, post detail, comments, likes, search)
- `repositories/`: Supabase data-access contracts and implementations
- `pages/`: route-level page containers
