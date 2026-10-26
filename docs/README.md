# Frontend Docs

Living documentation for the Rimba NFT Store frontend. The repository root
`README.md` covers *install, config, and first run*; this folder covers *how the
app is built and where it is going*.

| File | Contents | Update when |
|---|---|---|
| [architecture.md](architecture.md) | Stack, module map, routing, auth/token flow, API layer, error handling | A component, route, or data flow changes |
| [roles-and-ui.md](roles-and-ui.md) | What each role sees, where the UI is gated, and why gating is cosmetic | Roles or navigation change |
| [development-state.md](development-state.md) | Phase status, known gaps, decision log, verification commands | Every meaningful change |

## Conventions

- **English**, consistent with the root README.
- **Status markers:** `✅ done` · `🚧 in progress` · `📋 planned` · `⚠️ known gap` · `❌ not implemented`
- **Reference real files** (`src/api.js:18`) so claims stay checkable.
- **Docs ship with the code.** A UI change that makes a doc wrong updates the
  doc in the same commit.
- **Planned ≠ implemented.** No aspirational wording — anything not in the code
  is marked `📋` and tracked in `development-state.md`.
- **The backend is the source of truth for permissions.** When frontend docs and
  API docs disagree about who may do what, `../backend/docs/rbac.md` wins.
