# Roles and UI

Frontend role handling exists **for usability only**. Every permission is
enforced by the API; a user who edits `localStorage` can reveal hidden buttons
but still receives `403` from the backend. Authoritative matrix:
`../backend/docs/rbac.md`.

## Roles

| Role | Source | Meaning |
|---|---|---|
| `SuperAdmin` | seeded (`admin`) | Operator: user administration + everything a seller can do |
| `Subscriber` | seeded (`admin1`…`admin5`) | Seller/member: list assets and mint |
| `Client` | `POST /register` | Read-only participant |

Current code state: two roles only (`Admin` / `Client`) and
`src/auth.js` exposes just `isAdmin()`. The three-tier helpers below are part of
the in-progress RBAC phase.

## What each role sees

| Surface | Client | Subscriber | SuperAdmin |
|---|---|---|---|
| Navbar: Gallery | ✅ | ✅ | ✅ |
| Navbar: Upload | ❌ | ✅ | ✅ |
| Navbar: Users 📋 | ❌ | ❌ | ✅ |
| Dashboard: wallet balance card | ✅ | ✅ | ✅ |
| Dashboard: gallery card | ✅ | ✅ | ✅ |
| Dashboard: upload card | ❌ | ✅ | ✅ |
| Gallery: mint button | ❌ | ✅ | ✅ |
| `/nfts/new`, `/nfts/:id/edit` | ❌ (redirect 📋) | ✅ | ✅ |
| `/users` (status table) 📋 | ❌ (redirect) | ❌ (redirect) | ✅ |

`📋` = designed, not built yet.

## Where the UI is gated

| Concern | File | Mechanism |
|---|---|---|
| Role helpers | `src/auth.js` | `getUser()` decodes the JWT; `hasRole(...)`, `isSuperAdmin()`, `canSell()` derive booleans |
| Navigation | `src/App.js` | `canSell()` → Upload link; `isSuperAdmin()` → Users link |
| Route guard | `src/components/PrivateRoute.js` | `roles` prop; wrong role → `<Navigate to="/dashboard" />` instead of a 403 screen |
| Mint button | `src/components/Gallery.js` | rendered only when `canSell()` |
| Dashboard shortcuts | `src/components/Dashboard.js` | upload/admin card rendered only when `canSell()` |

Design rules that keep this predictable:

1. **One helper per capability**, not per role, at call sites —
   `canSell()` reads better than `role === 'SuperAdmin' || role === 'Subscriber'`
   and survives a future role reshuffle.
2. **Guards redirect, they do not blank out.** A `Client` hitting `/users` lands
   on `/dashboard` with the app intact.
3. **Never assume the UI gate is security.** Anything hidden must also return
   `403` server-side; the RBAC test suite is the proof.
4. **Show the role.** The dashboard prints `user.role` verbatim, which is the
   quickest way to spot a stale token after a role change (re-login required).

## Failure modes to keep in mind

| Symptom | Cause |
|---|---|
| Navbar shows Upload for a Client | Token issued before the role migration, or localStorage edited — re-login |
| User page accessible but every call 403s | UI gate missing; the API is still authoritative (add the gate) |
| Buttons disappear after deploy | Role renamed on the server but the frontend still compares the old string — update `auth.js` |
| Mint visible but fails | Backend contract not deployed (`CONTRACT_ADDRESS`) — not a role problem |
