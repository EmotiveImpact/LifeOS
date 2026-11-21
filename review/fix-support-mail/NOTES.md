# Help writes to a person (F-10's build work)

Branch `fix-support-mail`, from `v26-integration` after the TestFlight intro joined. It does the build half of P0 item F-10. The other half is the support address, which waits on the domain (F-09).

## What changed

Help's "Email us" and "Report a number" used to remember the tap and change their words, and nothing reached anyone. Now each opens a new email in the phone's mail app:

| Button | Subject | Body |
|---|---|---|
| Email us | A question about Life | "Hello," and room to write |
| Report a number | A number in Life looks wrong | Three prompts: the number, where it was seen, what was expected |

Under the message there is one line, such as `Sent from Life 1.0.0 (41) on iOS 18.2`, so a tester's note arrives with what's needed to look into it. The system comes from `expo-device` (its name and version, never the phone's own name, which often carries its owner's). Nothing else about the person goes in: no name, account, figures or data. They write the rest and can delete any of it before sending.

- **The address comes from the build.** `EXPO_PUBLIC_SUPPORT_EMAIL`, set per profile in `eas.json`. Only a plain address is used (nothing that could add a copy or change the link). There is no address in the code.
- **Without an address**, Help says under the button: "Support isn’t connected in this build yet, so nothing was sent." That is every build today.
- **Without a mail app**, Help says: "This phone has no mail app set up. Write to … from any email."
- The old `support-report` and `support-email` flags are gone, and Email us always reads "A person replies within a day", as on the board.

The code is in `apps/mobile/src/services/support.ts`, and Help in `screens/v26/settings.tsx`. The privacy policy and the record of processing already cover emails to support (a retention row and processing row 13), so neither changed. The fix list now shows the build work done and the address still to set.

## Screenshots

`help-not-set.light.jpg` and `help-not-set.dark.jpg`: Help after tapping Email us in a build with no address. Taken from the release web build (`EXPO_PUBLIC_SAMPLE_DATA=0`).

## Checks

- **Tests:** `tests/launch/support.test.ts` is new (8 tests). It checks which addresses are accepted, the exact subject and body of both emails, that nothing opens without an address, the no-mail-app answer, Help's wiring, and that no address is written into the code. The full suite passes (871 tests with Postgres).
- **Typecheck:** clean.
- **Bundles:** the iOS, Android and web exports build.

## For Edem

- **Which address?** Once the domain exists (F-09), tell me the support address, or I'll use `support@` on it. I'll add it to the preview and production profiles in `eas.json`. Someone needs to read that mailbox: the Help page promises a reply within a day.

## Known limits

- Until the address is set, "Email us" still says "A person replies within a day" before it's tapped, as on the board. The note under it says support isn't connected once tapped.
- Attaching a screenshot needs the person to add it in their mail app. Life doesn't attach anything itself.
