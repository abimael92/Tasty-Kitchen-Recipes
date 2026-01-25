# Shared

Cross-feature building blocks:
- `components`: reusable UI elements
- `hooks`: reusable React hooks
- `services`: infrastructure clients (Sanity/Firebase)
- `utils`: pure helpers
- `types`: shared DTOs/interfaces

If a module depends on feature context, it belongs in `src/features/*`.
