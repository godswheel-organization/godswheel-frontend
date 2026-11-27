# GodsWheel email templates

These are the transactional emails the GodsWheel API sends. The frontend doesn't send email. These files sit here so the emails match the app's design and its routes. Each email has an HTML version and a plain-text version. Send both as a `multipart/alternative` message, because it helps deliverability and some readers only show text.

| Template | Subject | Sent when | Main link |
|---|---|---|---|
| `verify-email` | Confirm your email for GodsWheel | `POST /auth/signup`, and again on `POST /auth/resend-verification` | `{{verification_url}}` |
| `reset-password` | Reset your GodsWheel password | `POST /auth/forgot-password` (only when a verified account exists) | `{{reset_url}}` |
| `password-changed` | Your GodsWheel password was changed | after `POST /auth/reset-password` succeeds | `{{app_url}}/sign-in` |
| `welcome` | Welcome to GodsWheel | after `POST /auth/verify-email` succeeds (the account is active from then on) | `{{app_url}}/home` |

## Placeholders

The templates use `{{name}}` placeholders. Map them to your templating engine (for EEx, `{{first_name}}` becomes `<%= @first_name %>`). **HTML-escape every value**, because names and emails come from users.

| Placeholder | Value | Example |
|---|---|---|
| `{{app_url}}` | The frontend's origin, with no trailing slash | `https://godswheel-frontend.vercel.app` |
| `{{first_name}}` | The first word of the user's `full_name` | `Chisom` |
| `{{email}}` | The address the email is sent to | `chisom@example.com` |
| `{{verification_url}}` | `{{app_url}}/verify-email?token=<token>` (the frontend page that calls `POST /auth/verify-email`) | `https://…/verify-email?token=abc123` |
| `{{reset_url}}` | `{{app_url}}/reset-password?token=<token>` (the page that will call `POST /auth/reset-password`) | `https://…/reset-password?token=abc123` |
| `{{link_expiry}}` | How long the link stays valid, in words | `24 hours` |
| `{{changed_at}}` | When the password changed, readable and with a time zone | `20 November 2026 at 14:05 (WAT)` |
| `{{year}}` | The current year | `2026` |

URL-encode the token before you put it in the query string.

## Design notes

- **Light by default.** The emails use a cream page, a white card, a navy header and a sunrise button, because that's legible in every client, including Gmail, which ignores dark-mode styles. Clients that support `prefers-color-scheme` (Apple Mail, iOS Mail, Outlook for Mac) get the app's navy look instead.
- **Layout.** The layout uses tables and inline styles, and is at most 560px wide. On phones the card goes full width.
- **The button** is "bulletproof": a styled link for most clients, plus VML for Outlook on Windows. The full URL is also printed under the button, so the email still works when images or styles are blocked.
- **The logo** loads from `{{app_url}}/icons/pwa/icon-192x192.png`. When images are blocked, the "GodsWheel" wordmark next to it still shows.
- **Inbox preview.** Each email has hidden preview text (the line under the subject in the inbox list).
- **Welcome email timing.** Send it once, on the first successful verification, not at sign-up: sign-up already sends `verify-email`, and the account can't be used until it's verified. Its category links use six of the API's categories (`/sermons?category=<slug>`, slugs from `GET /categories`). If a category is renamed or removed in the API, update its link here. (Old `?topic=` links from emails already sent still work: the app sends each old topic to its closest category.)
- **Footer.** No unsubscribe link: these are transactional emails that only go out because of something the user did.
