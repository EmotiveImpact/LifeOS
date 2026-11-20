# You · People and dates

Source content from the V23 board (the established screens). Tags in [brackets] are the old style names: t-display = big number, t-statement = two-tone sentence, t-title1 = title, btn = button, chip = chip.

## people — Your people  (Push · opens from You → People)
about: 178 | New in v15 | Your people | Birthdays, anniversaries and the people you want to stay close to. Birthdays come from your contacts (with your OK) or from what you tell life. Upcoming dates sit at the top; gentle “you haven’t spoken in a while” nudges are opt-in per person. | Person { name, relation, dates[], lastContact, giftIdeas[] } · Contacts import | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Your people
- [button·icon] Add someone
- [t-callout] You
- [t-title1] Your people
- [t-body] 12 people · 3 dates this month
- [t-callout] Coming up
- [card] K
- [t-body] Kofi
- [t-callout] Sat
- [card] P
- [t-body] Priya
- [t-callout] 2 Dec
- [card] S
- [t-body] Sam
- [t-callout] 9 Jan
- [button·li] K
- [t-body] Kofi
- [t-callout] Birthday Saturday · turning 31
- [button·li] E
- [t-body] Grandma Efua
- [t-callout] Called 2 weeks ago
- [button·li] P
- [t-body] Priya
- [t-callout] Birthday 2 Dec
- [button·li] S
- [t-body] Sam
- [t-callout] Anniversary 9 Jan
- [button·li] T
- [t-body] Tom
- [t-callout] Haven’t spoken in 6 weeks

## person — A person  (Push · opens from People → a person)
about: 179 | New in v15 | A person | Everything about someone in one place: their dates, gift ideas you’ve mentioned (filed from Talk), notes, and when you last spoke. A birthday becomes a small mission: card by Wednesday, message on the day. | Person · FiledRecord(person) · Mission(birthday) | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Kofi
- [button·button] Edit
- [span] K
- [t-title1] Kofi
- [t-callout] Brother · turning 31 on Saturday
- [t-body] Birthday plan
- [tag] 4 days
- [t-body] Order a card
- [t-callout] By Wednesday for Saturday
- [t-body] Get the gift
- [t-callout] From your ideas below
- [t-body] Message on the day
- [t-callout] life drafts it, you send it
- [t-callout] Gift ideas you mentioned
- [t-body] Running vest
- [t-callout] “his old one’s falling apart” · Talk, Sep
- [t-body] Ghana match tickets
- [t-callout] Chat, August
- [t-body] Last spoke
- [t-callout] Sunday · phone call
- [t-body] Remind me to call
- [t-callout] Every 2 weeks
- [button·icon] Remind me

## addperson — Add people from contacts  (Sheet · opens from People → +)
about: 180 | New in v15 | Add people from contacts | Choose who matters; life only reads the contacts you pick, and only their name and dates. Birthdays already in your contacts come straight across. | CNContactStore / Contacts provider · selected contacts only | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Add people from contacts
- [t-callout] Only the people you tick are added.
- [t-body] Kofi Mensah
- [t-callout] Birthday 18 Nov
- [t-body] Priya Shah
- [t-callout] Birthday 2 Dec
- [t-body] Efua Mensah
- [t-callout] No birthday saved
- [t-body] Daniel Okafor
- [t-callout] Birthday 30 Apr
- [t-body] Hannah Lee
- [t-callout] No birthday saved
- [btn] Add 3 people

## birthdaynudge — A birthday, on Today  (Card · opens from Today, 4 days before)
about: 181 | New in v15 | A birthday, on Today | Four days before, the birthday shows up on Today as one card with the next step, timed so the post still arrives. On the day: a drafted message, ready to send. | Nudge(kind: date) · lead time from delivery · Draft | Card
- [tnum] 9:41
- [button·icon] Back
- [v21-title] A birthday, on Today
- [row] Saturday
- [row] Kofi turns 31
- [t-title2] Order his card today
- [t-callout] Second-class post arrives by Friday.
- [t-callout] On Saturday morning life will draft a message for you to send.
- [btn] Done
- [btn] Gift ideas

## dates — Important dates  (Push · opens from People → Dates)
about: 182 | New in v15 | Important dates | Every date that matters in one list: birthdays, anniversaries, and dates you’d rather mark quietly, like a loss. Each can have its own reminder, or none. | Date { kind: birthday | anniversary | memorial | custom, reminder } | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Dates
- [button·icon] Add a date
- [t-callout] November
- [t-title3] 18
- [t-body] Kofi’s birthday
- [t-callout] Turning 31 · card by Wed
- [t-title3] 29
- [t-body] Your mum’s birthday
- [t-callout] Reminder a week before
- [t-callout] December
- [t-title3] 2
- [t-body] Priya’s birthday
- [t-title3] 14
- [t-body] Grandpa Kwame
- [t-callout] Remembered quietly · no reminder
- [t-callout] January
- [t-title3] 9
- [t-body] Anniversary with Sam
- [t-callout] 5 years
