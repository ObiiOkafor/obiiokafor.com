# Cloudflare Setup Notes

## Pages project

- Project: `obiiokafor-com`
- Production domains:
  - `obiiokafor.com`
  - `www.obiiokafor.com`

## D1

- Database name: `book-waitlist`
- Binding name: `DB`
- Database ID: `9e76cb29-e828-438c-bb8e-e96c5a5cbbe1`

## Turnstile

- Widget name: `book-waitlist`
- Site key env var: `TURNSTILE_SITE_KEY`
- Secret env var: `TURNSTILE_SECRET_KEY`

## Resend

Expected env vars in Pages project:

- `RESEND_API_KEY` (secret)
- `RESEND_FROM_EMAIL` (plain text or secret)

The Pages Function will still accept signups if these are missing, but the welcome email will be skipped until they are configured.

## Waitlist endpoint

- Route: `POST /api/book-waitlist`
- Function file: `functions/api/book-waitlist.js`

## Waitlist page

- URL: `/book.html`
- Recommended clean route later: `/book`

## Exporting signups later

Use D1 queries against the `book_waitlist` table or export data through the Cloudflare dashboard once entries exist.
