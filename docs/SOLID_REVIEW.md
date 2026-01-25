# SOLID Review (Targeted Fixes)

## SRP (Single Responsibility) Violations
- `src/components/UserProfile.jsx`: UI + data loading + BMI logic + list management.
  - Fix: split into `ProfileHeader`, `ProfileDetails`, `BMIWidget`, `SavedRecipes`, and a `useProfile` hook.
- `src/components/GroceryListPage.jsx`: UI + filtering + persistence + item normalization.
  - Fix: `useGroceryList` hook + `GroceryListService` + split UI into list/toolbar/stats.
- `src/components/CommentsSection.jsx`: UI + state + data fetching + realtime sync.
  - Fix: `useComments` hook + `commentsService` + small components.

## DIP (Dependency Inversion) Violations
- Components call `fetch` directly.
  - Fix: introduce `features/<feature>/services/*` modules and inject via hooks.

## ISP (Interface Segregation)
- Components rely on large user objects.
  - Fix: define small DTOs in `src/shared/types` for each usage.

## OCP (Open/Closed)
- Hardcoded config in components.
  - Fix: move defaults to feature config modules.
