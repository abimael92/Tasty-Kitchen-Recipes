# Security Audit & Fixes

## Authorization Verification

All API endpoints that modify user data have been verified for proper authorization:

| Endpoint | Auth | Ownership Check |
|----------|------|-----------------|
| `delete-comment` | requireAuth | ✅ `comment.author.uid === auth.uid` |
| `edit-comment` | requireAuth | ✅ `comment.author.uid === auth.uid` |
| `updateUserProfile` | requireAuth | ✅ Updates only `requireSanityUserByUid(auth.uid)` |
| `get-user-profile` | requireAuth | ✅ Rejects if `uidParam !== auth.uid` |
| `get-saved-recipes` | requireAuth | ✅ Rejects if `userIdParam !== user._id` |
| `unsave-recipe` | requireAuth | ✅ Queries by `user._ref == userId` (auth.uid) |
| `save-recipe` | requireAuth | ✅ User-scoped |
| `toggle-favorite` | requireAuth | ✅ User-scoped |
| `toggle-grocery` | requireAuth | ✅ User-scoped |
| `grocery`, `grocery-list` | requireAuth | ✅ User-scoped |
| `remove-grocery-recipe` | requireAuth | ✅ User-scoped |
| `check-grocery` | requireAuth | ✅ User-scoped |
| `save-bmi` | requireAuth | ✅ Patches `currentUser._id` (from auth.uid) |
| `submit-rating` | requireAuth | ✅ User-scoped |
| `submit-recipe` | requireAuth | ✅ User-scoped |

## CSRF Protection

- **SameSite=Strict** on session cookie prevents cookie from being sent on cross-site requests
- All state-changing operations require valid session (HttpOnly cookie)
- No additional CSRF tokens required for same-origin requests

## npm Audit

Run `npm run audit` before each deployment. For fixes:

```bash
npm run audit:fix    # Apply non-breaking fixes
npm audit fix --force  # Apply all fixes (may cause breaking changes)
```

**Note**: Some vulnerabilities (e.g. firebase-admin, path-to-regexp) require `--force` and may introduce breaking changes. Review before applying.
