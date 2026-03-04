# Weekly Sales Report

## Current State
Full-featured sales pipeline tracker with:
- Internet Identity login gate (all users must authenticate)
- RBAC/Settings page (admin manages per-user read/write/add/delete permissions)
- Add Entry, All Entries, and Dashboard pages
- Edit and delete actions in All Entries, all entries seeded on first load
- Auto-refresh every 8 seconds
- Export CSV button in All Entries

## Requested Changes (Diff)

### Add
- Email notification trigger: after any successful add, update, or delete action, show a toast notification AND open a mailto link to lakshminarayanap@mobiusservices.com with a pre-filled subject/body describing the change. This is the "notify by email" mechanism since backend email sending is unavailable.

### Modify
- Remove login requirement: the app should load directly without requiring Internet Identity authentication. All users with the link can access the app. The `useActor` hook already supports anonymous actors, so just remove the `if (!identity)` guard in App.tsx.
- Remove the Settings screen: remove the Settings nav item, Settings page import, and Settings tab from the app entirely.
- Remove RBAC permission checks: since there is no login, treat everyone as having full permissions (canEdit=true, canDelete=true, canAdd=true). Remove the admin badge, user avatar, sign-out button, and any conditional rendering based on permissions.
- Remove the login/logout UI from the header entirely.
- The `useSeedEntries` hook should still work since it uses the anonymous actor.

### Remove
- Login page display (the `if (!identity) return <Login />` block)
- Settings tab and page
- All RBAC/permission-gating logic from nav and content rendering
- User avatar and admin badge from the header
- Sign out button

## Implementation Plan
1. Update App.tsx: remove login gate, remove Settings tab, remove permission-based nav filtering, remove user avatar/admin badge/sign-out button, simplify renderContent to always show all tabs, treat everyone with full access.
2. Update Entries.tsx: always pass canEdit=true and canDelete=true; after handleUpdate and handleDelete succeed, trigger the email notification.
3. Update AddEntry.tsx: after handleSubmit succeeds, trigger the email notification.
4. Create a shared utility `src/utils/notifyEmail.ts` that builds and opens a mailto link to lakshminarayanap@mobiusservices.com with change details.
5. Ensure main.tsx still wraps with RBACProvider (it's needed by the context but won't be user-visible) or remove the RBAC dependency entirely since login is gone.
