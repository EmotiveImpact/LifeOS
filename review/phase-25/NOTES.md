# Phase 25 · The brain's jobs and memory

Branch `phase-25-brain-jobs`, from `v26-integration` after Phase 24. Everything is tested with stand-in models against the real API and Postgres, so no provider was called. Model answers start once a provider key is in the host.

## What was built

**Memory, our own layer** (`packages/brain/src/memory.ts`)

You chose to own the memory layer, so mem0 isn't installed. Its loop is written in our own TypeScript, and the same code runs on the phone and the life API.

- **A memory** is a short sentence about the person with:
  - a kind (preference, goal, person, pattern, event or fact);
  - its source and how sure life is;
  - the dates it was true (valid-from and valid-to, the Graphiti idea);
  - when it last helped;
  - a health or money flag;
  - a vector.
- **Finding memories for a message** blends three things:
  - how close the meaning is (three quarters of the score);
  - how recently the memory was made or used (fading over about six months);
  - how often it has helped.

  Only the six that fit best, at most, go with a request. A memory that is no longer true is kept, but never used to answer.
- **The memory loop** decides add, merge, close or ignore for each new candidate:
  - the same thing twice is ignored;
  - the same thing in new words is merged;
  - a changed fact closes the old memory and starts a new one, so life can still say "you used to work at the council";
  - health and other memories never merge into each other.
- **Vectors** come from a small built-in embedder (hashed words and word pairs, 256 numbers). It needs no download and works offline and in private mode. Each vector carries the embedder's name, so swapping in a real embedding model later re-embeds instead of mixing vectors. Picking that model is yours (below).

**Memory on the phone** (`apps/mobile/src/services/memory.ts`)
- **Added only from confirmed filings.** When you file what Talk or chat picked out, each detail goes through the loop. Filing the same thing twice adds nothing.
- **"What life remembers":**
  - Tap a memory to correct it. It then says "Edited by you".
  - Swipe to forget. Undo works while you're on the screen; leaving deletes it.
  - Memories that are no longer true show "No longer true".
- **Forgetting deletes.** The memory's words are wiped from the row on the phone, unsent edits are dropped, and the delete syncs.
- **Records and memories.** A memory drawn from a record goes when the record goes.
- **Use counts.** Memories an answer cites count as useful, which lifts them next time.
- **Storage.** A memory's attributes travel in its `source` column and the vector in `embedding`, so phone and server tables didn't change.

**Memory on the server** (`apps/api/src/memory.ts`)
- `GET /memory` lists the person's memories, including closed ones.
- `POST /memory/search` returns the ones that fit a question. Health memories come back only when asked for. Closed and forgotten ones never do.
- **One space per person.** Every read runs under row-level security.
- **Deletes wipe.** A forgotten memory is wiped on the server too: the tombstone keeps only its dates, and the earlier sync ops that carried the words are dropped.

**The jobs** (`packages/brain/src/jobs.ts`)
- **Existing checks, now named tests.** Every job's output check was already in place. The plan's named tests run them end to end through the runtime.
- **New `remember` job** (fast tier) for memory upkeep. A model names up to eight things worth remembering, each quoting the person's own words. It may close a memory that's no longer true. It can't invent numbers. A detail that looks like health is marked health even if the model forgets, so it stays on the phone.

**The offline queue** (`apps/mobile/src/services/aiQueue.ts`, `useAiQueue.ts`)
- **What waits.** No connection, or every model busy, means a request you've already sent (and said OK to) waits on the phone. It shows "You're offline. Your message is saved, and life will answer when you're back online."
- **Nothing lost.** It's saved with the phone's encrypted state, so closing the app loses nothing.
- **When it sends.** It tries when the app opens, when it comes back to the front, every 30 seconds while something waits, and right after another request gets through. Each request is sent once, oldest first, and its answer lands in the conversation it came from.
- **What doesn't wait:**
  - a refusal is final and shown once;
  - a request older than a week isn't sent, and you're told;
  - turning on private mode drops what was waiting, and says so.

**Wired to the real jobs**

| Where | Job | What happens |
|---|---|---|
| Chat (and Ask) | `ask` | Memories are now picked by the ranking above. The answer waits offline. Cited memories count as useful |
| Talk | `extract` | Life's rules file first, free and instant. When they find nothing, "Ask life to read it" sends your words to a model after your OK for that request. What it finds comes back to review, never filed. Offline, it waits in a conversation called "Your talk" |
| Teach me | `analyse` | Your tell-back is checked by the phone's own model when it has one, and never leaves the phone. The model's quotes, always your own words, can mark a part the word rules missed |
| Missions | `draft` | "Write it with life's AI" on the draft. The phone's model goes first; the cloud asks first. Your names, dates, amounts and references must stay exactly as written, and the check refuses any number it can't find in your draft |

## Screenshots

- `memory.light.png` and `memory.dark.png`: "What life remembers", with a memory that's no longer true.
- `memory-edit.light.png` and `memory-edit.dark.png`: correcting a memory.
- `draft.light.png` and `draft.dark.png`: the mission draft with "Write it with life's AI".
- `draft-ask.light.png` and `draft-ask.dark.png`: the OK before the draft leaves the phone.

These are from a web build pointed at a placeholder API, so the AI options show. The focus outline on the edit box only appears on the web.

## For Edem to decide

1. **The embedding model.** The built-in embedder matches words, not meaning ("cook" finds "cooking", but "dinner" won't find "cooking"). MASTER_PLAN suggests a small open model, MIT or Apache, on both phone and server. The write-up named EmbeddingGemma, but its licence is Google's Gemma terms, not Apache. Apache options include bge-small or all-MiniLM. Swapping it in is one function; vectors re-embed themselves.
2. **pgvector.** Search ranks in TypeScript over a person's memories, which is fine for hundreds. A pgvector column and index on Neon can follow the embedding model. Neither local Postgres nor CI has pgvector yet.
3. **The AI consent switch.** Talk and drafts ask for an OK each time, like chat. Your "standing OK" switch (design first) would let them skip that.
4. **Snap a meal.** The `food` job and its check are ready. Photos can't reach a model until the storage choice (R2 or S3) and image uploads land, so Snap still uses the phone.
5. **New lessons.** The `lesson` job and its check are ready. Making new lessons with a model needs the server's lesson cache, which isn't built yet. Teach me still uses the built lessons.
6. **Memory upkeep.** The `remember` job runs through the API, but nothing calls it yet. The natural home is a nightly batch (half price) once keys are in. For a health memory with sync off, it stays on the phone.

## Checks

- **`bun test` with Postgres: 604 pass, 0 fail.** 40 new tests:
  - `tests/brain/memory.test.ts`: 13
  - `tests/brain/brain-jobs.test.ts`: 10
  - `tests/phone/aiQueue.test.ts`: 5
  - `tests/phone/memory.test.ts`: 8
  - `tests/api/memory.test.ts`: 4
- **The plan's seven named tests** all pass:
  - `extract never saves without confirmation`
  - `ask cites only supplied sources`
  - `lesson matches the lesson schema`
  - `food items carry confidence`
  - `memory search returns only this user's memories`
  - `a deleted memory is never used again`, on the server and on the phone
  - `queues an extract request offline and sends it once on reconnect`
- **Typecheck** is clean for the app and the API. The iOS and Android bundles export.
- **No migration:** memory attributes ride in existing columns.

## Known limits

- **No network listener.** None is in the approved libraries, so the queue retries on a timer and when the app comes back to the front, instead of the moment the connection returns.
- **A rare double answer.** If the app is killed in the instant between an answer arriving and being saved, that request can be sent once more on the next open. The server doesn't yet de-duplicate by request id.
- **Closed memories stay out of answers.** Life can show "no longer true" on the screen, but it doesn't yet answer "you used to…".
