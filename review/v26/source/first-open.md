# First open

Source content from the V23 board (the established screens). Tags in [brackets] are the old style names: t-display = big number, t-statement = two-tone sentence, t-title1 = title, btn = button, chip = chip.

## welcome — Welcome  (Full screen · opens from first launch)
about: 01 | Welcome | The first thing anyone sees: a bright, diverse cast, one line, one way in. | IntakeState | Full screen | · opens from first launch
- [tnum] 9:41
- [span] Life,
- [span] handled.
- [t-statement] life finds
- [t-statement] what you're owed,
- [t-statement] what's
- [t-statement] due
- [t-statement] and what's
- [t-statement] next.
- [btn] Get started
- [btn] I already have an account

## question — One question at a time  (Full screen · opens from Welcome)
about: 02 | One question at a time | A numbered progress line and one question per screen, answered with a single tap. | ProgressiveQuestion · LIFE_DESTINATIONS | Full screen | · opens from Welcome
- [tnum] 9:41
- [v21-title] One question at a time
- [t-mono] 01
- [t-mono] 02 03
- [t-statement] What would make the biggest difference
- [t-statement] this year?
- [t-title3] Clear the chaos
- [t-callout] Get on top of bills, tax and anything overdue
- [t-title3] Buy my first home
- [t-callout] Deposit, schemes and when you could buy
- [t-title3] Launch or grow a business
- [t-callout] Structure, funding and tax set-asides
- [t-title3] Get healthier
- [t-callout] Checkups, referrals and daily routines
- [t-title3] Earn more
- [t-callout] Skills, pay rises and a better next move
- [btn] Next: where you live

## tell — Or just tell life  (Full screen · opens from Welcome → “Or just tell life”)
about: 03 | Or just tell life | Skip the questions and talk instead. life suggests what to cover, so you're never staring at a blank screen. | Talk · processLifeOSMessage | Full screen | · opens from Welcome → “Or just tell life”
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Or just tell life
- [t-callout] Faster than questions
- [t-title1] Tell life about you, in your own words.
- [t-body] Talk for a minute and life will set itself up. You'll see everything it understood before anything is saved.
- [t-body] Where you live and who with
- [t-body] What you do for work
- [t-body] Anything worrying you about money
- [t-body] Health things you've been putting off
- [t-body] Where you want to be in a few years
- [t-callout] Tap to start talking · or type instead

## building — Building your plan  (Full screen · opens from end of setup)
about: 04 | Building your plan | life works in front of you: what it's checking, what it found, and the plan taking shape. | ScanningState · getEligibleTasks | Full screen | · opens from end of setup
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Building your plan
- [t-statement] Found
- [t-statement] £2,340
- [t-statement] you may be owed,
- [t-statement] 1 urgent deadline
- [t-statement] and
- [t-statement] 6 things
- [t-statement] to set up.
- [t-body] Your tax record
- [t-callout] HMRC · 2024/25
- [t-callout] £840 back
- [t-body] Council tax discounts
- [t-callout] London · single occupancy
- [t-callout] 25% off
- [t-body] NHS waiting times
- [t-callout] Cardiology · Guy's
- [t-callout] Urgent
- [t-body] Schemes you qualify for
- [t-callout] Start Up Loans · LISA
- [t-callout] 2 found
- [t-body] Your monthly costs
- [t-callout] Rent, bills, subscriptions
- [t-callout] Mapped
- [btn] See my plan

## where — Where do you live?  (Full screen · opens from setup)
about: 05 | New in v10 | Where do you live? | Question 2 of the onboarding. Your area decides council tax, your NHS trust, local schemes and prices, so life asks it early and says why. | profile.city · countryCode | Full screen
- [tnum] 9:41
- [v21-title] Where do you live?
- [t-mono] 01
- [t-mono] 02
- [t-mono] 03
- [t-statement] Where do you
- [t-statement] live?
- [t-body] Your area sets council tax, your NHS trust, local schemes and what homes cost.
- [t-body] Search a town or postcode
- [button·chipb] London
- [button·chipb] Manchester
- [button·chipb] Birmingham
- [button·chipb] Leeds
- [button·chipb] Glasgow
- [button·chipb] Bristol
- [button·chipb] Cardiff
- [button·chipb] Belfast
- [t-callout] Only your area is stored, never your exact address.
- [btn] Next: your work

## signin — Save your progress  (Sheet · opens from after the plan is built)
about: 06 | New in v10 | Save your progress | After the plan is built, before anything is synced. Sign in with Apple or Google, or carry on without an account (the data stays on the phone). | Better Auth on Neon · Sign in with Apple/Google | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Keep your plan safe
- [t-body] Sign in so your plan survives a new phone. life never posts anything and never sells your data.
- [btn] Continue with Apple
- [btn] Continue with Google
- [btn] Continue with email
- [btn] Not now, keep it on this phone

## healthprimer — Before Apple Health asks  (Full screen · opens from setup or Body)
about: 07 | Unlocks at level 2 | New in v10 | Before Apple Health asks | A short explanation shown before the system permission dialog: exactly what life reads, why, and that each type can be switched off. Asked only after life has shown its value. | SPEC §2.3 · consent per data type
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Before Apple Health asks
- [t-title1] Plan around how you actually slept
- [t-body] Connect Apple Health and Today gets lighter after a bad night, and harder when you're ready for it.
- [t-body] Sleep
- [t-callout] For your sleep need, debt and bedtime
- [button·icon] Sleep
- [t-body] Heart rate and HRV
- [t-callout] For your readiness score
- [button·icon] Heart rate and HRV
- [t-body] Workouts and steps
- [t-callout] For your load
- [button·icon] Workouts and steps
- [t-body] Food and water
- [t-callout] Only if you log them elsewhere
- [button·icon] Food and water
- [t-callout] Stays on your phone. Never in iCloud, never for ads. Change it any time in Settings.
- [btn] Continue
- [btn] Not now

## notifprimer — One nudge a day, at most  (Full screen · opens from setup)
about: 08 | New in v10 | One nudge a day, at most | Shown the first time life finds something worth a nudge, never at install. Promises the cap and quiet hours up front, with an example. | notifications · quiet hours · 1/day cap | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] One nudge a day, at most
- [t-title1] Can life tap you on the shoulder?
- [t-body] One nudge a day at most, only when it's worth it. Never between 9pm and 8am.
- [row] life
- [t-callout] now
- [t-body] You've got 20 free minutes. Finish the P87 and £840 starts moving.
- [t-body] Quiet hours 21:00–08:00
- [button·icon] Quiet hours
- [t-body] Deadlines under 24 hours
- [button·icon] Deadline alerts
- [btn] Turn on nudges
- [btn] Not now

## micprimer — Before the mic asks  (Full screen · opens from first Talk)
about: 09 | New in v14 | Before the mic asks | One screen before the system asks for the microphone: what life listens for, that it only listens while you hold or tap, and that your voice is turned into text on your phone when it can be. | permission primer · AVAudioSession / RECORD_AUDIO | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Before the mic asks
- [t-title1] Talk to life, out loud
- [t-body] life only listens while you’re talking to it. Your voice becomes text on your phone where it can, and the recording is never kept.
- [btn] Allow the microphone
- [btn] I’ll type instead

## camprimer — Before the camera asks  (Full screen · opens from first snap or scan)
about: 10 | New in v14 | Before the camera asks | Why life wants the camera: meals, letters, payslips and barcodes. Photos are read and then kept only if you choose. | permission primer · VisionCamera | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Before the camera asks
- [t-title1] Snap it, and life reads it
- [t-body] Meals
- [t-callout] Calories and protein in a snap
- [t-body] Letters and payslips
- [t-callout] Dates, amounts, what to do
- [t-body] Barcodes
- [t-callout] Exact food labels
- [t-callout] Photos are read, then deleted unless you keep them.
- [btn] Allow the camera

## calprimer — Before the calendar asks  (Full screen · opens from setup or Calendar-aware day)
about: 11 | New in v14 | Before the calendar asks | Read-only calendar access lets life nudge you in real gaps and never mid-meeting. It never adds or changes events. | permission primer · expo-calendar (read-only) | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Before the calendar asks
- [t-title1] Nudges that fit your day
- [t-body] life looks at when you’re busy, never at what the meeting is about, and never changes your calendar.
- [t-mono] 09:00
- [t-callout] Design review
- [t-mono] 13:40
- [t-callout] 20 free minutes · nudge here
- [t-mono] 14:00
- [t-callout] Deep work
- [btn] Allow calendar access
- [btn] Not now

## devicesetup — Connect what you wear  (Full screen · opens from setup)
about: 12 | New in v14 | Connect what you wear | During setup: pick your watch, ring or strap and connect in one tap, or skip. Anything connected starts building your personal baseline tonight. | HealthKit / Health Connect / WHOOP / Oura OAuth | Full screen
- [tnum] 9:41
- [v21-title] Connect what you wear
- [t-mono] 05 / 06
- [t-title1] Do you wear anything?
- [t-body] life reads sleep, heart rate and workouts from it. You can add more later.
- [t-body] Apple Watch
- [t-callout] via Apple Health
- [t-body] Oura ring
- [t-callout] Oura account
- [t-body] WHOOP
- [t-callout] WHOOP account
- [t-body] Garmin, Fitbit, Polar…
- [t-callout] via Apple Health or Health Connect
- [t-body] Just my phone
- [t-callout] Steps and sleep estimates

## firstmove — Your first move  (Full screen · opens from end of setup)
about: 13 | New in v14 | Your first move | The end of setup. One move, sized to do in two minutes, so day one ends with a win. Then Today opens. | planToday() first run · Ticks | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Your first move
- [span] Your first move
- [t-title1] Start with two minutes
- [t-body] Check your tax code
- [t-callout] Your payslip shows an emergency code. You might be owed money.
- [btn] Do it now
- [btn] Go to Today

## measuresetup — Your body, in three numbers  (Full screen · opens from setup, after where you live)
about: 14 | New in v17 | Your body, in three numbers | A setup step (skippable): height, weight and, optionally, your waist, with metric or imperial. Big steppers, no keyboard. One line says why: so food targets, load and health ranges fit you, not an average person. | CountStepper · units cm/ft-in, kg/st-lb · BodyProfile | Full screen
- [tnum] 9:41
- [v21-title] Your body
- [t-mono] 04 / 07
- [t-title1] Your body, in three numbers
- [t-body] So food targets and health ranges fit you, not an average person.
- [button·segm] Metric
- [button·segm] Imperial
- [t-callout] Height
- [t-title1] 172
- [t-callout] cm
- [row] −
- [row] +
- [t-callout] Weight
- [t-title1] 74
- [t-callout] kg
- [row] −
- [row] +
- [t-callout] Waist (optional)
- [t-title1] 84
- [t-callout] cm
- [row] −
- [row] +
- [btn] Continue
- [btn] Skip for now
