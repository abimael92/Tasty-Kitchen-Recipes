# Features

Each folder represents a domain area (e.g., `comments`, `grocery`, `profile`).
Feature modules own:
- UI components
- Hooks
- Feature services
- Feature-specific types

Routing stays in `src/pages`. API handlers remain in `src/pages/api` and call
feature services from here.
