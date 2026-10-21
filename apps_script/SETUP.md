# Tobago Event Inventory: setup

Updated 20 October 2026 for the rehosted architecture. The app is now two pieces:

- **The page** — a static site (`index.html` + `config.js` at the root of the GitHub repo), hosted on **GitHub Pages**. It is plain files; no Google sign-in is ever asked of visitors.
- **The API** — the same "Bago Enviro Event Inventory" Apps Script project, deployed as a web app set to **Execute as: Me** and **Who has access: Anyone**. It does not serve pages; it only answers JSON requests from the page. Identity is an **email + PIN** checked against the Members tab of the data sheet (no Google authorization involved).

The Google Sheet is still the database. The Commons still reads its tabs directly, unchanged.

Do all Google steps signed in as **bagoenvi.research@gmail.com** (the host account).

## What is in the repo

| Path | What it is |
| --- | --- |
| `index.html` | The page people use (hosted on GitHub Pages) |
| `config.js` | The one setting: the API's `/exec` URL |
| `apps_script/Code.gs` | The server: JSON API, login/PIN tokens, setup, records, members, activity log, GIS export, weekly maintenance |
| `apps_script/Schema.gs` | Every tab, field, help text and default drop-down list |
| `apps_script/Seed.gs` | The fictional training examples (IDs contain EX-) |
| `apps_script/appsscript.json` | Settings: time zone etc. |
| `events/build.py` | Builds the offline training workbook and GeoPackage |

The repo is the master copy: code changes go repo → `clasp push` → the live API, never through the Apps Script editor.

## 1. Create / update the script project

1. The project "Bago Enviro Event Inventory" already exists (scriptId in `README.md`). To push from this repo: create `.clasp.json` here with `{"scriptId": "<that id>", "rootDir": "apps_script"}` and run `clasp push -f` (always `-f`; plain `clasp push` can falsely report "Skipping push").
2. For a brand-new project instead: script.google.com → New project, paste `Code.gs`, `Schema.gs`, `Seed.gs`, set the manifest from `appsscript.json`.

## 2. Deploy the API (one UI step, must be done in the browser)

**Deploy → Manage deployments → edit (pencil) the live deployment:**

- **Execute as:** **Me** (the host account)
- **Who has access:** **Anyone**

Then **Deploy** (new version, same URL). Verify by opening the `/exec` URL: it should show a small JSON line `{"ok":true,...}` — that is the health check, and it must be visible **without signing in to Google**.

Why "Anyone" is safe here: the API refuses every request without a valid login token. The token comes from `login(email, pin)`, and the PIN is checked against the Members tab. A stranger with the URL gets nothing. (The old 14 Oct guide said the opposite — "never deploy as Me" — because the old design relied on Google's per-visitor sign-in, which is exactly the piece that proved unreliable.)

## 3. Run setup and seed

1. In the editor choose **setup** and press **Run**. Approve the permissions (Advanced → Go to …). The execution log lists the inventory folder, the data sheet, the restricted WhatsApp folder and the activity log, and — the first time — the **first admin's sign-in PIN**. Save that PIN.
2. Choose **seedExamples** and press **Run** if you want the training examples.
3. Running `setup` again later is safe: it adds tabs/columns/drop-down values without touching records and re-applies the Members lock.

## 4. Host the page on GitHub Pages

1. On github.com (account BagoEnvi-netizen) create a **public** repository named `bago-enviro-event-inventory` — empty, no README.
2. In a local clone of this repo: `git remote add origin git@github.com:BagoEnvi-netizen/bago-enviro-event-inventory.git` then `git push -u origin main`.
3. Repo **Settings → Pages → Source: Deploy from a branch, main / (root)**. The site URL is `https://bagenvi-netizen.github.io/bago-enviro-event-inventory/` — GitHub shows it on the Pages settings page.
4. `config.js` at the repo root already points at the API's `/exec` URL; only change it if the project is ever rebuilt.

## 5. Give the team access (Admin tab)

Open the **GitHub Pages URL** (not the `/exec` URL) and sign in with the host email + PIN from step 3.

1. **Admins.** Add the Director of Climate Unit and one other person as **admin** (agreed). The host account always stays an admin.
2. **Members.** **Add a member**: email, name, role, team, position. Leave the PIN box blank to auto-generate one — the Admin tab shows the new PIN; give it to the person with the app link. To change a PIN later, open the member, type the new PIN, save.
3. **Roles.** *admin* manages members, guide links, deleted records, training examples. *editor* enters and edits records. *viewer* reads and downloads only (partners such as the Coastal Unit).
4. **Folder access.** Adding a member also shares the inventory folder with them (Editor, or Viewer for viewers) so the Excel/CSV downloads work. If Drive refuses, the Admin tab says so.
5. **Removing someone** marks them *removed*, which also locks them out of sign-in, and takes away folder access.
6. **Access requests.** Anyone who opens the app and is not on the list can ask for access; admins get an email and approve on the Admin tab.
7. **Restricted WhatsApp folder.** Never shared by the app. The host shares **Community reports – restricted** with Climate Unit members only. Photos attached in the app are now saved by the API running as the host account — the folder must stay shared with the host (it is the owner).

## 6. Link it from the Commons

1. In the Commons **Spaces** section, point the Event Inventory space at the **GitHub Pages URL** from step 4.
2. In the Commons settings, keep `eventInventorySheet` on the **data sheet** link. The Commons reads it daily; that integration does not care where the page is hosted.
3. Put the Pages URL in the how-to guide and the manual.

## 7. Guide links, GIS export, weekly maintenance

Unchanged from the 14 Oct build: set the four guide links on **Admin → Guide links**; run **installWeeklyGisExport** and **installWeeklyMaintenance** once in the editor.

## Deleting, recovering, training examples, activity — unchanged

Same as the 14 October guide: soft delete with recovery by admins, `purgeDeleted` in the editor, training examples removed from the Overview tab, the activity log for admins and the History box for every record.

## Updating the code

1. Edit in the repo. Mirror schema changes in `events/build.py` and rebuild the offline workbook if needed.
2. `git add -A` (check `git status` — no data files), commit, push.
3. `clasp push -f` → **Deploy → Manage deployments → Edit → New version** (API only).
4. The page updates the moment you push to GitHub; the URL never changes.

## Phases

Same as the 14 October build: everything is Phase 2. Set `PHASE = 1` at the top of `Code.gs` and redeploy to show Phase 1 screens only.
