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
    │   │   ├── home/                   # "/home" — featured sermon, categories, "For your listening"
    │   │   ├── sermons/                # "/sermons" — Browse: search, category chips, filter sheet, sort
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
    │   ├── pwa/                        # PwaRegister, launch splash, install/ (toast, guide, shared install state)
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
- **Routes:** each domain still mocked has a file in `mock/handlers/` (auth, history, account, reports, Bible),
  answering the same paths the slices call. The sermon catalogue, bookmarks, notes and playback progress are the
  live API's, so they have no mock routes. The mocked history, export and reports find sermons through
  `mock/sermonCatalog.ts`: the old mock catalogue by slug id, any real one with the live `GET /sermons/{id}`.
- **Resetting:** delete the `godswheel-mock-api` IndexedDB database in DevTools (Application → IndexedDB);
  it is re-seeded on the next request.
- **Tests:** `mock/router.test.ts` runs the handlers against an in-memory store.
- **Switching to the real backend:** set `NEXT_PUBLIC_USE_MOCK_API=false` and point `NEXT_PUBLIC_API_BASE_URL`
  at it. The mock is loaded with a dynamic import, so in that build it sits in an unused chunk that browsers never download.

### Sign-in and sessions (live API)

- **Live endpoints:** sign-up, resend verification, verify email, login, `/auth/me`, logout, forgot
  password, reset password, change password, log out everywhere (`POST /auth/logout-all`, in Settings), the
  category and speaker lists, the sermon catalogue (`GET /sermons`, `GET /sermons/{id}`, `GET /sermons/{id}/audio`),
  bookmarks (`GET /sermon-bookmarks`, `POST`/`DELETE /sermons/{id}/bookmark`), notes (`GET`/`PATCH
  /sermons/{id}/note`) and playback progress (`GET`/`PUT /sermons/{id}/progress`) call the real GodsWheel API
  (`LIVE_ENDPOINTS` in `lib/api/baseQuery.ts`). Still mocked, for want of endpoints: the listening-history list
  (Recently played, Continue listening), settings (analytics consent), the data export, reports and the Bible
  text. The legal pages keep their own text: `GET /legal/privacy` and `/legal/terms` return placeholders so far.
- **Verify email:** the email's link opens `/verify-email?token=…` (confirm the path with the backend). The page
  spends the single-use token once, deduplicated per token because React runs effects twice in development. It
  then removes the token from the address bar and signs the user in with the returned session. Expired or used
  links (422) and server errors each offer a fresh link.
- **Reset password:** the reset email's link opens `/reset-password?token=…`. The page reads the token once and
  removes it from the address bar, then sends it with the new password only when the user submits. A 422 with
  `details.password` is shown on the password field. Any other 422 means the link can't be used, so the page
  offers a new one from `/forgot-password`. Resetting doesn't sign the user in.
- **Change password** (`/settings/password`): `PUT /auth/change-password` with `current_password` and
  `new_password`, sent with the access token. A wrong current password is a 403, shown on that field, and it doesn't
  end the session. On success this session stays signed in and the API revokes every other one.
- **Through our own domain:** the browser calls `/api/v1/*` on this app, and `next.config.ts` forwards it to the
  API, so calls are same-origin (no CORS).
- **Staying signed in:** the API's access token has no expiry and there's no refresh. Login and verify-email
  return `{ user, accessToken, tokenType, issuedAt }`, which is saved in `localStorage` (`godswheel_session`, in
  `lib/api/auth/accessToken.ts`), so it survives reloads and closing the browser. `baseQuery` sends it as a Bearer
  header. Users stay signed in until they press Sign out (`POST /auth/logout` revokes the token, and the device
  forgets it even if the API can't be reached).
- **Checking the session:** on load, `getSession` asks `GET /auth/me` with the saved token. Only a 401 (the API
  revoked the token, e.g. after a password change on another device) ends the session on this device. Offline or a
  server error keeps the user signed in as saved. A 401 on any other call makes `SessionWatcher` run that check.
- **Guests make no auth calls:** no saved token, no request.
- **Tabs stay in step:** `SessionWatcher` listens for `storage` events, so signing in or out in one tab updates
  the others (and clears per-user data when the person changes).
- **Mock bridge:** mock endpoints use the real signed-in user's id (`mockBaseQuery`), so history, settings and the
  export work for real accounts until those endpoints exist. (The export's saved sermons and notes come from the
  mock, so they're empty now that those live in the API.)
- **`useSession`** reports "loading" until hydration, because the server can't know the session.

### Player

- `features/player/store/playerSlice.ts` holds what's playing and where (`positionSeconds`); the seek bar, ±15s,
  mini player and full player all read and write it.
- `PlaybackEngine` (mounted once in the app layout) makes time pass: an `<audio>` element for the API's sermons,
  a one-second clock for the old mock ones. The audio address comes from `GET /sermons/{id}/audio`, presigned and
  short-lived once storage is private, so a failing address is fetched again (once) and playback carries on
  from the same position. A sermon started from a list also gets its full record merged in, for its passages.
- **Progress:** for signed-in users it's saved on start, pause, finish and every 15 seconds, to the API
  (`PUT /sermons/{id}/progress`, so any device can resume) and to this device's history list (Continue listening,
  Recently played; the API has no list endpoint yet). A sermon started from the top asks `GET
  /sermons/{id}/progress` first and picks up there ("Picking up at 10:00") if the position is past the first 15
  seconds and short of the last 30; nothing is saved until that answer is in, so a save at 0:00 can't erase it.
- Guests can listen; saving, sharing and notes open the app-wide account prompt
  (`dispatch(openAccountPrompt("save" | "share" | "note"))`).

### Notes

- **One note per sermon**, at `/sermons/{id}/note` (`GET`, and `PATCH { content }` to create or replace). The
  API answers `null` for no note, and has no delete: a note is deleted by saving it empty, which reads back as
  no note. The API doesn't keep the moment a note was written at, so notes aren't tied to a time in the sermon.
- **Written like a Medium draft** (`features/notes/components/NoteSheet.tsx`). The sheet opens straight onto the
  note, with no Save, Edit or Add steps. Selecting text shows a format toolbar (bold, italic, heading,
  subheading, quote). Markdown shortcuts work too (`## `, `### `, `> `, `- `, `1. `, `**bold**`). Copy and Delete
  sit in a ⋯ menu.
- **Autosave:** `hooks/useNoteAutosave.ts` saves once typing pauses for a second, flushes on close, and runs
  saves one at a time so they land in order. Erasing everything removes the note.
- **Stored as Markdown, never HTML.** The API keeps a note as one string, so `lib/noteMarkdown.ts` writes the
  editor's document as Markdown (`## `, `### `, `> `, `- `, `1. `, `**bold**`, `*italic*`, `\` line breaks) and
  reads it back. It stays readable as plain text for any other client. The editor's schema is
  `lib/noteEditorExtensions.ts`. The 5,000-character limit counts the text only, not the formatting.

### SEO and link previews

- **Every page's metadata goes through `lib/seo/metadata.ts` (`pageMetadata`)**: title, description, canonical
  URL and preview text. Account pages, search results, sign-in and report are `noIndex: true`.
- **The site address** comes from `lib/seo/site.ts`: `NEXT_PUBLIC_APP_URL`, else Vercel's production domain,
  else the deployment URL. Only the production deployment is indexable; previews and local servers send
  `noindex` and a `Disallow: /` robots.txt.
- **`app/sitemap.ts`** lists the landing page, Browse, each category, every sermon, About and the legal pages.
  **`app/robots.ts`** keeps crawlers out of `/library` and `/settings`.
- **Category pages are pages in their own right:** `/sermons?category=faith-trust` is titled "Faith & Trust sermons" and is its own
  canonical URL. Any other filter combination is `noindex` and points back at `/sermons`.
- **Share images** are drawn with `next/og` (`lib/seo/ogImage.tsx`): `app/opengraph-image.tsx` for the site,
  `sermons/[id]/opengraph-image.tsx` per sermon. A route with its own image passes `ownImage: true`, because
  `openGraph.images` set in config would replace the file's image.
- **Structured data (JSON-LD):** WebSite (with search) and Organization on the landing page, plus an AudioObject
  and breadcrumbs on each sermon (`features/sermons/lib/sermonSeo.ts`).

### Sermon browsing

- **Categories come from the API** (`GET /categories`, every page read). In the browser: `useGetCategoriesQuery`
  (`sermonsApi`), kept for an hour, for Browse's chips, the filter sheet, Search and the sidebar shortcuts. On the
  server: `features/sermons/server/getCategories.ts` for the landing grid, Home's chips, Browse's page titles and
  the sitemap. Pages render per request, which turns off Next's fetch cache, so it keeps the list in memory for an
  hour, times out after 2.5s, and falls back to the last good list. Icons and colours per slug live in
  `lib/categories.ts`, with a fallback for categories the API adds later.
- **Sermons come from the API.** `lib/apiSermon.ts` holds the API's record types and `toSermon()`, which turns
  them into the app's `Sermon`. `GET /sermons` lists summaries (title, speaker, categories, length, date); the
  passages, language, description and audio come only with `GET /sermons/{id}`, so those fields are optional and
  every view copes without them. Sermons carry `categories: { id, slug, name }[]` (the first is the main one).
- **The URL is the source of truth for Browse filters** (`?q=&category=&speaker=&book=&sort=`: category by slug,
  speaker by id, book by name, sort `newest` or `oldest`), translated only by `features/sermons/lib/sermonFilters.ts`.
  `sermonListParams()` turns them into `GET /sermons`'s query (`search`, `category_id` looked up from the
  categories, `speaker_id`, `scripture`, `sort`). Old `?topic=` links (the six pre-API topics) are sent to the
  closest category, and old sorts (`relevance`, `shortest`) to `newest`. Changes use `router.replace`, so typing
  doesn't fill the Back button.
- **Browse pages through the list** with an RTK Query infinite query (`useGetSermonsInfiniteQuery`, 20 a page,
  "Load more"). The speaker filter lists `GET /speakers`; the scripture filter lists all 66 books
  (`lib/bibleBooks.ts`), since the API has no list of the books its sermons cite.
- **The Search tab** (`searchSermons` in `sermonsApi`) runs the API's `search` (titles and descriptions), matches
  speakers by name and filters by their id, and asks the `scripture` filter when the words look like a passage.
  Results say where they matched, title matches first.
- **The detail page reads through `server/getSermon.ts`** (`GET /sermons/{id}` on the server, in React `cache()`):
  404 gives the not-found page, other failures the error page. The mock catalogue's slug ids are still found
  there while the mock is on (saved lists and history may hold them). The same file gives Home and the landing
  page the newest sermons (kept five minutes) and the sitemap every sermon (kept an hour).
- **Playing a sermon from a list:** the player starts with the summary, and `PlaybackEngine` fetches its full
  record (`useGetSermonQuery`) for the passages and its audio address (`useGetSermonAudioQuery`). Audio plays
  from wherever that points (Amazon S3 today), which the CSP allows with `media-src 'self' https:` (`src/proxy.ts`).
- **Saved sermons are the API's bookmarks** (`libraryApi`: every page of `GET /sermon-bookmarks`). The API doesn't
  say when each was saved, so Saved sorts by publish date, after any saved in this session.
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
| Session | Bearer access token (no expiry) saved in `localStorage` until sign-out; kept safe from injected script by the CSP below |
| CSRF | `baseQuery` copies the `godswheel_csrf` cookie into an `X-CSRF-Token` header |
| Script injection | Strict `script-src` CSP with a fresh per-request nonce from `src/proxy.ts` |
| Framing, MIME sniffing, HSTS | Static headers in `next.config.ts` |
| Data at rest in the browser | AES-GCM encryption of every IndexedDB draft |
| Revoked sessions | Any non-auth 401 dispatches `godswheel:unauthorized`; `SessionWatcher` re-checks with `GET /auth/me` |
