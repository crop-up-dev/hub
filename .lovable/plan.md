

## Plan: Auth Pages + Admin Panel (localStorage-based)

### Overview
Build a frontend-only authentication system using localStorage, with Sign Up, Login pages, and an Admin panel. All data stays in the browser -- no real backend security, purely for demo/prototype purposes.

### New Files

1. **`src/lib/auth.ts`** -- Auth utilities
   - `User` interface: `id`, `email`, `password` (hashed with simple base64 for demo), `displayName`, `role` (`user` | `admin`), `createdAt`, `isActive`
   - `USERS_KEY` and `SESSION_KEY` localStorage keys
   - Functions: `register()`, `login()`, `logout()`, `getCurrentUser()`, `getAllUsers()`, `updateUser()`, `toggleUserActive()`
   - Seed a default admin account: `admin@hub.com` / `admin123`

2. **`src/pages/Login.tsx`** -- Login page
   - Dark themed form matching the trading UI aesthetic
   - Email + password fields, "Login" button, link to Sign Up
   - Validates credentials against localStorage users
   - Redirects to `/` on success, shows error toast on failure

3. **`src/pages/SignUp.tsx`** -- Registration page
   - Display name, email, password, confirm password fields
   - Client-side validation (email format, password match, min length)
   - Creates user with `role: 'user'`, redirects to login on success

4. **`src/pages/Admin.tsx`** -- Admin dashboard
   - Only accessible when logged-in user has `role: 'admin'`
   - **Users table**: list all registered users with columns: name, email, role, joined date, status (active/inactive)
   - **Actions per user**: toggle active/inactive, change role, delete user
   - **Stats cards** at top: total users, active users, new users (last 7 days)
   - Back button to return to trading dashboard

5. **`src/components/ProtectedRoute.tsx`** -- Route guard component
   - Checks `getCurrentUser()` -- if not logged in, redirect to `/login`
   - Optional `adminOnly` prop that also checks role

### Modified Files

6. **`src/App.tsx`** -- Add routes
   - Add `/login`, `/signup`, `/admin` routes
   - Wrap `/`, `/profile`, `/wallet`, `/admin` in `ProtectedRoute`
   - Admin route uses `ProtectedRoute adminOnly`

7. **`src/components/trading/ProfileDropdown.tsx`** -- Add admin + logout
   - Add "Admin Panel" menu item (only visible if user role is admin)
   - Change "Reset Account" to "Logout" which calls `logout()` and redirects to `/login`

8. **`src/lib/profile.ts`** -- Link profile to auth user
   - On login, auto-create/load profile keyed by user ID

### Technical Details

- Passwords stored with simple btoa() encoding (demo only, not secure)
- Session stored as user ID in localStorage under `hub-session`
- Users array stored in localStorage under `hub-users`
- Admin panel uses existing `Table` component from `src/components/ui/table.tsx`
- Forms use existing `Input`, `Button`, `Label` components
- All pages follow the dark trading UI theme with `glass-panel` styling

