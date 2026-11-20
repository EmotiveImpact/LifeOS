# Teach me

Source content from the V23 board (the established screens). Tags in [brackets] are the old style names: t-display = big number, t-statement = two-tone sentence, t-title1 = title, btn = button, chip = chip.

## teachoffer — Teach me, right where it’s needed  (Button · opens from anywhere a new term appears)
about: 151 | New in v13 | Teach me, right where it’s needed | Whenever life shows something you might not know (a tax code, an ISA, HRV), a small “Teach me” appears. Tapping it builds a two-minute lesson about that exact thing, then brings you straight back to what you were doing. | TeachMeButton · ai.lesson({ topic, idea, said? }) · Feynman app lesson.ts | Button
- [tnum] 9:41
- [v21-title] Tax & NI check
- [t-callout] Your tax code
- [tag] Check this
- [t-title1] 1257L M1
- [t-body] Your last payslip shows an emergency code. You may be paying too much tax.
- [t-body] Teach me tax codes
- [t-callout] 3 bites · about 2 minutes
- [t-body] Tax so far this year
- [t-callout] £3,912
- [t-callout] On track
- [t-body] National Insurance
- [t-callout] £1,488
- [t-callout] Class 1
- [t-callout] It also appears in Talk:
- [t-body] No worries, this sounds new to you. Want a two-minute lesson first, then tell me in your own words?
- [tag] Teach me
- [tag] Not now

## lessonready — Your lesson, ready  (Full screen · opens from Teach me)
about: 152 | New in v13 | Your lesson, ready | life builds the lesson in a few seconds: two or three bites, each with one picture and one quick puzzle. You choose how deep: Simple, Standard or Deep. It uses what life already knows about you, so the examples are yours. | Lesson { idea, bites[], recap, explainBack } · LEVELS simple | standard | deep | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] What your tax code means
- [t-callout] Teach me
- [t-title1] What your tax code means
- [t-body] Using your own payslip, so the numbers are real.
- [li] 1
- [t-body] The code is two parts
- [t-callout] A number and a letter
- [li] 2
- [t-body] How it works each payday
- [t-callout] With one guess from you
- [li] 3
- [t-body] When it goes wrong
- [t-callout] And how to spot it
- [button·segm] Simple
- [button·segm] Standard
- [button·segm] Deep
- [btn] Start · about 2 min
- [btn] Save for later

## bite — A bite: one idea, one picture  (Full screen · opens from lesson)
about: 153 | New in v13 | A bite: one idea, one picture | Each bite is a few short sentences and one simple picture that builds as you read (parts, flow, compare, cycle or layers). The key words light up. No walls of text. | Bite { title, text, picture { kind, labels }, caption } · teach/Picture | Full screen
- [tnum] 9:41
- [v21-title] Tax codes
- [t-mono] 1 / 3
- [t-title2] The code is two parts
- [tnum] 1257
- [row] L
- [t-callout] Tax-free pay
- [t-callout] add a 0: £12,570
- [t-callout] The letter
- [t-callout] L = the standard one
- [t-statement] The
- [t-statement] number
- [t-statement] is how much you can earn
- [t-statement] tax-free
- [t-statement] , without the last zero. The
- [t-statement] letter
- [t-statement] tells your employer which rules apply to you.
- [btn] Next

## predict — Guess first, then see  (Full screen · opens from lesson)
about: 154 | New in v13 | Guess first, then see | One bite in every lesson stops and asks you to guess before it shows the answer. A guess, right or wrong, makes the answer stick far better than just reading it. | predict-before-reveal · TeachMode film | Full screen
- [tnum] 9:41
- [v21-title] Tax codes
- [t-mono] 2 / 3
- [t-title2] How it works each payday
- [t-body] Each month your employer takes off one twelfth of your tax-free amount, then taxes the rest.
- [t-callout] Your guess
- [t-body] If your code were 1100L instead of 1257L, would you pay more tax or less?
- [button·chipb] More
- [button·chipb] Less

## puzzle — One quick puzzle  (Full screen · opens from lesson)
about: 155 | New in v13 | One quick puzzle | Each bite ends with one small puzzle: true or false, pick one, fill the gap, put in order, or match. A wrong answer is never punished. The right one shows with why, and you carry on. | Puzzle { kind, prompt, options, answer, why } · true_false | choose | fill_gap | order | match | Full screen
- [tnum] 9:41
- [v21-title] Tax codes
- [t-mono] 3 / 3
- [t-title2] When it goes wrong
- [tag] Right code
- [t-title2] 1257L
- [t-callout] Tax-free part used each month
- [tag] Emergency code
- [t-title2] 1257L M1
- [t-callout] Often too much tax, until it’s fixed
- [t-callout] Pick one
- [t-body] “M1” at the end of a code most often means…
- [button·chipb] It means you’ve paid too little
- [button·chipb] Your employer doesn’t have your details yet
- [button·chipb] You’re self-employed

## lessonrecap — The whole idea, in three lines  (Full screen · opens from lesson)
about: 156 | New in v13 | The whole idea, in three lines | The recap lands one line at a time, each with a tick. This is the thing you’ll tell back in a moment. | Lesson.recap · Ticks | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Recap
- [t-title1] So, in short
- [t-body] The number is your tax-free pay, without the last zero.
- [t-body] Each payday, a twelfth comes off before tax.
- [t-body] A letter like M1 means a stopgap, so check it.
- [btn] Now tell it back

## tellback — Tell it back to life  (Full screen · opens from lesson)
about: 157 | New in v13 | Tell it back to life | The Feynman step. You explain it in your own words, out loud or typed. life listens like a curious friend: it asks “why?” or “what if?”, but never explains for you. The explaining stays yours. | explainBack · curious-student moves: listen, why, what_if, puzzled, build_on_theirs, plain_words | Full screen
- [tnum] 9:41
- [v21-title] Your turn
- [t-mono] 0:41
- [t-title2] Tell me what a tax code is, like I’ve never heard of one.
- [t-body] It’s like… the number is how much you earn before tax kicks in, so 1257 is about twelve and a half grand. And the letter is the type.
- [t-body] Oh nice. So why would the letter matter if the number’s the same?
- [t-body] Because M1 means they’re guessing, so you can end up paying too much…
- [t-callout] Tap when you’re done

## gaps — What you got, and the one gap  (Full screen · opens from after telling back)
about: 158 | New in v13 | What you got, and the one gap | After you speak, life shows what you explained well, quoted in your own words, then the one gap (the bit you said felt shakiest comes first). “Show me” gives a short explanation, then: now tell me in your own words. | ai.analyse(transcript) → { strengths[quote], gaps[] } · ai.showMe(gap) | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] How you did
- [t-callout] One gap
- [t-body] What to do about a wrong code
- [t-body] You spotted the problem. The last step is how to fix it.
- [btn] Show me
- [t-callout] You explained well
- [t-body] “the number is how much you earn before tax kicks in”
- [t-body] “M1 means they’re guessing”

## gotit — You’ve got it  (Full screen · opens from end of lesson)
about: 159 | New in v13 | You’ve got it | The accomplishment moment, earned. One of the few places a full image appears. It names exactly what you learned, books a quick recall so it stays, and hands you straight back to the action it unlocked. | LearningRecord · FSRS recall · feedback.complete() · threshold imagery (DESIGN §33) | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] You’ve got it
- [span] Learned · tax codes
- [t-title1] You’ve got it.
- [t-body] You can now read any tax code, and you know what to do when one is wrong.
- [t-callout] Ideas learned this month
- [t-callout] 7
- [t-callout] Quick recall booked: Thursday, then next week.
- [btn] Check my tax code now
- [btn] Back to Today

## teachplay — Play the whole lesson  (Prototype · opens from the whole flow)
about: 160 | New in v13 | Play the whole lesson | A working prototype of the whole flow, with the real transitions: the offer expands into the lesson, bites slide in, the guess reveals, the recap ticks in, and the finish lands with the complete sound. Tap through it. | MOTION.md · springs smooth 550/0.85, snappy 350/0.9, bouncy 600/0.7 · riseIn | Prototype
- [tnum] 9:41
- [t-callout] Offer
- [t-mono] 1 / 7
- [t-callout] Your tax code
- [t-title1] 1257L M1
- [t-body] An emergency code. Want to know what that means?
- [btn] Teach me

## bitedrawn — A bite, drawn live  (Full screen · opens from lesson)
about: 161 | New in v17 | A bite, drawn live | In a bigger lesson, the bite gets a real drawing: as each sentence is read, the next part of the picture draws itself on, and the lit box is the thing the sentence is about. Replay to watch it build; switch to hand-drawn in Settings. | TeachMode film · SceneView (flow device) · narration beats | Full screen
- [tnum] 9:41
- [v21-title] Tax codes
- [t-mono] 2 / 3
- [t-title2] How it works each payday
- [button·segm] Clean lines
- [button·segm] Hand-drawn
- [t-statement] Each month your employer takes off
- [t-statement] one twelfth
- [t-statement] of your tax-free amount, then
- [t-statement] taxes the rest
- [t-statement] .
- [btn] Next
