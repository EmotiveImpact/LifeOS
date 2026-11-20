# Life 1.0: three core loops

20 November 2026 · Private product handoff for Claude · Discussion and implementation proposal, not shipped behaviour

See the [wider voice discussion](VOICE-DISCUSSION.md) for the original product rationale, examples, and ideas not included in the first build.

## 1. Conversation record

These are verbatim excerpts from the voice transcription, in discussion order. Speaker labels are editorial. Hesitations and transcription artefacts are kept. This is the relevant decision record, not a complete call transcript. No actual health readings or personal calendar entries are included.

**Augustus — Why one app**
> you know your life spread across 15 different apps, right? You want to have your life essentially handled by one. You've got one life, you've got one app, you've got one one vision, right? So

**Augustus — Morning context**
> um seeing what I have for the day

> is one thing. Um, waking up in the morning and learning how many hours sleep I got

> um you know, a p-part of that could be um knowing when you're going to do your best work based on the amount of sleep that you got. Um based on the amount of water you intook the day before, how much you you know, how much water you've got to do to drink, what foods potentially you could eat to kind of give yourself a boost throughout the day. You know, I was going to say if it's, if it's now connected to like a

**Augustus — Planning the night before and adapting during the day**
> need, but also it would also know maybe the day David, the day before it asks you as you're going to bed it says, okay, what do you need tomorrow? How would I set up tomorrow's day today? That could be a good thing. And again that could be something that we are- we answer when we wake up, cool, that's great. But also it should and I think like I said be able to make the suggestions based on how it knows how you operate and what you need based on how you've been moving through the day.

**Augustus — The user chooses the cadence**
> how much life checks in, you know, sort of thing that you can choose in your options. Um

> And yeah, both both things are true in that, excuse me, one one person might want the regular check-ins because they need to be held accountable. One person might just want life to check in a few times when it notices something. You see what I'm trying to say? Like it's depends on the personality type, which is why I believe

**Augustus — Learn gradually, not all at download**
> analysis, those sorts of things, those are tests that we can start asking people over a period of time. Not necessarily when they first downloaded the app, but it's like as it's trying to get to know you, it will ask you these questions. And again, it will ask you maybe 10 or 20

> questions when it says, "Oh, you've got 5, 10 minutes. Do you wanna uh do this personality test so I can get to know so I can get to know you better?" You know what I'm trying to say

**Augustus — Different people want different wins**
> I think for me, it would be something that holds me accountable a little, like holds me accountable and then shows me my

> progress

> um again options that we we allow people to choose. It's like, well, okay, what would be meaningful for you is a question we ask and part of the onboarding and then you kind of choose and then that could be checked

**Augustus — The size of the available slot matters**
> information. But it again, as it's sort of designed, or parts of it are designed at the moment, at least on the screens, it will, it will say to you something to the effect of, "Oh, you have 20 minutes to spare, do you want to fill in this tax return uh return?" Do you you have 5 minutes to spare here? Do you want to take this test so I can get to know you better? You have 2 minutes! Do you know what I mean? And it gives you the amount of time

**Augustus — Multiple priorities, not a forced single answer**
> I've done I don't know if I I don't know if one thing that matters most. Maybe it's a multitude of things. So maybe it's like, well, what are the things that matter most? Or what is one thing or the things that matter most, or whatever, do you know I'm going to say if I find a better way to word that but we don't want to just sort of thin it down to one thing because a person might have you know multiple things going on that day

> Or maybe or maybe just what's most important to you tomorrow. And then you can select a few things and then all you can just tell it

**Pepper — Independent entry**
> Yeah. So, the key here is that you wanna be able to enter into any of these three things at any time. You know? Plan ahead, get unstuck and see what's changing.

**Augustus — Make this core**
> Okay, cool. Yeah, that, let's um [gasp ]How would you approach this then? Are you because of course we're building that now? We're build- building life with Claude at the moment, but you obviously we've just discovered something and kind of put something forward that I think has to become, well, it's going to become a core part of the application. So, what do you suggest, what do you suggest the next sort of move forward is

## 2. Endorsed product direction

Life 1.0 is one place to handle life on and off screen: practical obligations, local information, people, progress and wellbeing. The three loops organise access to the full product; they do not cut its scope or require that every feature appear on Today.

| Core loop | What the user should be able to do | What not to turn it into |
| --- | --- | --- |
| **Plan ahead** | Answer **“What’s most important to you tomorrow?”** with multiple selections and/or free text. Skip, return or add something in the morning. See the saved priorities alongside today's calendar when available. | A mandatory evening ritual; a single-choice form; or a schedule that overrides real commitments. |
| **Get unstuck** | Enter from the plan, a time-sized suggestion or open Ask. See one concrete action with an estimate and reason, open the actual guide/checklist and resume where they stopped. From a cold start, still ask a practical question, such as what support their borough offers. | A notification with no route to action; a compulsory profile; or a claim that a whole tax return will fit a short slot. |
| **See what's changing** | See actual progress, including partial work. Choose whether Life checks in regularly, only when it notices something useful, or not at all. Decide what counts as meaningful and change that preference later. | A generic streak, guilt for skipping, or treating the app's guesses as user facts. |

Users can enter any loop directly. One recommended next move does not mean one allowed priority. Optional personalisation should explain the benefit, reveal its sources and allow correction or removal. Personality or SWOT prompts are progressive, optional concepts, not tests users must pass or definitive labels.

**Discussed, not committed for first build:** wearable-informed suggestions for when to do demanding work, food and hydration ideas, Apple Health/Watch and WHOOP, and Cal AI-style food logging. Personal patterns are hypotheses, not predictions or diagnoses. Do not promise a precise midday crash, assume a wearable connection, or imply an entitlement without current evidence. The one-app/one-subscription framing is positioning, not a pricing or billing decision here.

## 3. Existing app map (GitHub master inspected 20 November)

Claude's active branch or local work can be newer. Reconcile it before any change; use repo instructions and avoid creating duplicate routes or stores. [V24 board](https://lifeos-board-v24.emotive.chatgpt.site/) and [draft PR #1](https://github.com/EmotiveImpact/LifeOS/pull/1) demonstrate design coverage, not a native runtime or live integration.

| Area | Source inspected | Existing behaviour / gap |
| --- | --- | --- |
| Today's priorities and calendar | [TodayScreen](../../../apps/mobile/src/screens/Today.tsx), [TodayHome](../../../apps/mobile/src/screens/TodayHome.tsx), [route registry](../../../apps/mobile/src/navigation/screens.ts), [local-day helper](../../../apps/mobile/src/state/day.ts) | Today is `/(tabs)/today`; calendar detail is `/today/calendar`. Today already uses a local day and a check-in; body readings are explicitly sample. Neither this inspection nor the board establishes evening priority capture or live calendar availability. |
| Next step, Ask and resume | [TodayHome](../../../apps/mobile/src/screens/TodayHome.tsx), [PlanScreen](../../../apps/mobile/src/screens/Plan.tsx), [TalkScreen](../../../apps/mobile/src/screens/Talk.tsx) | Today has a hard-coded HMRC NextMoveCard. Plan has mission steps and completion state. The open composer is in `/(flows)/chat`; `/(flows)/ask` is a distinct follow-up surface. Reuse the open composer and extend the existing mission path rather than adding a second chatbot. |
| Progress and preferences | [TodayHome](../../../apps/mobile/src/screens/TodayHome.tsx), [YouScreen](../../../apps/mobile/src/screens/You.tsx), [PlanScreen](../../../apps/mobile/src/screens/Plan.tsx) | Today has a Progress segment and Pulse routes; You has `/you/knows`; Plan uses local completion state. Check the current preferences model before adding any cadence field; no claim that the proposed scheduling works today. |

Read [SPEC](../../../SPEC.md), [BUILD_PLAN](../../../BUILD_PLAN.md), [AGENTS](../../../AGENTS.md) and [implementation references](../../../IMPLEMENTATION_REFERENCES.md). Align the proposal with the existing design system, track gates and local-first storage. Flag conflicts before rewriting the product spec or engine.

## 4. Recommended first slice for Claude (proposal, not an implementation order)

**One journey: tonight's intention → tomorrow's doable action → visible progress.** Use synthetic priorities such as “Get my paperwork ready” and “Protect time to edit.” A ten-minute gap leads to “Gather two documents,” not “Finish your tax return.” Check off one item, close the app, reopen at the same step, check off the other, then show what changed. Include open Ask as an independent entry and test one other priority so the mechanism is not tied to tax.

1. **Capture and recall:** reuse existing Today/Plan controls and verified local persistence; include a date key and preserve manual goal order. No automatic rollover without user control. Clearly label missing, denied or sample calendar context. No inferred free slot when calendar access is absent; accept a manually selected slot.
2. **Offer one time-sized step:** offer a 2-, 5-, 10- or 20-minute option only when a real checklist step can fit. Preserve other priorities visibly. Show a short “Why this?” using the selected priority, time budget and evidence. For a local or money question, use a dated authoritative source if available; otherwise say it has not been checked. Never auto-submit or take an external action.
3. **Resume and reflect:** reopen to the same checkpoint after leaving and reopening; track only explicit actions, not inferred success. Start with in-app progress and cadence settings. Do not implement push notifications, predictive wellness, live calendar/wearable ingestion or model-dependent personalisation in this slice.

### Acceptance checklist for the proposed slice

- [ ] Save two or more priorities including free text; keep them after relaunch and see them on the intended local day. Test skip, edit and midnight rollover.
- [ ] Show calendar context if available and accurate; manual time works if permission is denied, calendar is disconnected or data is stale.
- [ ] Get a single suitable choice from the time budget and reach the right existing checklist. With nothing that fits, say so rather than inventing an action.
- [ ] Leave mid-step and resume after restart; distinguish started, complete and undone. Repeated taps do not duplicate progress.
- [ ] Open Ask and view progress without an evening check-in or questionnaire. Nothing changes without an explicit decision.
- [ ] Change cadence, including Off; it does not remove manual access. Any optional question explains why it is asked and can be skipped.
- [ ] In review, label sample versus real inputs, confirm the actual existing path used, and document checks permitted by the current track. This document does not claim mobile testing.

## 5. Claude's response

Append here before changing screens, schemas or engine behaviour:

- **Current working branch / commit:**
- **Already working in the native app (evidence):**
- **Still sample, stubbed or preview-only:**
- **Which components, routes and persistence will be reused:**
- **Smallest change spanning all three loops, and anything blocked by the current phase:**
- **What to test and how to verify it:**
- **Questions or alternative proposals for Augustus:**
