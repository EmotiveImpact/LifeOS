# Phase 24 · The brain: router, models and evals

Branch `phase-24-brain-router`, from `v26-integration` after the calm motion merge. Everything is tested against the real API and Postgres with stand-in models, so no provider was called and no key was needed. It goes live once a provider key is in the host.

## What was built

**The life API's half of the brain** (`apps/api/src/router.ts`)

`POST /ai/run` takes the request the phone already builds. The phone has checked it once; the API trusts none of that and checks it again, in this order:

1. **Distress first.** Self-harm or suicide language, typed or spoken, gets the support signal. No model runs, nothing is filed and nothing is written. Only the level and kinds go back, so the phone shows its own support screen with its own words and numbers.
2. **Private mode.** If the request or the person's own synced settings say private mode, the answer is `PRIVATE_MODE` and no model is called.
3. **Consent.** Either the request's own OK, or a standing OK from the person's synced settings (`prefs.fields.aiConsent`). Grants the request carries itself are ignored. Health details still need an OK that names health. Otherwise `CONSENT_REQUIRED`.
4. **Allowances,** read from the cost ledger, never from memory:
   - calls per tier over a rolling day, and over a rolling 30 days for top;
   - a monthly spending cap.
   - A used-up top tier drops to strong and says so. Anything else used up answers `RATE_LIMITED` before a model is called.
5. **The model** comes from `tiers.json`. A busy, down or refusing provider hands over to the next model in the tier.
6. **The answer is checked** by the brain's own rules: numbers only as `{{fact:id}}`, no claimed actions, proposals grounded in the person's words. A raw £ figure is refused (`INVALID_OUTPUT`). A time-out answers `TIMEOUT` and changes nothing.
7. **Every billed call is written** to `ai_usage` with its job, model, tier, tokens, cost and outcome: `ok`, `rejected` (failed life's checks) or `declined` (refused or cut off). Rejected and declined calls cost money too, so they count.

The answer goes back unrendered, and the phone checks it a second time and fills in the numbers. Response headers `life-model` and `life-tier` say which model answered.

`GET /ai/capabilities` lists which tiers have a model, which job sits in which tier, how many calls the person has left in each, and whether `tiers.json` came from evals. It never shows a key.

**Models** (`apps/api/src/models/`)

There is one adapter per provider, written over plain `fetch` because the plan names no provider SDK:

| Provider | API | Notes |
|---|---|---|
| Anthropic | Messages API, version 2026-10-21 | No sampling settings. `effort` per tier |
| OpenAI | Responses API | `store: false`, so OpenAI keeps no copy. JSON mode. Reasoning effort per tier |
| Google | generateContent | Key in a header, never the URL. Thinking tokens billed as output |

The registry holds your approved trial line-up with list prices. A key in the host switches that provider's models on.

| Tier | Models, in `tiers.json` order |
|---|---|
| Fast (filing, most chat) | Claude Haiku 5.5, GPT-6 Luna |
| Strong (drafts, coaching, lessons, letters) | Claude Sonnet 5.5, GPT-6.2 Sol, Gemini 4 Hydrogen |
| Top (big decisions) | Claude Opus 5.5, Gemini 4 Neon |
| Vision (photos, from Phase 25) | Claude Haiku 5.5, GPT-6 Luna |

`tiers.json` says `"source": "default"`: this order comes from the desk research, not yet from evals. The first eval run with keys rewrites it.

Models answer in JSON text, which the brain checks. Structured outputs can be trialled once the evals can measure the difference.

**The runtime** (`packages/brain`)
- A provider that is down or busy hands over to the next model in the tier. A time-out, a stop or a bad answer ends the request: nothing is retried behind the person's back.
- The server skips life's own rules (`rules: false`), so filing reaches the model. The crisis check always runs.
- Results carry the checked answer before facts are filled in, which is what the API sends back.
- The phone's link to the API is marked as a relay. It may add one line of notice (the top allowance running out) or a support signal. A model's own answer can do neither.
- The phone now tells apart the API's refusals: consent, allowance, private mode, a bad answer and a time-out each get the right words.

**Evals** (`tools/evals/`)
- `extract/cases.jsonl` has 40 filing cases. Some should be filed: rent, age, bills, subscriptions, birthdays, documents, appointments, notes. Others must not be: questions, maybes, the past, someone else's rent, "imagine I earned".
- `ask/cases.jsonl` has 32 questions on Ama's sample life (`ama.json`). Each names the facts the answer must reference, the sources it must cite and words it must not say. Some cases can only be passed by not doing sums.
- A case passes only if the answer first gets through the brain's checks. A filing case also needs every expected proposal and nothing else.
- `bun tools/evals/run.ts` runs every model with a key and scores quality, cost per 100 calls, median time and slowest 10%. It then picks each tier: the cheapest model that passes 90% on every job in that tier wins, and the rest follow as fallbacks. `--write` saves the result to `tiers.json`. Results land in `tools/evals/results/`.

## Eval table

There are no provider keys here, so only life's own rules could run. They are the baseline a model has to beat.

| Model | Job | Passed | Cost per 100 calls | Median time | Slowest 10% |
|---|---|---|---|---|---|
| life's rules (no model) | extract | 35 of 40 (88%) | free | - | - |
| life's rules (no model) | ask | 7 of 32 (22%) | free | - | - |
| Claude Haiku 5.5 | extract, ask | needs `ANTHROPIC_API_KEY` | estimated $0.04 | | |
| GPT-6 Luna | extract, ask | needs `OPENAI_API_KEY` | estimated $0.04 | | |

- **The rules' filing misses** are bills and subscriptions phrased loosely ("Octopus Energy takes £85 every month", "Water bill is £38 a month to Thames Water", two subscriptions in one sentence) and a sister's name.
- **The rules answer 7 questions:** take-home, the next move and things you told it. Everything else needs a model.

Estimated cost of one full run, at list prices, with thinking included:

| Run | Cost |
|---|---|
| Both fast models | about $0.06 |
| Each strong model | about $0.90 |
| Each top model | about $3 |
| All seven models | about $8 |

## For Edem to decide

1. **Keys.** Which providers go in the host: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`. With a fast-tier key I can run the evals (about $0.06), fill in the table above and commit the new `tiers.json`.
2. **Allowances.** The defaults are guard rails, since there's no free tier:

   | Tier | Default |
   |---|---|
   | Fast | 300 a day |
   | Strong | 60 a day |
   | Vision | 30 a day |
   | Top | 20 per 30 days |
   | Spending cap | $5 a month per person |

   The cap sits above the 30% AI budget and below one month's net. The trial's smaller top allowance (for example two) comes with billing.
3. **OpenAI and Google model names** (`gpt-6-luna`, `gpt-6.2-sol`, `gemini-4-hydrogen`, `gemini-4-neon`) follow each provider's naming but are unconfirmed. The first call with a key confirms them; a wrong name just hands over to the next model.
4. **Gemini for real people.** Google Cloud's EU endpoint uses a service account rather than an API key. That needs a small adapter change once you choose it. The Gemini API key is for Ama's trial data only.
5. **SDKs.** The plan names no provider SDK, so the adapters use plain `fetch`. If you'd rather use the official SDKs, add them to `IMPLEMENTATION_REFERENCES.md` and I'll switch.
6. **Muse Ember** (fast tier trial) needs Meta's API or Google Cloud. Its adapter follows that choice.
7. **Where Claude runs.** Anthropic's own API processes data in the US or globally. Claude in the EU means Google Cloud or Amazon Bedrock (from the AI write-up).

## Checks

- **`bun test` with Postgres: 564 pass, 0 fail.** That is 35 new tests:
  - 20 in `tests/api/ai.test.ts`;
  - 9 in `tests/api/evals.test.ts`;
  - 6 in `tests/brain/router.test.ts`.
- **The seven tests the plan names** are all in `tests/api/ai.test.ts`:
  - `a job routes to its tier's model from tiers.json`
  - `private mode returns PRIVATE_MODE and calls no model`
  - `missing consent returns CONSENT_REQUIRED`
  - `an answer containing a raw £ figure not from facts is rejected`
  - `a timed-out model leaves nothing changed`
  - `usage is recorded per user and job`
  - `a voice transcript with self-harm language routes to support`
- **Also covered:**
  - forged grants are ignored, and health needs a health OK;
  - allowances, the top-tier drop and the spending cap;
  - capabilities;
  - each adapter's request shape, refusal handling and token counts;
  - the ledger stays private to each person.
- **Migration** `0004_ai_ledger` adds `tier` and `outcome` to `ai_usage`.
- **Typecheck** is clean for the API and the app. The iOS and Android bundles export.
- **No screenshots:** no screen changed. The phone change is in the words it shows when the API refuses.

## Known limits

- **Filing still happens on the phone.** The phone's own rules handle filing, so filing doesn't reach the API from the app yet. Phase 25 wires Talk, chat, Ask, missions, Teach me and Snap to the real jobs.
- **Photos don't reach a model yet.** Meal photos and scanned letters arrive with Phase 25.
- **Allowance checks aren't locked.** Two requests at the same instant can both use the last call, so the overshoot is a call or two at most.
- **A timed-out call isn't in the ledger,** because the provider never said what it cost.
- **Allowances use rolling windows,** not calendar days in the person's time zone.
