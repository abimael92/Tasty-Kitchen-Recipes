# Refactor Map (Planned Moves)

This is a concrete, non-breaking move plan. It preserves existing behavior by:
- Keeping Astro routes in `src/pages`
- Using re-export stubs during transition
- Moving business logic into feature-level services

## Proposed File Moves / Renames

### Auth
- `src/context/AuthContext.jsx` → `src/features/auth/context/AuthContext.jsx`
- `src/components/LoginWrapper.jsx` → `src/features/auth/components/LoginWrapper.jsx`
- `src/components/LoginModal.jsx` → `src/features/auth/components/LoginModal.jsx`
- `src/pages/api/authUser.ts` → `src/pages/api/authUser.ts` (stay) + logic to `src/features/auth/services/authService.ts`
- `src/pages/api/registerUser.ts` → `src/pages/api/registerUser.ts` (stay) + logic to `src/features/auth/services/registrationService.ts`

### Comments
- `src/components/CommentsSection.jsx` → `src/features/comments/components/CommentsSection.jsx`
- `src/components/Comment.jsx` → `src/features/comments/components/Comment.jsx`
- `src/components/EmojiPicker.jsx` → `src/features/comments/components/EmojiPicker.jsx`
- `src/hooks/useCommentUpdates.ts` → `src/features/comments/hooks/useCommentUpdates.ts`
- `src/pages/api/*comment*` → route stays, logic to `src/features/comments/services/*`

### Favorites
- `src/components/FavoriteButton.jsx` → `src/features/favorites/components/FavoriteButton.jsx`
- `src/components/FavoritesFetcher.jsx` → `src/features/favorites/components/FavoritesFetcher.jsx`
- `src/components/FavoritesList.jsx` → `src/features/favorites/components/FavoritesList.jsx`
- `src/pages/api/get-favorites.ts` → route stays, logic to `src/features/favorites/services/favoritesService.ts`

### Grocery
- `src/components/GroceryListPage.jsx` → `src/features/grocery/components/GroceryListPage.jsx`
- `src/components/GroceryListToggleButton.jsx` → `src/features/grocery/components/GroceryListToggleButton.jsx`
- `src/utils/parseIngredient.ts` → `src/features/grocery/utils/parseIngredient.ts` (or `shared` if reused)
- `src/pages/api/*grocery*` → route stays, logic to `src/features/grocery/services/*`

### Profile
- `src/components/UserProfile.jsx` → `src/features/profile/components/UserProfile.jsx`
- `src/pages/api/get-user-profile.ts` → route stays, logic to `src/features/profile/services/profileService.ts`
- `src/pages/api/updateUserProfile.ts` → route stays, logic to `src/features/profile/services/profileService.ts`

### Ratings
- `src/components/InteractiveRating.jsx` → `src/features/ratings/components/InteractiveRating.jsx`
- `src/components/RatingStars.jsx` → `src/features/ratings/components/RatingStars.jsx`
- `src/pages/api/submit-rating.ts` → route stays, logic to `src/features/ratings/services/ratingService.ts`
- `src/pages/api/get-user-rating.ts` → route stays, logic to `src/features/ratings/services/ratingService.ts`

### Recipes
- `src/components/RecipeList.jsx` → `src/features/recipes/components/RecipeList.jsx`
- `src/components/RecipeCard.jsx` → `src/features/recipes/components/RecipeCard.jsx`
- `src/components/RecipeFilters.jsx` → `src/features/recipes/components/RecipeFilters.jsx`
- `src/pages/recipes/*` → stay in `pages` (routing boundary)

## Shared Consolidation
- `src/utils/*` → `src/shared/utils/*` (then re-export for backwards compatibility)
- `src/hooks/*` → `src/shared/hooks/*`
- `src/lib/*` → `src/shared/services/*`
- `src/types/*` (create) → shared types + per-feature types

## Compatibility Strategy
1. Move implementation to new path.
2. Keep old file as re-export:
   ```ts
   export * from '../features/featureX/...';
   ```
3. Update imports gradually.

## Breaking Change Avoidance
- No route path changes.
- No component prop contract changes.
- Feature modules introduced via re-exports first.
