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
│   └── icons/pwa/                      # PWA icons (placeholder cross — replace with the real logo)
└── src/
    ├── proxy.ts                        # edge-level auth guard + per-request CSP nonce
    ├── app/                            # routing & layout only — no business logic
    │   ├── (public)/                   # marketing landing page "/" (service worker + install banner)
    │   ├── (app)/                      # the app: AppShell (sidebar ≥ md, bottom tabs on phones, mini player)
    │   │   ├── home/                   # "/home" — featured sermon, topics, "For your listening"
    │   │   ├── sermons/                # "/sermons" — Browse: search, topic chips, filter sheet, sort
    │   │   │   └── [id]/               # "/sermons/<id>" — sermon detail (server-rendered via getSermon)
    │   │   ├── search/                 # "/search" — Search: scope chips, results labelled by matched field
    │   │   ├── library/                # "/library" overview; saved/ and history/ sub-pages
    │   │   ├── settings/               # profile, analytics consent, clear history, data export, sign out
    │   │   ├── report/                 # "/report?sermon=<id>" (or general): Report an issue
    │   │   ├── about/                  # About and standards
    │   │   ├── privacy-policy/         # Privacy notice ┐ one LegalScreen, two URLs,
    │   │   └── terms-and-conditions/   # Terms          ┘ switched by a segmented control
    │   ├── (auth)/                     # AuthLayout (form; brand panel beside it ≥ lg)
    │   │   ├── sign-in/
    │   │   ├── sign-up/
    │   │   └── forgot-password/        # never reveals whether an account exists for the email
    │   ├── offline/                    # page the service worker serves when offline
    │   ├── layout.tsx                  # root layout, fonts, <Providers>
    │   ├── providers.tsx               # Redux <Provider> + toast container
    │   ├── error.tsx / global-error.tsx / not-found.tsx / loading.tsx
    │   └── globals.css                 # Tailwind v4 theme tokens
    │
    ├── features/                       # business logic, one folder per domain
    │   ├── landing/                    # landing page sections (Hero, TopicGrid…) + content.ts for all its copy
    │   ├── home/                       # app home sections + content.ts
    │   ├── sermons/                    # sermonsApi, Browse screen, filter sheet, list rows, URL ⇄ filter helpers, mocks
    │   ├── player/                     # player slice, PlaybackEngine (audio or simulated clock), mini + full player
    │   ├── library/                    # saved sermons + listening history (libraryApi), Library screens
    │   ├── notes/                      # notesApi + the note sheet (Tiptap editor, autosave)
    │   ├── bible/                      # bibleApi + the Bible sheet; KJV mock text
    │   ├── settings/                   # settingsApi + the Settings screen
    │   ├── reports/                    # reportsApi, report schema, Report an issue screen (guests allowed)
    │   ├── about/                      # About and standards screen + content.ts (draft copy to review)
    │   ├── legal/                      # Privacy notice + Terms: content.ts (DRAFT, needs legal review) + LegalScreen
    │   └── auth/                       # template for every feature:
    │       ├── api/                    #   RTK Query api slice (createApi + baseQuery)
    │       ├── components/             #   feature-specific components
    │       ├── hooks/                  #   feature-specific hooks
    │       ├── schemas/                #   Zod schemas for the feature's forms
    │       └── types.ts                #   request/response types
    │       (optional: store/ for RTK slices, lib/ for helpers, steps/ or pages/ for screens)
    │
    ├── shared/
    │   ├── ui/                         # design-system primitives: button, form fields, chip, sheet, container…
    │   ├── layouts/                    # SiteHeader/Footer (landing), AppShell + app-nav, AuthLayout, AppTopBar
    │   │   └── app-nav/                # NavPanel (shared by the desktop sidebar and phone ☰ drawer), sidebar collapse
    │   ├── pwa/                        # PwaRegister, PwaInstallBanner
    │   └── hooks/                      # useDebouncedValue, useAutosaveDraft, useOnlineSync
    │
    ├── lib/
    │   ├── store/                      # configureStore, typed hooks, clearUserData
    │   ├── api/                        # baseQuery (credentials, CSRF, 401 event), API tags, error normaliser
    │   │   └── mock/                   # in-browser mock backend (dummy data until the real API exists)
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
Tokens live in `src/app/globals.css`, in two layers.

**Palette** — the eight "Color Style for GodsWheel" swatches, in an `@theme static` block at the top of the
file. This is the only place hex values for brand colours are written; everything else points at it.

| Palette | Hex | Points to it |
|---|---|---|
| `ink` | `#0F1220` | `background`, `gray-950` |
| `navy` | `#1B2036` | `surface`, `gray-900` |
| `dusk` | `#394166` | `border`, `gray-700` |
| `cream` | `#F5F3ED` | `foreground`, `gray-50` |
| `mist` | `#B8BCCB` | `muted`, `gray-300` |
| `sunrise` | `#F28C4B` | `brand-500` (primary buttons, eyebrows, active icons) |
| `cocoa` | `#2A1406` | `on-brand`, `brand-950` (text on orange) |
| `coral` | `#FF797A` | `danger` (form errors, destructive actions) |

**Semantic tokens** — what components should use: `background`, `surface`, `surface-raised` (`#242A45`, between
navy and dusk), `border`, `foreground`, `muted`, `on-brand`, `danger`, plus the full `brand-*` and `gray-*` scales.
`bg-brand-glow` is the soft orange glow behind the hero and call-to-action panels; `font-serif` (Lora) is for
headlines.

To add a colour from the design file, add it to the palette block, then point a semantic token at it if it has a
role. Every palette name is also a utility (`bg-coral`, `text-mist`…).

Prefer the semantic names (`bg-background`, `text-muted`…) in new code. Lay pages out with
`shared/ui/container/Container` (one max width and gutter) and title sections with
`shared/ui/section-heading/SectionHeading`. App URLs come from `src/lib/routes.ts`, never inline strings.

### Dummy data: the mock backend

Until the backend exists, **every API call is answered in the browser** by `src/lib/api/mock`, with data kept
in IndexedDB (database `godswheel-mock-api`). It is switched by `NEXT_PUBLIC_USE_MOCK_API` (on unless set to
`false`), inside `baseQuery`, so the RTK Query slices and every screen are identical in both modes.

- **Demo account:** `ada.okafor@example.com` / `password123`, seeded with saved sermons, listening history and a
  note. New accounts made on the sign-up page work too. The sign-in page shows these details in mock mode.
- **Routes:** each domain has a file in `mock/handlers/` (auth, sermons, library + history, notes, account,
  Bible), answering the same paths the slices call. They double as a draft API contract for the backend team.
- **Resetting:** delete the `godswheel-mock-api` IndexedDB database in DevTools (Application → IndexedDB);
  it is re-seeded on the next request.
- **Tests:** `mock/router.test.ts` runs the handlers against an in-memory store.
- **Switching to the real backend:** set `NEXT_PUBLIC_USE_MOCK_API=false` and point `NEXT_PUBLIC_API_BASE_URL`
  at it. The mock is loaded with a dynamic import, so in that build it sits in an unused chunk that browsers never download.
  `features/sermons/server/getSermon.ts` (server-rendered detail page) still reads the catalogue directly and
  needs its fetch written then.

### Player

- `features/player/store/playerSlice.ts` holds what's playing and where (`positionSeconds`); the seek bar, ±15s,
  mini player and full player all read and write it.
- `PlaybackEngine` (mounted once in the app layout) makes time pass: an `<audio>` element when a sermon has an
  `audioUrl`, otherwise a one-second clock. For signed-in users it saves progress to listening history on start,
  pause, finish and every 15 seconds; that feeds Continue listening and Recently played.
- Guests can listen; saving, sharing and notes open the app-wide account prompt
  (`dispatch(openAccountPrompt("save" | "share" | "note"))`).

### Notes

- **One note per sermon**, at `/notes/:sermonId` (`GET`, `PUT` to create or replace, `DELETE`). A `404` from
  `GET` means "no note yet" and reaches components as `null`.
- **Written like a Medium draft** (`features/notes/components/NoteSheet.tsx`). The sheet opens straight onto the
  note, with no Save, Edit or Add steps. Selecting text shows a format toolbar (bold, italic, heading,
  subheading, quote). Markdown shortcuts work too (`## `, `### `, `> `, `- `, `1. `, `**bold**`). Copy and Delete
  sit in a ⋯ menu.
- **Autosave:** `hooks/useNoteAutosave.ts` saves once typing pauses for a second, flushes on close, and runs
  saves one at a time so they land in order. Erasing everything removes the note.
- **Stored as JSON, never HTML.** A note sends `doc` (the editor's ProseMirror JSON) and `text` (plain text, for
  previews, search and the export). The editor's schema is `lib/noteEditorExtensions.ts`. A doc it can't read,
  or a note from before formatting existed, opens from its `text`. The 5,000-character limit counts the text
  only, not the formatting.

### Sermon browsing

- **The URL is the source of truth for Browse filters** (`?q=&topic=&speaker=&book=&sort=`), translated only by
  `features/sermons/lib/sermonFilters.ts`. Filtered views can be shared and bookmarked, and the landing page's
  topic links open Browse pre-filtered. Changes use `router.replace`, so typing doesn't fill the Back button.
- **One matcher for every search.** `lib/searchSermons.ts` decides whether and where a sermon matches (title,
  then speaker, then scripture, then topic); Browse filtering and the Search tab both use it.
- **The detail page reads through `server/getSermon.ts`**, a Server Component data function wrapped in React
  `cache()`; swap its body for a fetch when the API exists.
- **`sermonsApi` answers from `mocks/sermons.ts` via `queryFn`** until the backend exists. Swap each `queryFn`
  for a `query`; components use the generated hooks and won't change.
- **Shared components must not import from `features/`.** `AppShell` takes the account button and mini player
  as props from `app/(app)/layout.tsx` for that reason.

### Loading states

Content that loads shows a **skeleton in its final shape**, not a spinner: `shared/ui/skeleton/Skeleton`
(blocks, wrapped in a `SkeletonGroup` that screen readers announce once), `SermonListSkeleton` for sermon rows,
and `LibrarySkeletons` for history and the Library overview. `app/(app)/loading.tsx` covers page navigation.
Add a skeleton beside any new list or card that waits on data.

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
