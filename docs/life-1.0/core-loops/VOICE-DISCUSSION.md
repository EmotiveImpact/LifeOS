# Life 1.0 — wider product conversation

20 November 2026 · Companion to the [core loops and implementation handoff](README.md).

This records the material product discussion available from the voice call. It is not a complete speaker-by-speaker transcript. Quotations reproduce the available transcript, including hesitations and recognition errors; regular prose is editorial context. Where the saved transcript cuts off, no missing wording has been reconstructed. Unrelated call material is out of scope.

## One life, one app

**Augustus:**
> sort of you know like your Apple Health data with your kind of um your data and your your Kal AI has a Kal AI function instead of just having to use Kal AI and the purpose the reason I developed it is because you don't want to have

> you know your life spread across 15 different apps, right? You want to have your life essentially handled by one. You've got one life, you've got one app, you've got one one vision, right? So

> so one app, you've got one vision for your life, you've got you've got one life, you've got one one app, maybe there's something in there if the marketing. [breath ]But um but yeah, essentially it's the application that allows you to have one subscription

> , one place, one applica- one application just to handle all aspects of your life, you know, from understanding what your entitled to as a person in living in a borough in London, uh finding out um how to file your taxes

> , learning how to do certain things, um kind of remembering people's

> birthdays, things like this, like it's life, like it's your companion, you know

**Product vision, not a release promise:** the breadth is intentional. The earlier first-principles framing still applies: this is software to help people live in the real world, not another place to perform their life online. It brings together civic and borough support, tax and other admin, practical learning, people and important dates, wellbeing, and Cal AI-style food logging. “One life, one app, one vision” and “one subscription” are positioning ideas, not approved copy, a price or a billing implementation. Borough and tax answers need jurisdiction, dates and authoritative sources; the app should not infer eligibility or file anything.

## A morning that responds to what happened

**Augustus:**
> um seeing what I have for the day

> is one thing. Um, waking up in the morning and learning how many hours sleep I got

> um you know, a p-part of that could be um knowing when you're going to do your best work based on the amount of sleep that you got. Um based on the amount of water you intook the day before, how much you you know, how much water you've got to do to drink, what foods potentially you could eat to kind of give yourself a boost throughout the day. You know, I was going to say if it's, if it's now connected to like a

> application that like a Whoop or an Apple Watch, I think a wearable like this maybe then it makes suggestions of things that I can do to increase my levels throughout the day. So again, like I might wake up, I might be short of two hours of sleep, but it knows then, okay, cool, I'm probably going to have a crash around 12 as a consequence of me waking up at 8 and leaving for work at 9, probably gonna have a crash at 12, so your best work is probably going to be done from 10 to uh

> 11:30. Then it might suggest, you know, a kind of lunch to eat to kind of bring my levels up so I can peak for a little bit and continue some- You know what I'm gonna say? That would be very good

**Augustus:**
> [gasp ]Kind of in the amalgamation of both what you've just said and I've said, and maybe giving the person the capacity to choose what kind of you know how life responds to them

> need, but also it would also know maybe the day David, the day before it asks you as you're going to bed it says, okay, what do you need tomorrow? How would I set up tomorrow's day today? That could be a good thing. And again that could be something that we are- we answer when we wake up, cool, that's great. But also it should and I think like I said be able to make the suggestions based on how it knows how you operate and what you need based on how you've been moving through the day. So it can start to understand you, starts to pick up on your habits, starts to pick up on uh your eating habits, your your kind of your drinking habits, you know, where you go, how you move and what essentially you need so as to get you to your

> best um and then to to get you to your best and so as to take you to the next level

**Product hypothesis:** combine what someone says they need with what they choose to share, rather than choosing between a self-reported check-in and data-driven suggestions. Night-before planning and morning capture are both useful. Apple Health, Apple Watch and WHOOP are possible signal sources, not verified connections. A proposed focus window, food or hydration idea is not a guaranteed crash, a clinical finding or an instruction to change anyone's diet. Start with optional observations and plain explanations; missing data must not make the calendar or plan unusable. Ask separately before collecting wearable, food or location data. Do not treat the user's permission to discuss these features as permission to collect their data.

## Check in how the person wants, not how we want

**Augustus:**
> But again I don't know. I I again, I don't want to speak for me because it's applications for everybody. So I think both approaches are are useful. I think that you could have a um

> how much life checks in, you know, sort of thing that you can choose in your options. Um

> And yeah, both both things are true in that, excuse me, one one person might want the regular check-ins because they need to be held accountable. One person might just want life to check in a few times when it notices something. You see what I'm trying to say? Like it's depends on the personality type, which is why I believe

> personality tests, the 16 personality tests, then these SWOT

> analysis, those sorts of things, those are tests that we can start asking people over a period of time. Not necessarily when they first downloaded the app, but it's like as it's trying to get to know you, it will ask you these questions. And again, it will ask you maybe 10 or 20

> questions when it says, "Oh, you've got 5, 10 minutes. Do you wanna uh do this personality test so I can get to know so I can get to know you better?" You know what I'm trying to say

**Augustus:**
> I think for me, it would be something that holds me accountable a little, like holds me accountable and then shows me my

> progress

> But that's for me, my personality type. Somebody else's personality type might be something else, you know. And maybe those are things that

> um again options that we we allow people to choose. It's like, well, okay, what would be meaningful for you is a question we ask and part of the onboarding and then you kind of choose and then that could be checked

> over time and suggestions could be made

**Endorsed direction:** people choose regular accountability, selective check-ins, or no prompts. Ask what a good first win would be and let that answer change. Showing progress is one useful outcome, not a prescribed definition of success. A future pattern prompt such as noting late caffeine and shorter sleep was an example, not a causal claim. Later personality or SWOT-style prompts are optional and must make their benefit clear. Use what the person actually chooses and confirms ahead of any inferred personality label; don't make a quiz a gateway.

## A useful action for the time someone actually has

**Augustus:**
> a 100 percent. So we need, we really do need to develop the brain, the engine to have

> adaptive technology, to have, um, you know, like a kind of, you know, un-unless invasive as you're saying approach to acquiring

> information. But it again, as it's sort of designed, or parts of it are designed at the moment, at least on the screens, it will, it will say to you something to the effect of, "Oh, you have 20 minutes to spare, do you want to fill in this tax return uh return?" Do you you have 5 minutes to spare here? Do you want to take this test so I can get to know you better? You have 2 minutes! Do you know what I mean? And it gives you the amount of time

**Pepper:**
> with two minutes, maybe it could say, "Your friend's birthday is tomorrow! Want to send a message now?"

**Design discussion:** a short available slot gets a proportionate step, not an unrealistic promise to finish a whole task. Explain why the step fits. Offer “do it now, do it later, show me something else”; a birthday action is a suggestion, not permission to send a message. Measure whether a useful step was taken and whether someone can resume it, not how many notifications they clicked.

## Why the wording and the three entrances matter

The earlier suggestions “What would make tomorrow a good day?” and “What would you like to make time for tomorrow?” were exploratory. A one-priority mechanic was explicitly challenged.

**Augustus:**
> I've done I don't know if I I don't know if one thing that matters most. Maybe it's a multitude of things. So maybe it's like, well, what are the things that matter most? Or what is one thing or the things that matter most, or whatever, do you know I'm going to say if I find a better way to word that but we don't want to just sort of thin it down to one thing because a person might have you know multiple things going on that day

> Or maybe or maybe just what's most important to you tomorrow. And then you can select a few things and then all you can just tell it

> Yeah, that feels kind of cool. What else can we be holding as a loop? I don't want to just have one loop. I think we should have like two or three

**Pepper:**
> Yeah. So, the key here is that you wanna be able to enter into any of these three things at any time. You know? Plan ahead, get unstuck and see what's changing.

**Decision:** **“What’s most important to you tomorrow?”** lets the person select multiple priorities or put them in their own words. The next morning combines them with the day when available; no check-in or questionnaire is required to enter any of the three loops. Someone opening Ask to find borough support should get help there, not a prompt to set up tomorrow. Seeing what changed can look like a weekly reflection on walks or other progress, but the cadence and shape are configurable. One helpful recommendation does not erase the other priorities.

**Proposed first implementation:** use the connected journey and acceptance criteria in the [handoff](README.md#4-recommended-first-slice-for-claude-proposal-not-an-implementation-order). Keep live wearables, predictive suggestions, tax filing, external messaging and paid subscription work out of that slice. Real-day observations can test usefulness later without claiming the app already does any of the above.

## Related private project material

- [Original Life Management App conversation](https://chatgpt.com/c/6af919a9-6368-83ed-b890-90e8f02340df?messageId=2c9cd8d8-9e71-49c9-bcf8-c777edde8182) and [Life App Story](https://chatgpt.com/c/6afa72fb-858c-83ed-90f4-e0229d4c37df?messageId=ee1a9327-4298-5566-a021-8ae8271c84c4).
- [V24 design-board PR](https://github.com/EmotiveImpact/LifeOS/pull/1) and [working design preview](https://lifeos-board-v24.emotive.chatgpt.site/). Design proof, not proof of native integrations.
- [Implementation reference map](../../../IMPLEMENTATION_REFERENCES.md) and [pinned revisions](../../../vendor/REFERENCES.lock.md). The [later research conversation](https://chatgpt.com/c/6affef4c-baa8-83ea-ab87-0bf342c0864d?messageId=36a508f2-980c-5ad7-9785-ebe578b8d240) lists these first ten: Feynman, Atria, NOOP, OpenStrap Edge, Cal-AI, Loop, Actual, Maybe, Open Wearables, Mem0. A distinct earlier shortlist was not verified. Use the repo's licence rules rather than treating the list as permission to copy.
