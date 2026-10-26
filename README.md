# bago-enviro-event-inventory

The **Tobago Event Inventory**: the Climate Unit's record of past hazard events in Tobago and their impacts and loss and damage. Hosted as a static page on GitHub Pages, backed by a Google Sheet through a JSON API running on Google Apps Script ("Execute as: Me"). Members sign in with email + PIN; no Google authorization is ever asked of visitors. It is kept separately from the [Bago Enviro Commons](https://github.com/BagoEnvi-netizen/bago-enviro-commons), which links to it as a Space and reads its sheet daily.

See `apps_script/SETUP.md` for install and update steps and `apps_script/README.md` for what each server file is.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The page people use (static; hosted on GitHub Pages) |
| `config.js` | The one setting: the API's `/exec` URL |
| `apps_script/` | The API source: `Code.gs`, `Schema.gs`, `Seed.gs`, `appsscript.json`, plus `SETUP.md` and `README.md` (documentation only — clasp does not push `.md` files) |
| `events/build.py` | Builds the offline training workbook and GeoPackage. When the schema changes: change `Schema.gs` first, then this script, then rebuild |

## Repo rules (same as the Commons)

- **The repo holds code only.** Never commit the data sheet, Drive exports, workbooks, GeoPackages or anything containing personal data. `.gitignore` blocks the common cases; check `git status` before every commit.
- **Code changes go from the repo to clasp to the live API — never through the Apps Script editor.** Run `setup` in the editor when the update calls for it, but never edit code there.
- Releases: commit and push here (page updates instantly), then `clasp push -f` → **Deploy → Manage deployments → Edit → Version: New version** so the `/exec` URL never changes.

## Local setup (one time)

1. **Create `.clasp.json` in this folder** (it is gitignored) with the live project's scriptId:

   ```json
   { "scriptId": "1I3Q3K65B4b3x0BYO2rNJBba59SzSsW71MP0mnNaO42gKSmWKF9jTDYcV", "rootDir": "apps_script" }
   ```

   This is the ID of the live project "Bago Enviro Event Inventory" (v3). Signed in as bagoenvi.research@gmail.com. (A `.clasp.json` with this ID already exists in this folder on the build machine.)

2. `clasp push -f` uploads everything in `apps_script/`. Always `-f` — plain `clasp push` can falsely report "Skipping push".

## Status

- Code baseline: Apps Script version of 14 October 2026 (recovered 19 October), plus **SLS ("Severe local storm") added to the trigger and he_hazard lists, mapped Climate-related** (concern C1, agreed change 3a, 20 October 2026).
- **20 October 2026, evening — rehosted.** The page moved out of Apps Script hosting to a static site (this repo + GitHub Pages); the Apps Script project became a JSON API (Execute as: Me, access Anyone) with email+PIN login. Reason: Google's per-visitor authorization dialog for consumer accounts was unreliable to the point of unusable (a server-side `//` comment-stripper corrupted the served page; see the decisions log). All screens and rules unchanged.
- **Live project: "Bago Enviro Event Inventory" (v3)**, scriptId `1I3Q3K65B4b3x0BYO2rNJBba59SzSsW71MP0mnNaO42gKSmWKF9jTDYcV`, API `https://script.google.com/macros/s/AKfycby8p7rIm93kbL_zPorzghpIwmMtIsuQCOhNjRdHhZIAFwtjYO9i55QEcF62ORFVOJ98/exec` (deployment @14). **Go-live checklist**: deployment set to Execute-as-Me + Anyone (UI step) → `setup` + `seedExamples` in the editor → GitHub repo created and Pages enabled → verify sign-in with the generated first-admin PIN. **`.clasp.json` must always point at this scriptId** — there are stale look-alike projects on the account ("Tobago Event Invent…"); check `clasp deployments` shows the `@14` deployment above before pushing.
- Superseded test projects v1 and v2 and the "EI Dialog Test" project are queued for deletion — see the decisions log in the build workspace.
