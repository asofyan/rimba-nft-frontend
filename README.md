# Rimba NFT Store — Frontend

Single-page React app (Create React App + React-Bootstrap) for the Rimba NFT
Store API: register/login, wallet dashboard, NFT gallery, and — for Admin users
— asset upload and on-chain minting.

The backend must be running: <http://localhost:3000> (see `../backend/README.md`).

## Stack

| Concern | Tech |
|---|---|
| Runtime | React 18, react-scripts 5 (CRA) |
| Routing | react-router-dom 6 |
| UI | Bootstrap 5 via react-bootstrap |
| HTTP | axios (interceptors for auth + 401 handling) |
| State | component state only, token in `localStorage` |

## Requirements

- **Node.js 20+** (verified on Node 22.23, npm 10.9)
- The backend running and reachable at `REACT_APP_API_URL`
- A port other than **3000** — the backend already uses it

## Quick start

```bash
npm install
npm start        # -> http://localhost:3001
```

That is enough for a default local setup: the shipped `.env` points at
`http://localhost:3000` and runs the dev server on port 3001.

## Configuration

`.env` is committed with working local defaults:

```dotenv
REACT_APP_API_URL=http://localhost:3000
PORT=3001
```

| Variable | Default | Purpose |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:3000` | Backend base URL. No trailing slash. Used by `src/api.js` |
| `PORT` | CRA default `3000` | Dev server port. Keep it non-3000, e.g. `3001` |

Rules that bite:

- Only variables prefixed with `REACT_APP_` reach the browser.
- CRA **inlines** these values at build time. After editing `.env`, stop and
  restart `npm start` (a hot reload is not enough).
- `PORT` from the shell wins over `.env`:
  `PORT=3100 npm start`.
- The backend allow-lists exactly one origin via `CORS_ORIGIN`
  (`http://localhost:3001` by default). If you change the frontend port, change
  `CORS_ORIGIN` in `backend/.env` too, otherwise every request fails with a
  CORS error.

### Connecting to a different backend

```dotenv
REACT_APP_API_URL=https://api.example.com
```

and make sure that API allows this origin.

## Routes

| Route | Access | Screen |
|---|---|---|
| `/login` | public | login form (default route) |
| `/register` | public | sign-up: username, password, ETH address |
| `/logout` | public | clears token, redirects to `/login` |
| `/dashboard` | any logged-in user | username, role, ETH wallet balance, shortcuts |
| `/nfts` | any logged-in user | gallery of all NFTs + mint status; Admin sees a **Mint** button |
| `/nfts/new` | Admin (UI) | upload asset: name, description, image, attributes, bid price |
| `/nfts/:id/edit` | Admin (UI) | edit metadata of an existing asset |

Unknown paths and `/` render the login page.

## First-run walkthrough

1. Start backend + Ganache + MongoDB (see backend README) and seed an Admin:
   `node scripts/createAdmin.js admin admin123 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1`.
2. `npm start` here, open <http://localhost:3001>.
3. Register a normal user (`/register`) — it always becomes a `Client`;
   the ETH address is required and must be a valid address.
4. Log in as the Admin to see the **Upload** tab, add an asset, then press
   **Mint** in the gallery. The tx hash is shown on success.
5. Log in as the Client to confirm the gallery/mint status is read-only
   (no Upload nav item, no Mint button).

## How auth works

- `POST /login` returns a JWT, stored in `localStorage.token`.
- `src/api.js` axios request interceptor attaches `Authorization: Bearer <token>`
  to every call; a response interceptor clears the token and redirects to
  `/login` on `401`.
- `src/auth.js` decodes the JWT payload client-side (`id`, `role`, `username`)
  and treats an expired `exp` as logged out.
- `PrivateRoute` redirects to `/login` when there is no valid token.
- Role checks in the UI (`isAdmin()`) are **cosmetic only** — the API enforces
  RBAC, so a Client calling admin endpoints still gets `403`.

Changing the backend's `JWT_SECRET` invalidates all stored tokens: the app will
bounce you to `/login` (expected).

## Scripts

| Command | What it does |
|---|---|
| `npm start` | dev server with hot reload (port from `.env`) |
| `npm run build` | production bundle in `build/` |
| `npm test` | CRA/Jest watch mode |
| `CI=true npm test -- --watchAll=false` | one-shot test run |
| `npm run eject` | irreversible CRA eject — normally not needed |

## Tests and build

```bash
CI=true npm test -- --watchAll=false
npm run build
```

`src/App.test.js` renders the app and asserts the login heading is shown by
default. Non-fatal CRA warnings you may see in the console:

- `babel-preset-react-app is not maintained anymore` — upstream CRA notice.
- `[eslint] 'React' is defined but never used` in `src/components/Logout.js` —
  harmless lint warning.

## Project layout

```
src/
  api.js               axios instance + auth/401 interceptors, getErrorMessage()
  auth.js              token helpers: getUser(), isAdmin(), logout()
  App.js               router + navbar
  components/
    Login.js           POST /login
    Register.js        POST /register
    Dashboard.js       GET /api/wallet/balance
    Gallery.js         GET /api/nfts, POST /api/nfts/mint (Admin)
    NFTForm.js         POST /api/nfts (upload, multipart), PUT /api/nfts/:id
    PrivateRoute.js    auth guard
    Logout.js          clears token
```

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Page loads but every request fails, console shows a CORS error | backend `CORS_ORIGIN` does not match this origin exactly (protocol + port) — fix `backend/.env` and restart the backend |
| `Network Error` / `ERR_CONNECTION_REFUSED` | backend not running, or `REACT_APP_API_URL` wrong; remember to restart `npm start` after editing `.env` |
| Instant redirect to `/login`, or a redirect loop | token missing/expired, or `JWT_SECRET` rotated on the backend → log in again |
| `401` on login | wrong credentials, or rate limit hit (20 attempts / 15 min; wait or restart backend with `NODE_ENV=test`) |
| Port 3000 already in use, prompt to use another port | the backend owns 3000 — keep `PORT=3001` in `.env` and answer "no" if CRA asks |
| Changed `.env` but nothing happened | CRA inlines env vars; kill the dev server and run `npm start` again |
| Upload fails | Admin only; JPEG/PNG/WebP, max 5 MB; `attributes` must be valid JSON |
| Mint button does nothing / error says contract missing | contract not deployed on the current Ganache run → redeploy (backend README) |
| NFT image broken after restart | local disk storage + `PROJECT_URL` mismatch; images live under the backend's `uploads/` |
