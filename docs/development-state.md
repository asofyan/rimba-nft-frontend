# Development State

Snapshot date: **2026-10-26** · Node 22.23 · `react-scripts` 5.0.1 · React 18.3

## Phases

| Phase | Scope | Status |
|---|---|---|
| 0 | CRA scaffold, Bootstrap, base layout | ✅ done |
| 1 | Login / register / logout, token storage, navbar | ✅ done |
| 2 | Auth guard (`PrivateRoute`), dashboard, wallet balance card | ✅ done |
| 3 | Gallery + mint action, NFT create/edit form | ✅ done |
| 4 | Central axios layer (`src/api.js`), friendly error messages, smoke test | ✅ done |
| 5 | 3-tier roles in UI (`hasRole`/`canSell`/`isSuperAdmin`), Users page with user status | 🚧 in progress |
| 6 | Marketplace UI: bid, buy, transfer | 📋 planned |

## What works today (verifiable)

```bash
CI=true npm test -- --watchAll=false   # 1 smoke test: login heading renders
npm run build                          # production bundle in build/
npm start                              # http://localhost:3001
```

Manual check that requires a running backend: login as `admin`, open Gallery →
"Upload NFT" appears, mint an asset, dashboard shows the ETH balance.

## Known gaps / backlog

| # | Gap | Impact | Sketch of a fix |
|---|---|---|---|
| 1 | No Users page | SuperAdmin cannot see other users' status in the UI | `Users.js` + `GET /api/users/status` (in progress) |
| 2 | Role gate only in the backend | `/nfts/new` is reachable by any logged-in user (403 on submit) | `PrivateRoute roles={[...]}` |
| 3 | No bid/buy/transfer UI | Store cannot trade | Blocked by backend contract work (Phase 6) |
| 4 | No "my NFTs" | Gallery is global; no ownership shown | Needs `uploadedBy` in the API |
| 5 | No pagination / search | Renders every NFT | `?page&limit` + filters once the API supports it |
| 6 | Token expiry mid-session is abrupt | User is redirected to `/login` and loses context | Interceptor message or refresh token |
| 7 | No error boundary | A render error blanks the page | Class component boundary around routes |
| 8 | CRA is unmaintained | No security patches for the toolchain | Migrate to Vite (separate project) |
| 9 | `Logout.js` unused `React` import | Harmless eslint warning on build/test | Remove the import when touching the file |
| 10 | No per-page tests | Only the login smoke test exists | Testing Library cases per component with mocked `axios` |

## Decision log

Newest first.

**2026-10-26 — Capability helpers (`canSell()`) instead of comparing role strings at call sites.**
Adding a third role would otherwise mean editing every `role === 'Admin'` check.
Capability helpers keep the call sites stable when the role model changes.

**2026-10-26 — Role guards redirect to `/dashboard`, they do not render a 403 page.**
Fewer states to design and test; a wrong-role deep link quietly lands the user
somewhere useful. Revisit if operators ask for an explicit "not allowed" screen.

**2026-10-26 — Keep the JWT in `localStorage`, no refresh token.**
Simple for a local demo; the trade-off is XSS exposure and a hard 1 h expiry
boundary. A cookie-based session belongs to a later security pass.

**2026-10-26 — No state library yet.**
Pages fetch on mount and refetch after mutations. With ≤ 3 screens this is less
code than React Query's cache plumbing; revisit when bid/buy introduce
cross-page state.

## How to continue

1. Read [architecture.md](architecture.md) for routes and data flow.
2. Check the backend contract for the endpoint you need in
   `../backend/docs/api.md` — do not invent payloads.
3. Implement, then update: this file (status + decision), `architecture.md`
   (route/module), `roles-and-ui.md` (visibility).
4. Verify with `CI=true npm test -- --watchAll=false` and `npm run build`
   before committing.
