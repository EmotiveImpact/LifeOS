# Your data export includes your files (F-44)

Branch `fix-export-files`, from `v26-integration` at 0c9b9ba.

## What was wrong

"Export your data" gives one file with everything Life's server holds for the account. Files kept on the server, such as a scanned letter or a meal photo someone chose to keep, were only listed by id and type. Getting each file meant opening it in the app one at a time.

## What changed

**Each file that's still kept now comes with a download link.** The link sits in the export beside the file, with the time it stops working.

- A kept file's link works for 7 days, the longest a signed storage link can last.
- A file that goes after a day (a photo being read) has a link that ends when the file goes.
- A file already past its time has no link.
- Exporting again gives fresh links.
- If the person deletes a file or the account, the link stops working too, because the file itself is gone.

The links work like the ones the app already uses to show a file: signed, and for that one file only. The storage paths themselves stay on the server. The export's note now says how the links work, and calls the app Life.

I chose links over putting the files inside the export, because the export is shared as text through the share sheet. Photos would make it very large, and a link gives the same copy.

## Screenshots

None. This is server-side. The phone's "Export your data" row is unchanged.

## Checks

- **Tests:** `tests/api/files-account.test.ts` has 1 new test, run against Postgres and the stand-in bucket:
  - a kept file's link downloads it and lasts 7 days;
  - a file that goes after a day has a link that ends with it;
  - storage keys aren't in the export;
  - a link fails after 7 days, and a new export gives a working one;
  - a file past its time has no link.
- **Full suite:** 943 pass, 0 fail.
- **API typecheck:** clean.
- **The app:** unchanged.

## For Edem

Nothing to decide. If the privacy policy's legal review (F-23) wants the export described in detail, it can say that kept files come as download links that last 7 days.
