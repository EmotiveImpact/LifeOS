# Plan · Money

Source content from the V23 board (the established screens). Tags in [brackets] are the old style names: t-display = big number, t-statement = two-tone sentence, t-title1 = title, btn = button, chip = chip.

## money — Money  (Push · opens from Money area)
about: 51 | Unlocks at level 2 | Money | Level 2. Your balance with a privacy eye, a scrubber to look back day by day, accounts, and a clean ledger. | CashflowLedgerSheet · getAvailableBankAccounts | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Money
- [button·icon] Hide balance
- [t-callout] Today · all accounts
- [t-display] £2,340
- [t-display] .50
- [t-callout] ▲ 12.4%
- [t-callout] · +£260.20 this month
- [t-callout] Everyday
- [t-title3] £612.40
- [t-callout] Bills pot
- [t-title3] £1,148.10
- [t-callout] Buffer
- [t-title3] £580.00
- [t-title3] Ledger
- [t-callout] Today
- [t-body] Salary · Acme Ltd
- [t-callout] Income
- [t-title3] +£2,410.66
- [t-body] Rent
- [t-callout] Standing order
- [t-title3] £1,150.00
- [t-body] Moved to buffer
- [t-callout] Payday sweep
- [t-title3] £180.00
- [t-body] Adobe Creative Cloud
- [t-callout] Subscription
- [t-title3] £56.98

## subs — Subscriptions  (Push · opens from Money → Subscriptions)
about: 52 | Unlocks at level 2 | Subscriptions | Level 2. Everything you pay for, when it renews, and what you haven't used. Cancel with the provider in one tap. | DEFAULT_SUBSCRIPTIONS · quarterly check | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Subscriptions
- [t-callout] Every month
- [t-display] £91
- [t-display] .95
- [t-callout] £31.98 of it you haven't used in 60 days
- [t-callout] Not being used
- [t-body] Netflix
- [t-callout] Not used in 74 days
- [t-title3] £12.99
- [button·chipb] Cancel
- [t-body] Gym Group
- [t-callout] Not used in 61 days
- [t-title3] £18.99
- [button·chipb] Cancel
- [t-callout] Still in use
- [t-body] Adobe Creative Cloud
- [t-callout] Renews in 4 days
- [t-title3] £56.98
- [t-body] iCloud+ 200GB
- [t-callout] Renews 2 Dec
- [t-title3] £2.99
- [t-callout] life opens the provider's cancel page. Nothing is cancelled without you.

## area — Area: Money  (Push · opens from Plan → Money)
about: 53 | New in v11 | Area: Money | Each of the six life areas opens a page like this: how strong it is (progress, not a separate level), its missions, routines, tools and things to know, all in one place. | LIFE_AREAS · computeLifeAreaProgress | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Money
- [t-callout] How strong
- [t-callout] Building
- [t-callout] Buffer 1.3 months · tax up to date · 1 rebate in progress
- [t-title3] Missions
- [t-callout] 2 active
- [t-body] HMRC tax rebate
- [t-callout] £840 · submitted
- [tag] Live
- [t-body] Lifetime ISA
- [t-callout] 25% bonus
- [tag] To do
- [t-title3] Routines
- [t-body] Payday sweep
- [t-callout] Next 28 Nov
- [tag] Active
- [t-title3] Tools
- [t-body] 30-day cash plan
- [t-body] Money & ledger
- [t-body] Subscriptions

## txn — A payment  (Push · opens from Money → a payment)
about: 54 | New in v14 | A payment | One payment, explained: who, what category, whether it repeats, and what life did with it. Recategorise in a tap; life learns. | Transaction · rules engine (Actual-style) | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Payment
- [button·icon] More
- [span] T
- [t-callout] Tesco · 14 Nov, 18:22
- [t-display] £42
- [t-display] .17
- [t-body] Category
- [t-callout] Groceries
- [t-body] Repeats
- [t-callout] About weekly
- [t-callout] Normal
- [t-body] This month
- [t-callout] £186 of £240 groceries
- [t-callout] On track
- [btn] Split with Sam

## bill — A bill  (Push · opens from Money → a bill)
about: 55 | New in v14 | A bill | Every bill has a page: amount, due date, how it’s paid, history, and whether you could pay less. If there’s a saving, “Do it for me” can switch or claim it with your OK. | Bill · Countdown · Do it for me | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Council tax
- [button·icon] More
- [t-title1] £148
- [t-title1] .00
- [t-callout] a month · Direct Debit · due 1st
- [tag] In 16 days
- [t-body] You could pay £37 less a month
- [t-callout] You live alone, so the 25% single person discount applies.
- [btn] Claim it for me
- [t-callout] Last 12 months

## budget — Budget  (Push · opens from Money → Budget)
about: 56 | Unlocks at level 2 | New in v14 | Budget | A simple envelope budget: every pound has a job. Each envelope shows what’s left, and the month’s pace is one line. Move money between envelopes by dragging. | Envelope budgeting (Actual, MIT) · CapsuleMeter
- [tnum] 9:41
- [button·icon] Back
- [v21-title] November
- [button·button] Edit
- [t-callout] Money
- [t-title1] November
- [t-body] £612 left to spend · 16 days to go
- [t-callout] Flexible spending
- [t-body] Going out
- [t-callout] £142 of £150
- [t-body] Groceries
- [t-callout] £186 of £240
- [t-body] Transport
- [t-callout] £48 of £120
- [t-callout] Already covered
- [t-body] Rent
- [t-callout] £950 of £950
- [t-body] Tax pot
- [t-callout] £680 of £680

## networth — Net worth  (Push · opens from Money → Net worth)
about: 57 | Unlocks at level 3 | New in v14 | Net worth | Everything you own minus everything you owe, over time. Pensions and property count. The trend matters more than the number, so the line leads. | NetWorth timeline (Maybe idea, AGPL: ideas only) · level 3
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Net worth
- [button·icon] Hide numbers
- [t-display] £23,480
- [t-display] .00
- [t-callout] ▲ £6,120 this year
- [row] Dec
- [row] Nov
- [t-callout] What makes it up
- [t-body] Savings and ISA
- [t-callout] £12,400
- [t-body] Pension
- [t-callout] £14,880
- [t-body] Student loan
- [t-callout] − £3,800
- [t-callout] Doesn’t act like debt

## connectbank — Connect your bank  (Full screen · opens from Money → Connect)
about: 58 | New in v14 | Connect your bank | Open Banking, read-only, through a regulated provider. life sees balances and payments, never your login, and can’t move money. Access expires after 90 days unless you renew. | Open Banking (AIS) via a regulated aggregator · later phase | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] See all your money in one place
- [t-title1] See all your money in one place
- [t-body] Read-only
- [t-callout] life can’t move money
- [t-body] Your login stays with your bank
- [t-callout] You approve in your bank’s app
- [t-body] Ends after 90 days
- [t-callout] Renew in one tap
- [chipb] Monzo
- [chipb] Starling
- [chipb] Barclays
- [chipb] HSBC
- [chipb] Lloyds
- [chipb] Nationwide
- [btn] Choose your bank
