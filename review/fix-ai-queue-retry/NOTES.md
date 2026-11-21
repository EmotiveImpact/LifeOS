# What waited goes the moment the phone is back online (F-46)

Branch `fix-ai-queue-retry`, from `v26-integration` at 143ede4.

## What was wrong

- **Waiting on a timer.** A question asked offline waits on the phone. Life only tried again every 30 seconds, when it opened, or when it came back to the front. Changes waiting to sync had no timer at all: they waited for the next change or the next return to the front.
- **Charged twice.** If an answer was lost on the way (the connection dropped while Life was answering, or Life closed before saving it), the phone sent the same question again. The server ran it again and counted it against the person's allowance a second time.

## What changed

**The phone says when it's back online.** Life's own native module now reports one thing: online or offline. It never reports which network, its name or its address.

- On iPhone it uses the system's network monitor.
- On Android it uses the default network, and only counts it once Android has checked it really reaches the internet. This needs Android's "view network connections" permission, which is granted at install with no prompt.
- In a browser it uses the page's online event.
- It only watches while Life is listening.

**What waited goes straight away.** The moment the phone goes from offline to online:

- waiting questions are sent, oldest first, as before;
- changes waiting to sync are sent.

The 30-second try, opening Life and coming back to the front all stay, in case a report is missed or a build doesn't have the report yet.

**A resent question isn't charged twice.** The server's AI ledger now keeps the phone's random id for each question (never its words) and marks a resend. A question resent within a day, with the same id and the same job, is answered again, because Life keeps no answers on the server. It doesn't use the allowance a second time.

- This only happens once per question. Another resend counts like a new question.
- Resends still count toward the monthly spending cap, because they cost money.
- On the phone, an answer was already shown only once (`postMessage` keys each answer by request id). That hasn't changed.

**Migration.** `0008_ai_resends` adds `request_id` and `repeat` to `ai_usage`, with an index. It runs with the others when the server is set up (F-03).

**Record of processing.** Row 6 (AI cost ledger) now lists the request's random id. The privacy policy's "the cost ledger holds no content" is still true.

## Screenshots

None. Nothing on screen changes. An answer just arrives sooner.

## Checks

- **Tests:**
  - `tests/launch/ai-queue-retry.test.ts` is new, with 7 tests:
    - only a change from offline to online counts;
    - starting offline, the first connection counts;
    - one shared report, so a listener that joins later isn't fooled;
    - the queue and sync both act on it;
    - the iPhone and Android modules, and that only online or offline crosses to JavaScript.
  - `tests/api/ai.test.ts` has 2 new tests, run against Postgres:
    - a resend is answered without using the allowance twice, only once;
    - a resend must be the same job within a day, and still counts toward the spending cap.
  - `tests/launch/health-rationale.test.ts` now expects the module's third event.
- **Full suite:** 939 tests. 1 failed: the health-rationale check expected the old list of events. I updated it and re-ran that file, which passes.
- **Typecheck:** the app and the API are clean.
- **Bundles:** iOS and Android export.

**The native code isn't compiled here.** This container has no Xcode or Android SDK. The Swift and Kotlin follow the same Expo module APIs that `expo-status-bar` uses (checked against expo-modules-core 58.1.0). The next TestFlight or EAS build compiles them. If either fails, Life still works without the report, because the timer and the return to the front remain.

**Check on a phone:**
1. Turn on flight mode and ask Life something.
2. Turn flight mode off with Life open.
3. The answer should arrive within a few seconds, with no need to leave Life.

## For Edem

Nothing to decide. The permission Android adds is the standard network-state one, and Play's Data safety form doesn't ask about it.
