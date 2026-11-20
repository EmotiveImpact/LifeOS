# life web preview

A password-protected web copy of the app with Ama's sample life, for tapping through on a phone's browser.
Vercel builds it from `apps/mobile` with `EXPO_PUBLIC_SAMPLE_DATA=1 npx expo export --platform web`.

- Vercel project: `life-preview` (root directory `deploy/web-preview`, not linked to pushes; deploy on request).
- Password: the `PREVIEW_PASSWORD` environment variable on that project. `middleware.js` checks it on every request.
- Search engines are told not to index it (`X-Robots-Tag`).

The web copy can't use HealthKit, the camera scanner, on-device AI or the phone's voice, and its data lives only in
that browser. Real accounts start empty; this preview only ever shows the sample life.
