# Architecture

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Runtime / build | React 18 + `react-scripts` 5 (CRA) | No SSR, no custom Webpack |
| Routing | `react-router-dom` 6 (`BrowserRouter`) | All routes declared in `src/App.js` |
| UI | Bootstrap 5 via `react-bootstrap` | No design system, no CSS modules; `App.css`/`index.css` are near-empty |
| HTTP | `axios` instance in `src/api.js` | Single place for base URL, token, and error extraction |
| Session | JWT in `localStorage` under the key `token` | Payload decoded client-side; no refresh flow |
| State | Component state only | No Redux/Zustand/React Query; every page fetches on mount |
| Tests | CRA/Jest + Testing Library | One smoke test today |

Dev server runs on **3001** (`.env` → `PORT`), because the API owns 3000.

## Module map

| Path | Responsibility |
|---|---|
| `src/index.js` | React root, imports Bootstrap CSS, renders `<App />` in StrictMode |
| `src/App.js` | `<Router>`, top navbar, all route declarations |
| `src/api.js` | axios instance (`REACT_APP_API_URL`), request interceptor (attach bearer), response interceptor (`401` → clear token + `/login`), `getErrorMessage()` |
| `src/auth.js` | `getToken()`, `getUser()` (decode + `exp` check), `isAdmin()`, `logout()` |
| `src/components/PrivateRoute.js` | Auth guard: no valid token → `<Navigate to="/login" />` |
| `src/components/Login.js` | `POST /login` → store token → `/dashboard` |
| `src/components/Register.js` | `POST /register` (username, password, ETH address) → `/login` |
| `src/components/Dashboard.js` | `GET /api/wallet/balance`; wallet card, gallery shortcut, admin card |
| `src/components/Gallery.js` | `GET /api/nfts`; cards with mint status; Admin "Mint" button → `POST /api/nfts/mint` |
| `src/components/NFTForm.js` | Create (`POST /api/nfts`, multipart) and edit (`PUT /api/nfts/:id`) in one component |
| `src/components/Logout.js` | Clears the token (also reachable as `/logout`) |

## Routing

| Path | Guard | Component |
|---|---|---|
| `/login` | public | `Login` (also the default route for `/` and unknown paths) |
| `/register` | public | `Register` |
| `/logout` | public | `Logout` |
| `/dashboard` | `PrivateRoute` | `Dashboard` |
| `/nfts` | `PrivateRoute` | `Gallery` |
| `/nfts/new` | `PrivateRoute` (+ role gate `📋`) | `NFTForm` (create) |
| `/nfts/:id/edit` | `PrivateRoute` (+ role gate `📋`) | `NFTForm` (edit) |
| `/users` 📋 | `PrivateRoute` + SuperAdmin | `Users` — user status table |

Current behaviour: `/nfts/new` and `/nfts/:id/edit` are reachable by *any*
logged-in user; only the backend rejects the request (`403`). The role gate that
hides the page itself is part of the RBAC phase.

## Auth and token flow

```
Login form ──POST /login──► { token }
   │                          │
   └── localStorage.token ◄───┘

any request ──axios interceptor──► Authorization: Bearer <token>

response 401 ──axios interceptor──► localStorage.removeItem('token')
                                     window.location = '/login'
```

- `getUser()` decodes the JWT payload without verification (the server does the
  real check) and treats an expired `exp` as logged out.
- Because the role lives in the token, a role change takes effect only after the
  next login (token TTL is 1 h).
- The redirect is skipped when the browser is already on `/login`, which avoids
  a redirect loop on a failed login attempt.

## API layer

`src/api.js` is the only place that knows the backend URL. Conventions:

- `baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000'`
- `getErrorMessage(err, fallback)` turns the backend's error shapes into one
  string the UI can render:
  `400 {"error":"Invalid input","details":[...]}` → `details.join(', ')`;
  otherwise `error`; otherwise `fallback`.
- Pages do not catch-and-alert; they store a message and render `<Alert>`.

Every page owns its loading/error state (`useState`), which is why there is no
global store yet — and why each list page refetches after a mutation.

## Error and empty states

| Situation | UI |
|---|---|
| Request fails | `<Alert variant="danger">` with `getErrorMessage()` |
| Loading | Bootstrap `<Spinner>` |
| Empty gallery | "No NFTs yet" card (`Gallery.js`) |
| Not authorised (backend `403`) | Error alert — no dedicated 403 page yet (`⚠️`) |
| Unknown route | Falls through to `/` → login screen |
| Invalid JWT stored | `getUser()` returns `null` → `PrivateRoute` sends to `/login` |

## Constraints

| Item | Note |
|---|---|
| CRA is unmaintained | `react-scripts` 5 prints a `babel-preset-react-app` notice; migrating (Vite/Next) is a separate project |
| No TypeScript | All files are `.js` with runtime-only validation |
| No ownership model in UI | Gallery shows global NFTs with no "mine" concept — the API has no `uploadedBy` |
| No pagination | `GET /api/nfts` / `GET /api/users` return everything; the UI renders all |
| Port coupling | Frontend port must match the backend's `CORS_ORIGIN` |
