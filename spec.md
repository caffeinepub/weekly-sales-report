# Weekly Sales Report — Login & Role-Based Access Control

## Current State
- Full-stack sales pipeline app with Dashboard, All Entries, and Add Entry pages.
- No authentication or authorization. Anyone who opens the app can view, add, edit, and delete entries.
- Backend: Motoko with SalesEntry CRUD + getDashboardStats.
- Frontend: React SPA with tab navigation (Dashboard / All Entries / Add Entry).

## Requested Changes (Diff)

### Add
- **Login page**: Internet Identity (ICP wallet) login gate. Users must authenticate before accessing any app content.
- **User management / Settings page** (admin-only): Admin can see all registered users and assign per-user permissions from a checklist: Read, Write (edit), Add, Delete.
- **Permission enforcement on frontend**:
  - If a user does not have Read permission → show "Access Denied" message.
  - If a user does not have Add permission → hide/disable "Add Entry" nav item and form.
  - If a user does not have Write permission → hide Edit buttons in All Entries.
  - If a user does not have Delete permission → hide Delete buttons in All Entries.
- **Admin role**: The first principal to log in is designated admin (or the canister deployer). Admin always has all permissions and cannot be downgraded.
- **User registration**: On first login, users are automatically registered with Read-only access by default. Admin then grants additional permissions via Settings.
- **Settings nav item** (visible to admin only): Shows user list with permission toggles.
- **Logout button** in the header.

### Modify
- `main.mo`: Add user/permission management functions alongside existing SalesEntry functions.
  - `registerUser()` — called on first login, registers the caller principal.
  - `getMyPermissions()` → returns `{read, write, add, delete}` for the caller.
  - `getAllUsers()` → admin only, returns list of `{principal, permissions}`.
  - `setUserPermissions(principal, {read, write, add, delete})` → admin only.
  - `isAdmin()` → returns bool for caller.
  - Existing SalesEntry functions: guard addEntry, updateEntry, deleteEntry behind permission checks.
- `App.tsx`: Wrap entire app in auth gate. Add Settings tab (admin-only). Add logout. Pass permissions down to pages.

### Remove
- Nothing removed from existing functionality.

## Implementation Plan
1. Select `authorization` Caffeine component.
2. Regenerate Motoko backend with user/permissions tables + all existing SalesEntry logic.
3. Update `App.tsx`:
   - Auth gate using `useAuth` hook — show Login page if not authenticated.
   - On login, call `registerUser()` and `getMyPermissions()`.
   - Add Settings tab in nav (admin only).
   - Add logout button in header.
   - Pass permissions as context/props to child pages.
4. Create `pages/Login.tsx` — simple centered card with Internet Identity login button.
5. Create `pages/Settings.tsx` — user table with checkboxes for Read/Write/Add/Delete per user; save via `setUserPermissions`.
6. Update `pages/Entries.tsx` — hide Edit/Delete buttons based on permissions.
7. Update `pages/AddEntry.tsx` — block access if no Add permission.
8. Update `pages/Dashboard.tsx` — block access if no Read permission.
