# Maintenance Guide

This is the handoff guide for maintaining Obii Okafor's personal website.

## Current Repo

Use this local repo:

```sh
cd /Users/obiiokafor/Code/obiiokafor.com
```

Do not use the older iCloud-backed folder under:

```sh
/Users/obiiokafor/Documents/codex/obiiokafor.com
```

That folder caused file and Git commands to hang because macOS/iCloud was syncing it.

## GitHub

Remote:

```sh
https://github.com/ObiiOkafor/obiiokafor.com.git
```

Main branch:

```sh
main
```

Check status:

```sh
git status
```

Pull latest:

```sh
git pull --ff-only
```

Commit changes:

```sh
git add .
git commit -m "Describe the change"
git push origin main
```

Cloudflare Pages deploys automatically from GitHub after pushing to `main`.

## Current Unpushed Local Work

At the time this guide was written, these local changes existed and had not been pushed:

- Book page redesign using the `Page Wash` direction.
- Book cover asset added at `assets/impossible-to-ignore-cover.png`.
- Global dark mode warmed from near-black to espresso/brown.
- Home page dark hero background updated to match the warmer global dark mode.
- Book page Turnstile reverted to the original flexible widget setup.

Before pushing, review locally.

## Local Preview

The site is static HTML/CSS/JS.

Start a local server:

```sh
cd /Users/obiiokafor/Code/obiiokafor.com
python3 -m http.server 8081
```

Open:

```text
http://127.0.0.1:8081/index.html
http://127.0.0.1:8081/book.html
http://127.0.0.1:8081/projects.html
http://127.0.0.1:8081/press-media.html
http://127.0.0.1:8081/contact.html
```

Important: the local Python server previews the front end only. It does not run Cloudflare Pages Functions. The waitlist form can be visually reviewed locally, but the full backend flow should be tested on the deployed Cloudflare site.

## Main Files

- `index.html`: homepage.
- `hero-studio-config.js`: homepage portrait, copy, CTA labels, links, and light-mode palette.
- `hero-studio.js`: renders the homepage hero and contains the homepage dark-mode palette.
- `hero-studio.css`: homepage hero layout and responsive styling.
- `book.html`: book waitlist page.
- `book.css`: book waitlist page styling.
- `book.js`: book waitlist form submission, loading state, toast messages, and Turnstile theme handling.
- `contact.html`: Stay in Touch form using Formspree.
- `projects.html`: Things I am Building page.
- `press-media.html`: Press and Media page.
- `site-ui.css`: shared header, footer, nav, theme variables, light/dark global palette.
- `site-theme.js`: dark/light mode toggle behavior.
- `functions/api/book-waitlist.js`: Cloudflare Pages Function for book waitlist signups.
- `schema/book_waitlist.sql`: D1 table schema.
- `CLOUDFLARE.md`: shorter Cloudflare setup reference.

## Assets

- `Obii profesh photo.jpg`: homepage portrait.
- `assets/impossible-to-ignore-cover.png`: book cover used on the waitlist page.
- `press-media-assets/`: images used on the Press and Media page.

If replacing the book cover, keep the same filename if possible:

```text
assets/impossible-to-ignore-cover.png
```

That avoids changing HTML.

## Cloudflare Pages

Pages project:

```text
obiiokafor-com
```

Production domains:

```text
obiiokafor.com
www.obiiokafor.com
```

Deployment flow:

```text
GitHub main branch -> Cloudflare Pages -> production site
```

Cloudflare usually starts a deployment automatically after `git push origin main`.

## Book Waitlist Backend

Waitlist page:

```text
/book.html
```

API route:

```text
POST /api/book-waitlist
```

Function file:

```text
functions/api/book-waitlist.js
```

The API does three things:

- Validates the email and optional first name.
- Verifies Cloudflare Turnstile.
- Saves the signup to Cloudflare D1.
- Sends a welcome email with Resend if Resend env vars are configured.

## Cloudflare D1

Database:

```text
book-waitlist
```

Binding:

```text
DB
```

Database ID:

```text
9e76cb29-e828-438c-bb8e-e96c5a5cbbe1
```

Table:

```text
book_waitlist
```

Duplicate handling:

- The table has a unique normalized email column.
- If someone signs up again with the same email, the function should return a friendly already-on-the-list style response rather than creating a duplicate.

## Turnstile

Widget:

```text
book-waitlist
```

Public site key is in `book.html`.

Secret key is stored in Cloudflare Pages environment variables as:

```text
TURNSTILE_SECRET_KEY
```

Current desired Turnstile setup in `book.html`:

```html
data-size="flexible"
```

Do not change this to `compact`. It was tested and looked worse.

## Resend

Resend is used for welcome emails after a waitlist signup.

Expected Cloudflare Pages env vars:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL=contact@obiiokafor.com
```

The domain `obiiokafor.com` has been verified in Resend.

Sender currently intended:

```text
contact@obiiokafor.com
```

If Resend is missing or broken, waitlist signups should still save to D1, but the welcome email may not send.

## Local Env Files

Local secrets live in:

```text
.env.cloudflare
```

Do not commit this file.

It should contain Cloudflare/Resend values needed for CLI work. Keep it local only.

`.gitignore` already excludes local env files.

## Exporting Waitlist Signups

Small-scale/simple option:

- Use Cloudflare dashboard.
- Go to D1.
- Open `book-waitlist`.
- Query/export the `book_waitlist` table.

Useful query:

```sql
SELECT email, first_name, source_page, created_at
FROM book_waitlist
ORDER BY created_at DESC;
```

## Testing Before Push

Minimum visual checks:

```text
http://127.0.0.1:8081/index.html
http://127.0.0.1:8081/book.html
http://127.0.0.1:8081/projects.html
http://127.0.0.1:8081/press-media.html
http://127.0.0.1:8081/contact.html
```

Check both:

- Light mode.
- Dark mode.

Check screen sizes:

- Desktop.
- Tablet-ish narrow browser.
- Mobile-ish narrow browser.

For the book page specifically:

- Cover appears correctly.
- First name and email fields do not overflow.
- Turnstile appears normal, not compact.
- CTA button is visible and usable.
- Footer social icons are circular icons, not text inside circles.

## Testing After Push

After pushing to GitHub, wait for Cloudflare Pages deployment to finish.

Then test:

```text
https://obiiokafor.com/
https://obiiokafor.com/book.html
```

For the waitlist, submit a real test email from the live site. Expected result:

- Signup saved to D1.
- Welcome email sent via Resend.
- User sees a success toast/message.

## Common Gotchas

- Do not edit the old iCloud-backed repo.
- Do not commit `.env.cloudflare`.
- Do not use `git reset --hard` unless Obii explicitly asks for it.
- The local Python server does not run Cloudflare Functions.
- Turnstile can show warnings locally because localhost/file URLs are not the production domain.
- If the book page looks odd on mobile, check `book.css` media queries first.
- If the homepage dark mode looks like a black block, check `hero-studio.js`; it has a separate dark palette from `site-ui.css`.
- If footer icons look wrong, compare the footer markup with `contact.html`.

## Safe Change Workflow

1. Pull latest.

```sh
git pull --ff-only
```

2. Make edits.

3. Preview locally.

```sh
python3 -m http.server 8081
```

4. Check Git diff.

```sh
git diff --stat
git diff
```

5. Commit and push.

```sh
git add .
git commit -m "Update website"
git push origin main
```

6. Verify Cloudflare deployment and live pages.

