# Architecture Plan (Non-Breaking)

This plan is based strictly on the current repository. It proposes a scalable structure, clear ownership boundaries, and a migration path that preserves behavior.

## Goals
- Reduce coupling by moving business logic into feature-level services/hooks.
- Increase cohesion by grouping feature code together.
- Keep Astro routing intact while isolating API logic.
- Make it easier to add new features without cross-cutting changes.

## Recommended Folder Structure
```
src/
  pages/                  # Astro routes and API endpoints (routing boundary)
    api/                  # Thin route handlers only (delegates to services)
  layouts/                # Astro layouts only
  features/               # Feature domains (UI + hooks + services)
    auth/
    comments/
    favorites/
    grocery/
    profile/
    recipes/
    ratings/
  shared/                 # Cross-feature shared primitives
    components/           # Reusable UI components (design system)
    hooks/                # Reusable hooks (no domain assumptions)
    services/             # Shared infrastructure clients (sanity, firebase)
    utils/                # Pure utilities and helpers
    types/                # Cross-feature types/interfaces
  content/                # Astro content collections (recipes markdown)
  locales/                # i18n dictionaries
  styles/                 # Global styles and tokens
  assets/                 # Static assets used by the UI
  data/                   # Static data files (e.g., tips)
```

## What Belongs Where (and Why)
- `pages/`: Routing boundary only. Keep Astro pages + API route entrypoints here.
- `features/<feature>`: All domain logic, UI, hooks, and feature services.
- `shared/`: Truly cross-cutting pieces with no feature context.
- `shared/services`: Clients and infrastructure integrations (Sanity/Firebase).
- `shared/types`: Shared DTOs and interfaces used across features.

## Coupling Reduction Strategy
1. **API routes** become thin and call feature services.
2. **Components** move feature logic to hooks/services.
3. **Shared utilities** are referenced via `src/shared`.

## SOLID Violations and Fixes (Summary)
- **SRP violations**: Large components (`UserProfile.jsx`, `GroceryListPage.jsx`, `CommentsSection.jsx`).
  - Fix: split into feature-level components + hooks + service modules.
- **Dependency inversion**: UI directly uses `fetch` and raw endpoints.
  - Fix: create `features/<feature>/services/*.ts` and inject from components.
- **Interface segregation**: Components depend on broad objects (user profile).
  - Fix: define small DTOs in `shared/types` for each feature.
- **Open/closed**: scattered config/constants in components.
  - Fix: centralize defaults in feature config modules.

## Astro + React Best Practices Applied
- Keep SSR in Astro pages; React for islands only.
- Use `client:only` and `client:load` intentionally.
- Do not move Astro pages or API routes out of `src/pages`.

## Migration Guidance
- Create feature services, then update pages/api to call them.
- Move UI to `features/*` and re-export from old paths for compatibility.
- Update import paths feature-by-feature to reduce blast radius.
