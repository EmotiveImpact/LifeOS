# life — The Fenny teaching language

> Everything life knows about teaching comes from the owner's own Feynman app (Fenny). This file brings its research, method, conversation rules and **visual teaching language** into life.
> The source is vendored in **`vendor/fenny/`** (the owner's code, reuse allowed). Rewrite it in life's tokens and naming; never ship Fenny's glass, colours or branding.
> Board v17: "Pictures that teach", "A bite, drawn live", and the whole Teach me chapter.

## 1. The principle: let the learner find it
People remember and act on what they worked out themselves (`vendor/fenny/docs/behavioural-design.md`). So life:
- **asks the question whose answer is the missing idea**, instead of naming it;
- **builds on the learner's own analogy**, repeating their words back;
- when they're stuck, asks **one simpler, concrete question**, then lets go. Never more than two questions on one thing;
- never asks vague or meta questions ("what do you mean?", "which bit?"), and never nags;
- once they clearly don't know something, **offers Teach me** ("No worries, this sounds new to you. Want a two-minute lesson first?"), at most twice;
- **"Show me" hands the pen back**: a short explanation always ends with "Now tell me in your own words";
- results **lead with what they explained well, quoted**, then the gaps; the first gap is the one *they* said felt shakiest;
- reviews are framed kindly ("life's forgotten, can you remind it?"), spacing is explained, and nothing ever shames a reset.
**Lines we don't cross:** no using someone's goals to upsell, no fake scarcity, no guilt, cancelling is always easy.

## 2. The conversation engine (Tell it back)
From `vendor/fenny/docs/conversation-engine.md` and `api/policy.ts`:
1. **Key ideas:** 4–7 ideas a full explanation needs, from the topic (and the user's notes). Cached per topic.
2. **Limits in code, not in the prompt:** at most one probe (why / what if / puzzled) in two turns; first "don't know" gets a simpler question, the second gets the Teach me or Show me offer; no repeated moves; listen at most once in three turns; a 30-second retell around turns 7–12; a warm close asking "which bit felt shakiest?"; then a short goodbye.
3. **One line per turn:** the model picks one allowed move and says one line (one question at most), reporting which key ideas are now covered. Vague questions are replaced in code before they're spoken.
Moves: `listen, next, why, what_if, puzzled, build_on_theirs, plain_words, simpler, offer_show_me, show_me, offer_teach, teach, retell, close, wrap`.

## 3. Lessons (Teach me)
From `api/lesson.ts`: `Lesson { idea, bites[2–3], recap, explainBack }`. Each bite: short text, **one picture** (a scene from the drawing kit), a caption, and **one puzzle**. Levels: simple, standard, deep. A different picture device for each bite (the "variety rule"). One bite asks for a **guess before the reveal**. Lessons use the user's own numbers and are cached per topic + level.
Puzzles (`teach/Puzzle.tsx`): true/false, choose, fill the gap, order, match. **A wrong answer is never punished:** the right one shows with why, and they carry on. No red, no shake.
The film (`teach/TeachMode.tsx`): each sentence builds the next part of the drawing, timed to the voice; a slider lets them play with the idea (`teach/Slider.tsx`).

## 4. The visual teaching language (Fenny Drawing Kit, in life's colours)
From the header of `scene/draw.ts`, adapted:
- **One idea per picture.** A 300 × 176 panel, scaled to fit.
- **One line weight** (1.6 at panel scale), **rounded ends**, soft ink on the canvas. No gradients.
- **Only one thing is lit**: an ink fill for the answer, or **life's ember for the thing that changes** (Fenny used steel blue; life uses its one signal colour). Only the lit thing gets a soft halo; nothing else glows.
- **Few, small, sentence-case labels** that never clash or cut a word (whole words only; never end on "to", "and"…).
- **Built in a few beats, then at rest** with at most one slow movement. A line being drawn carries a small light at its pen tip.
- **Every motion means one thing, always:** draw on = being built; drift = alive, at rest; jiggle = random motion (with a fading trail for speed); cross = through a boundary; rise = lighter; fall = settling; flow = carried along; orbit = a repeating cycle; pulse = a signal; grow = more of it; tip = one side wins; slide = where it sits; spark = a reaction; step = a jump between levels. Speed is shown with trails, never blur.
- **Reduce Motion:** nothing loops; only the slider changes the scene.
- **Clean or hand-drawn:** the same drawing through a canvas that gives lines and circles a slight, steady marker wobble (`wobble(s, seed) = 0.55·sin(0.085s + seed) + 0.25·sin(0.21s + 1.7·seed)`, tapered at line ends). Fills, text and curves stay clean. **life setting: Settings → Look, sound and feel → "Hand-drawn diagrams in lessons"** (off by default).

**30 devices** (`scene/types.ts`): particles, links (flow), graph, balance, compare, stairs, spectrum, venn, pair, tree, test, threshold, units (Isotype counts), crowd, grid, timeline, layers, wave, mirror, stack, radial (cycle/hub), cutaway (shares), funnel, sankey, fan (uncertainty), spiral, zoom (scales), brace (groups), map, things.
**208 drawn objects** (`scene/things.ts`), all made from the same few marks (line `l`, circle `c`, arc `a`, dot `d`, soft box `b`, path `p`, closed path `z`, dashed `q`): people and the body, Earth and space, science, money and society, technology, time and ideas, transport, living things and metaphors (iceberg, dominoes, snowball, ladder, bridge, door…).
**Scenes are data:** the lesson writer (`api/scene.ts`) returns a scene JSON per bite, the app checks it and draws it; anything an older app can't draw falls back to the simple picture.

## 5. Two sizes of lesson (decided 16 Nov 2026)
- **Quick lesson (default): the standard Teach me.** 2–3 bites, simple pictures (parts, flow, compare), one guess, one puzzle per bite, recap, tell it back. About two minutes. This stays exactly as designed on the board (Teach me chapter).
- **Bigger lesson: the Fenny version.** For when someone wants to go deeper: the **Deep** level, a **"Go deeper"** button at the end of a quick lesson, and Learn's longer ideas. Uses the full Drawing Kit (30 devices, 208 things, clean or hand-drawn), the narrated film with the slider, more bites and the full tell-it-back conversation.
- The Fenny kit **does not replace** the quick lesson's pictures; it's the richer layer on top.

## 6. Where it shows up in life
- **Teach me** (every term life shows that you don't know yet; Talk when you sound unsure). Ends with "You've got it" and a booked recall.
- **Learn ideas** (lens cards get a drawing per card).
- **Explainers anywhere a number needs a why**: "How scores work", tax, compound interest, sleep debt — a drawn scene instead of a paragraph.
- **Tell it back** results and **Show me** use the same pictures.

## 7. Build notes (for Codex)
- Port `vendor/fenny/scene/*` into `apps/mobile/src/learn/scene/` (Skia: add `@shopify/react-native-skia`). Replace `SIL/BLUE/LAB/PANEL` with life tokens (`ink`, `ember`, `ink2`, `surface2`). Keep the maths, marks and device code.
- Port `api/lesson.ts`, `api/scene.ts`, `api/review.ts`, `api/policy.ts` into life's API (`apps/api/src/learn/`), behind `ai.ts` tiers (Strong tier for lessons and analysis).
- Port `teach/Puzzle.tsx`, `teach/Slider.tsx`, `teach/TeachMode.tsx` as life components (`LessonPuzzle`, `LessonSlider`, `LessonFilm`) using `@/design` tokens; no glass.
- Add `prefs.handDrawn` to the store, wired to the setting.
- Keep the vendor folder as the reference; don't import from it.
