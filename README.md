# bago-enviro-event-inventory

The **Tobago Event Inventory**: the Climate Unit's record of past hazard events in Tobago and their impacts and loss and damage. A Google Apps Script web app with a Google Sheet behind it, run as the person using it. It is kept separately from the [Bago Enviro Commons](https://github.com/BagoEnvi-netizen/bago-enviro-commons), which links to it as a Space and reads its sheet daily.

See `apps_script/README.md` for what each file is and `apps_script/SETUP.md` for install and update steps.

## Layout

| Path | What it is |
|---|---|
| `apps_script/` | The live app source: `Code.gs`, `Schema.gs`, `Seed.gs`, `Index.html`, `appsscript.json`, plus `SETUP.md` and `README.md` (documentation only — clasp does not push `.md` files) |
| `events/build.py` | Builds the offline training workbook and GeoPackage. When the schema changes: change `Schema.gs` first, then this script, then rebuild |

## Repo rules (same as the Commons)

- **The repo holds code only.** Never commit the data sheet, Drive exports, workbooks, GeoPackages or anything containing personal data. `.gitignore` blocks the common cases; check `git status` before every commit.
- **Code changes go from the repo to clasp to the live app — never through the Apps Script editor.** Run `setup` in the editor when the update calls for it, but never edit code there.
- Releases follow the Commons pattern: commit and push here, then `clasp push`, then run `setup` if needed, test, then **Deploy → Manage deployments → Edit → Version: New version** so the `/exec` URL never changes.

## Local setup (one time)

1. **Create `.clasp.json` in this folder** (it is gitignored) with the live project's scriptId:

   ```json
   { "scriptId": "1I3Q3K65B4b3x0BYO2rNJBba59SzSsW71MP0mnNaO42gKSmWKF9jTDYcV", "rootDir": "apps_script" }
   ```

   This is the ID of the live project "Bago Enviro Event Inventory" (v3). Signed in as bagoenvi.research@gmail.com. `clasp list` on this machine already shows the Commons project, so clasp auth is done. (A `.clasp.json` with this ID already exists in this folder on the build machine.)

2. `clasp push` uploads everything in `apps_script/` (`.gs`, `.html`, `appsscript.json`). `.md` files stay repo-only.

## Release steps (every update)

1. Edit the source (in a build folder or straight in `apps_script/`).
2. If the schema changed: mirror it in `events/build.py` and rebuild the offline workbook.
3. `git add -A`, check `git status` (no data files!), commit, push.
4. `clasp push`.
5. Run **setup** in the editor if the update adds tabs, columns or drop-down values — it is safe to rerun and never touches existing records.
6. Test the `/dev` link.
7. **Deploy → Manage deployments → Edit → Version: New version.**

## Status

- Code baseline: Apps Script version of 14 October 2026 (recovered 19 October), plus **SLS ("Severe local storm") added to the trigger and he_hazard lists, mapped Climate-related** (concern C1, agreed change 3a, 20 October 2026).
- **Live project: "Bago Enviro Event Inventory" (v3)**, scriptId `1I3Q3K65B4b3x0BYO2rNJBba59SzSsW71MP0mnNaO42gKSmWKF9jTDYcV`, web app `https://script.google.com/macros/s/AKfycbyHpiU8dJp7Rygh92fneWPsWwEQH_BdL8t75kPRnkLCRH_jASPGk2GzyxY-ZcrXSynW/exec`. All 5 files pushed, deployment @1. **Not yet live-checked**: `setup` and `seedExamples` still need to be run in the editor, and deployment access needs to be "Anyone with a Google account" for team members.
- **Fixed 20 October 2026 — page stuck on "Loading the inventory…":** the `Uncaught SyntaxError: Unexpected identifier 'id'` in `userCodeAppPanel` was our own code, not a Google race. When Apps Script serves `Index.html` it strips `//` comments, and it mistook the `//` in `"https://"` (followed by a quote or space) for a comment, cutting two lines of the page script (the URL field placeholder and the bad-link message). The whole script then failed to parse, so the page never started. Both are now written `https:\/\/`. **Rule for Index.html: never write `//` followed by a space, quote or bracket inside a string or template literal — write `\/\/` instead.**
- Superseded test projects v1 and v2 and the "EI Dialog Test" project are queued for deletion — see `BUILD-DECISIONS.md`.
