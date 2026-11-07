# Application Architecture — Godswheel Frontend

This document records where each kind of code belongs and which
library is responsible for what, so new features land in the right place.

---

## 1. High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 (App Router)                  │
│                                                               │
│  app/            → routing & layout composition only         │
│  features/*      → business logic, one folder per domain     │
│  shared/         → design-system UI, layouts, PWA, hooks     │
│  lib/            → cross-cutting infra (store, api, security,│
│                     offline, validation, env)                │
└─────────────────────────────────────────────────────────────┘
        │                         │                    │
        ▼                         ▼                    ▼
  Redux store              IndexedDB (idb)       Service Worker
  (RTK Query for           encrypted draft         (PWA shell,
  server state +           persistence             installability,
  RTK slices for                                   offline page)
  client state)
        │
        ▼
  REST API (versioned /v1)
```

The frontend is a decoupled client talking to the backend's REST API. Anything
security-sensitive is decided server-side; the frontend renders what the
server says.

---

## 2. Folder structure

```
godswheel-frontend/
├── .env.example
├── docs/
│   └── APPLICATION_ARCHITECTURE.md     # this document
├── next.config.ts                      # static security headers, optional /v1 API proxy
├── package.json
├── playwright.config.ts
├── vitest.config.ts / vitest.setup.ts
├── scripts/
│   └── run-with-port.mjs               # lets PORT in .env.local drive `next dev/start`
├── public/
│   ├── manifest.webmanifest            # PWA manifest
│   ├── sw.js                           # hand-written service worker
│   └── icons/pwa/                      # PWA icons (placeholder wheel — replace with the real logo)
└── src/
    ├── proxy.ts                        # edge-level auth guard + per-request CSP nonce
    ├── app/                            # routing & layout only — no business logic
    │   ├── (public)/                   # route group that registers the service worker
    │   │   ├── layout.tsx              # PwaRegister + PwaInstallBanner + manifest link
    │   │   └── page.tsx                # "/"
    │   ├── offline/                    # page the service worker serves when offline
    │   ├── layout.tsx                  # root layout, fonts, <Providers>
    │   ├── providers.tsx               # Redux <Provider> + toast container
    │   ├── error.tsx / global-error.tsx / not-found.tsx / loading.tsx
    │   └── globals.css                 # Tailwind v4 theme tokens
    │
    ├── features/                       # business logic, one folder per domain
    │   └── auth/                       # template for every feature:
    │       ├── api/                    #   RTK Query api slice (createApi + baseQuery)
    │       ├── components/             #   feature-specific components
    │       ├── hooks/                  #   feature-specific hooks
    │       ├── schemas/                #   Zod schemas for the feature's forms
    │       └── types.ts                #   request/response types
    │       (optional: store/ for RTK slices, lib/ for helpers, steps/ or pages/ for screens)
    │
    ├── shared/
    │   ├── ui/                         # design-system primitives (button, card, loaders, error-state…)
    │   ├── layouts/                    # page chrome shared across features
    │   ├── pwa/                        # PwaRegister, PwaInstallBanner
    │   └── hooks/                      # useDebouncedValue, useAutosaveDraft, useOnlineSync
    │
    ├── lib/
    │   ├── store/                      # configureStore, typed hooks, clearUserData
    │   ├── api/                        # baseQuery (credentials, CSRF, 401 event), API tags, error normaliser
    │   ├── security/                   # AES-GCM crypto, per-session key
    │   ├── offline/                    # idb schema (draftDb), reconnect sync queue
    │   ├── validation/                 # shared Zod primitives (email, phone, names…)
    │   ├── utils/                      # cn()
    │   └── env.ts                      # Zod-validated env vars
    │
    ├── types/                          # types generated from the backend OpenAPI spec (pending)
    └── test/
        └── e2e/                        # Playwright specs
```

Unit tests sit next to the file they test as `*.test.ts(x)`.

---

## 3. Core stack

| Layer | Library / Tool | Responsibility |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | Routing, SSR/CSR rendering, type safety |
| Styling | Tailwind CSS v4 | Design-token-driven styling (`src/app/globals.css`) |
| Server state | Redux Toolkit — **RTK Query** | Fetching and caching all API data |
| Client state | Redux Toolkit — **slices** | UI-only state that isn't owned by the server |
| Forms | React Hook Form | Form state, field registration, submit handling |
| Validation | Zod | Schema validation and TS type inference |
| Accessibility | Radix UI + axe-core | Accessible-by-default primitives, automated a11y checks |
| Local DB | `idb` (IndexedDB wrapper) | Offline draft storage |
| PWA shell | Service Worker + Web App Manifest | Installability, offline page |
| Encryption | Web Crypto API (AES-GCM) | Encrypting user data before it touches IndexedDB |
| Testing | Vitest + Testing Library, Playwright | Unit and end-to-end tests |

---

## 4. How to add things

### A new feature

1. Create `src/features/<name>/` with the folders from the `auth` template.
2. Write its api slice in `api/<name>Api.ts` with `createApi({ reducerPath, baseQuery, tagTypes, endpoints })`.
   Add any new tag names to `src/lib/api/apiTags.ts`.
3. Register the slice in `src/lib/store/index.ts` (reducer **and** middleware), and reset it in
   `src/lib/store/clearUserData.ts` if it holds per-user data.
4. Add route folders under `src/app/` that import the feature's components. Pages stay thin.
5. If the area needs a signed-in user, add its prefix to `PROTECTED_PREFIXES` in `src/proxy.ts`.

### Offline drafts (local DB)

- `useAutosaveDraft(id, formValues)` debounces changes and writes an encrypted copy to IndexedDB.
- `useOnlineSync(saveDraft)` flushes unsynced drafts to the server whenever the browser comes back
  online. Pass it a stable callback that calls an RTK Query mutation's `.unwrap()`.
- Drafts are encrypted with a per-session key held in `sessionStorage`. Call
  `generateDraftEncryptionKey()` after sign-in; until then nothing is written locally.
  `clearUserData()` wipes the key and the drafts on sign-out.

### Theme

The brand is dark-only: `<html>` always carries the `dark` class, so every `dark:` variant applies.
Tokens live in `src/app/globals.css`:

| Token | Hex | Use |
|---|---|---|
| `brand-500` | `#EA6134` | Primary actions, tags, active icons (full `brand-*` scale available) |
| `bg-brand-gradient` / `text-brand-gradient` | `#EF7034 → #FA9631` | Highlight cards, the "Wheel" wordmark |
| `gold-500` / `gold-100` | `#EC991C` / `#F7EAB9` | Logo wheel / dove cream |
| `background` | `#161312` | Page background (= `gray-950`) |
| `surface` / `surface-raised` | `#211F1D` / `#2D2B29` | Inputs, cards / buttons on surfaces (= `gray-900` / `gray-800`) |
| `border` | `#393533` | Dividers, outlines (= `gray-700`) |
| `foreground` / `muted` | `#F7F1EB` / `#A89C93` | Primary / secondary text (= `gray-50` / `gray-400`) |

Prefer the semantic names (`bg-background`, `text-muted`…) in new code.

### PWA

- The service worker registers only under the `(public)` route group layout. Put a route there to
  have it registered.
- In dev the service worker is off; run `npm run dev:pwa` to test it.
- Bump `CACHE_VERSION` in `public/sw.js` to drop old caches after a shell change.

---

## 5. Security baseline

| Concern | How it's addressed |
|---|---|
| Session | httpOnly cookie set by the backend, sent with `credentials: "include"`; never stored in JS |
| CSRF | `baseQuery` copies the `godswheel_csrf` cookie into an `X-CSRF-Token` header |
| Script injection | Strict `script-src` CSP with a fresh per-request nonce from `src/proxy.ts` |
| Framing, MIME sniffing, HSTS | Static headers in `next.config.ts` |
| Data at rest in the browser | AES-GCM encryption of every IndexedDB draft |
| Session expiry | Any non-auth 401 dispatches `godswheel:unauthorized` on `window` for a session watcher to handle |
