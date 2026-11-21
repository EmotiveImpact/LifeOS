# Launch documents

Phase 31's drafts for beta and launch. Every one is grounded in what the app and the API actually do, as of 21 November 2026. Words in [square brackets] are for the owner to fill in, and the legal documents need a lawyer's review before they are published.

| Document | What it is | Needs |
|---|---|---|
| [privacy-policy.md](privacy-policy.md) | What Life does with personal data, in plain words | Legal review; company details; processors confirmed |
| [terms.md](terms.md) | The agreement with people who use Life, including the subscription and Apple's required terms | Legal review; trial length; billing |
| [dpia.md](dpia.md) | Data protection impact assessment, on the ICO's template | Owner sign-off, with the backup decision (risk 3) |
| [record-of-processing.md](record-of-processing.md) | Article 30 record, with the processor list | Processors and agreements confirmed |
| [store-privacy.md](store-privacy.md) | Apple App Privacy answers, Google Data safety, Health Connect declarations | Zero data retention in place |
| [app-review-notes.md](app-review-notes.md) | Notes for Apple's and Google's reviewers, and where Life stands on each store rule | Contact details; billing |
| [store-listing.md](store-listing.md) | Name options, descriptions, keywords and the screenshot plan | Store name and trademark check |
| [support.md](support.md) | The support page | Addresses; trial length |
| [beta-plan.md](beta-plan.md) | Builds, testers, what we learn, schedule and the bar for launch | The P0 fixes |
| [fix-list.md](fix-list.md) | Everything known between here and launch, by priority | Kept up to date through the beta |

## One source, three places

The privacy policy, terms and support page are written once, here. `bun apps/site/build.ts` turns them into the website's pages (`apps/site/public`) and the text under You, Settings, About in the app (`apps/mobile/src/content/legal.ts`). `tests/launch/site.test.ts` fails if they drift apart, and also checks that:

- every Health Connect permission the app asks for is declared in store-privacy.md;
- every outside service the API can be set up for is named in the privacy policy;
- the HealthKit text quoted for reviewers is the one the app ships;
- the database stays out of device backups, as the policy says;
- web account deletion makes the same calls as the app;
- the documents keep the house style (no em or en dashes).

## Store screenshots

`apps/mobile/scripts/store-shots.cjs` captures the app's own screens from the release web build with the sample life and frames them at App Store and Play sizes. The current set is in `review/phase-31/store/`.
