# Godswheel — Frontend

A mobile-first Progressive Web App built on the same stack and folder
structure as the JAMB Registration Portal frontend.

See [docs/APPLICATION_ARCHITECTURE.md](docs/APPLICATION_ARCHITECTURE.md) for
where each kind of code goes and why.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Redux Toolkit + RTK Query (server state), Redux slices (client state)
- **Forms/validation:** React Hook Form + Zod
- **UI primitives:** Radix UI-based component library (`src/shared/ui`)
- **Offline:** IndexedDB (`idb`) with client-side AES-GCM encryption, PWA via a hand-written `public/sw.js` (Turbopack build, no Workbox/Serwist)
- **Testing:** Vitest + Testing Library (unit), Playwright (end-to-end)

## Prerequisites

- Node.js 22+ and npm
- Access to the backend API (or a mock/staging URL) for `NEXT_PUBLIC_API_BASE_URL`

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or whatever `PORT` is set to in `.env.local`).

## Environment variables

See [.env.example](.env.example) for the full list. `src/lib/env.ts` validates
them at boot and fails fast if any are missing or malformed:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend REST API |
| `NEXT_PUBLIC_SESSION_COOKIE_NAME` | Session cookie name, read by `src/proxy.ts` to guard protected routes |
| `NEXT_PUBLIC_ENABLE_PWA` | Dev-only PWA toggle. The PWA is always on in production; in dev, use `npm run dev:pwa` instead of setting this |
| `API_PROXY_TARGET` | Optional. Forwards `/v1/*` to the backend so the browser sees one host (for host-only cookies) |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run dev:pwa` | Dev server with the service worker enabled |
| `npm run build` | Production build |
| `npm run start` | Serve a production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | End-to-end tests (Playwright), builds and serves the app first |

## Project structure

```
src/
├── app/          # routing & layouts only — no business logic
├── features/     # business logic, one folder per domain
├── shared/       # design-system UI, layouts, PWA, cross-feature hooks
├── lib/          # store, api client, security, offline (local DB), validation, env
├── test/e2e/     # Playwright specs
├── proxy.ts      # edge auth guard + per-request CSP nonce
└── types/        # generated backend API types (pending)
```
