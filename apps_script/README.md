# Tobago Event Inventory: Apps Script source

This is the API of the live inventory: a Google Apps Script project (JSON API) with a Google Sheet behind it. The page itself lives at the repo root (`index.html` + `config.js`) and is hosted on GitHub Pages — see SETUP.md for the architecture.

It was recovered on 19 October 2026 from the Tobago Event Inventory preview page (https://claude.ai/artifact/N4jETMeaxS3PtBfv6zmjYM, version of 14 October). The preview runs this same code against stand-in Google services.

| File | What it is |
|---|---|
| Code.gs | The API: setup(), login/PIN tokens, the doPost router, members and access, saving records, history, activity log, soft delete and purgeDeleted(), weekly GIS export and weekly maintenance. |
| Schema.gs | Every tab, field, help text and drop-down list (SCHEMA). The workbook build (events/build.py) follows this field list. |
| Seed.gs | The fictional training examples (SEED). Load with seedExamples(). |
| appsscript.json | The project manifest: Port of Spain time zone, V8. The deployment is *Execute as: Me* + *Anyone* — safe because every action needs a login token (email + PIN). Taken unchanged from the 13 October (v1) folder. |
| SETUP.md | Install and update steps for the current code (20 October). Replaces the v1 guide, which did not cover the Admin tab, the activity log, soft delete or the weekly maintenance. The step numbers match the ones the Admin tab's Housekeeping panel refers to (step 7 GIS export, step 8 weekly maintenance). |

## What was changed when recovering it
- Taken out: the preview's stand-ins for SpreadsheetApp, DriveApp and other Google services, the "View as" switch, the "Behind the scenes" panel and the fictional preview members.
- Put back: in Index.html, the preview read the schema with `schemaWithLookups_()`. That line is back to the template tag `const S = <?!= schemaJson ?>;`.
- Everything else is as it runs in the preview. All four files pass a syntax check.

## Where appsscript.json and SETUP.md came from
They aren't part of the preview page. They were found on 20 October in the unzipped 13 October (v1) folder Tobago_Event_Inventory_AppsScript_v1. That folder's Code.gs and Index.html are older than these (487 lines of Code.gs against 1,126), so don't install them; its Schema.gs and Seed.gs match these.

## Known small issue (not changed)
In Seed.gs, the note on HE-EX-001 says "Caused EX-2026-0001 and EX-2026-0002". The events it caused are EX-2025-0001 and EX-2025-0002. The workbook build has the correct IDs.
