# Life's website

A small static site: a home page with the beta address, the privacy policy, the terms, support, and account deletion on the web (Google Play requires a way to delete an account without the app). No framework, no web fonts, no trackers, no cookies.

```
public/
  index.html      home page (hand-written)
  privacy.html    generated from docs/launch/privacy-policy.md
  terms.html      generated from docs/launch/terms.md
  support.html    generated from docs/launch/support.md
  delete.html     account deletion (hand-written)
  delete.js       the deletion form: emailed code, sign in, POST /account/delete
  site.css        colours from the app's tokens, light and dark
build.ts          writes the generated pages and the app's legal text
```

## Changing a page

Edit the Markdown in `docs/launch/`, then run `bun apps/site/build.ts` from the repository root. It also rewrites `apps/mobile/src/content/legal.ts`, so the app shows the same words. `bun apps/site/build.ts --check` (and `tests/launch/site.test.ts`) fails if anything is out of date.

## Before publishing

1. Fill every [placeholder] in the Markdown and in `index.html` and `delete.html`, after legal review, and remove the "Draft" lines.
2. In `delete.html`, set `<meta name="life-api">` to the API's address (it must start with `https://`). Until then the page offers email only.
3. Add the site's address to the API's `TRUSTED_ORIGINS`, so the deletion form may call it.
4. Host `public/` on the domain. Any static host works; with Vercel, a project whose root is `apps/site/public` and no build step. Give the stores `https://<domain>/privacy.html`, `/terms.html`, `/support.html` and `/delete.html` (or set up clean URLs).
