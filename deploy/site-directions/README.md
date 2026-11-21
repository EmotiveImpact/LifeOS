# Life website: three directions (preview)

Working versions of the three website directions from 21 November 2026, so they can be tried on a phone before one is chosen. Static HTML, no build step. Previews only: hidden from search engines, and the waitlist forms don't send or save anything.

- `/a/` Today: light, product-led.
- `/b/` Golden hour: photo-led.
- `/c/` Ten dots: dark, the orb as hero.

Inter is served from `public/assets/fonts` (subset, SIL Open Font Licence). Photographs are the app's own (`apps/mobile/assets/images/v26`), and the phone screens are crops of the store screenshots (`review/phase-31/store/ios`).

Deploys to the Vercel project `life-site-preview` (root `deploy/site-directions`). Pushes don't deploy by themselves.

When a direction is chosen, the real page goes in `apps/site/public/index.html`, beside the privacy, terms, support and deletion pages.
