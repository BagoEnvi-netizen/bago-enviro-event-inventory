# Tobago Event Inventory: setup

Updated 20 October 2026 for the current code (14 October). It replaces the 13 October (v1) guide: it adds the Admin tab, the admin-only activity log, soft delete and recovery, and the weekly maintenance.

The inventory is a Google Apps Script web app with a Google Sheet behind it, built the same way as the Bago Enviro Commons. It is the Climate Unit's own record and is kept separately from the Commons; the Commons links to it from its Spaces section.

Do all of this signed in as **bagoenvi.research@gmail.com** (the host account). It takes about 30 minutes.

## What is in this folder

| File | What it is |
| --- | --- |
| `Code.gs` | The server script: setup, reading and saving records, ID numbering, links between events and sources, members and access, the activity log, deleting and recovery, the GIS export and the weekly maintenance |
| `Schema.gs` | Every tab, field, help text and default drop-down list |
| `Seed.gs` | The fictional training examples (IDs contain EX-) |
| `Index.html` | The page people use |
| `appsscript.json` | Settings: time zone, and that the app runs as the person using it |

## 1. Create the script

1. Go to https://script.google.com and choose **New project**. Name it **Tobago Event Inventory**.
2. Rename the starting file `Code.gs` if needed, delete its contents, and paste in `Code.gs` from this folder.
3. Use **+ → Script** to add `Schema` and `Seed`, and paste in `Schema.gs` and `Seed.gs`.
4. Use **+ → HTML** to add `Index`, and paste in `Index.html`.
5. Open **Project Settings** (gear icon), tick **Show "appsscript.json" manifest file in editor**, then open `appsscript.json` and paste in the file from this folder.
6. Save.

## 2. Run setup

1. In the editor, choose the function **setup** and press **Run**. Approve the permissions when asked. Google will warn that the app is unverified, because it is your own script: choose **Advanced → Go to Tobago Event Inventory**. The app asks to use Drive and Sheets (the data), to send email (access requests go to the admins) and to run on a timer (the weekly jobs).
2. Open **Execution log**. It lists four links:
   - the **inventory folder**, which holds the data spreadsheet;
   - the **data sheet**;
   - the **Community reports – restricted** folder for WhatsApp evidence. It is created on its own, outside the inventory folder;
   - the **activity log**, a separate spreadsheet in the host account's My Drive, outside the inventory folder. The app shares it with the admins only.
3. The account that runs setup is added to the Members tab as the first **admin**. The Members tab is locked so that only the owner of the data sheet and the admins can edit it.
4. If you want the training examples, choose **seedExamples** and press **Run**.

Running `setup` again later is safe. It adds any new tabs, columns and drop-down values without touching existing records, and re-applies the Members lock.

## 3. Deploy the web app

1. Choose **Deploy → New deployment → Web app**.
2. **Execute as:** *User accessing the web app*. **Who has access:** *Anyone with Google account*. This matches the Commons: the app only shows records to people who can open the inventory folder **and** are listed on the Members tab. Never deploy it as *Me*: the app would then treat every visitor as the host account. The app refuses anyone it can't identify.
3. Press **Deploy** and copy the **Web app URL** (it ends in `/exec`).
4. Later updates: **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. This keeps the same URL, so the Commons link never changes. Don't use "New deployment" for updates, because that creates a new URL.

## 4. Give the team access (Admin tab)

Open the web app and go to the **Admin** tab. Only admins see it.

1. **Admins.** Add the Director of Climate Unit and one other person as **admin** (agreed). The host account always stays an admin, and there must always be at least one.
2. **Members.** Add everyone else with **Add a member**: email, name, role, team and position.
   - **Roles.** *admin* also manages members, guide links, deleted records and the training examples. *editor* enters and edits records. *viewer* reads and downloads only; partners such as the Coastal Unit get viewer.
   - **Folder access.** Adding a member shares the inventory folder with them: Editor for admins and editors, Viewer for viewers. If Drive refuses, the Admin tab says so; share the folder by hand.
   - **Names.** The name is used to fill "recorded by" automatically.
3. **Removing someone** marks them *removed* on the Members tab, so names on old records still make sense, and takes away their folder access.
4. **Access requests.** Anyone not on the list who opens the app can ask for access. The admins get an email and approve or decline the request on the Admin tab.
5. **Restricted WhatsApp folder.** The app never shares this folder. The host shares **Community reports – restricted** in Drive with Climate Unit members only, as **Editor** (the Attach photos button saves into it as the person using it). Never share it with partners. When someone is removed, the app tries to take them off it, and warns if it can't.

Don't edit the Members tab by hand. It is locked, and the Admin tab keeps the folder sharing and the activity log in step.

## 5. Link it from the Commons

1. In the Commons **Spaces** section, add a space:
   - **Web address:** the `/exec` URL from step 3.
   - **Access check:** paste the link of the **inventory folder**. The Commons then shows each person whether they already have access, and lets them request it.
2. In the Commons settings, set `eventInventorySheet` to the link of the **data sheet**. The Commons reads it every day to count events per hazard. The host account and Climate Unit members need at least view access to it.
3. When the `/exec` link exists, add it to the how-to guide and the manual.

## 6. Point the guide links at copies anyone can open

The How-to guide tab shows four links. They currently point to claude.ai, which needs a Claude account.

1. Export the guide, the manual and the Event Inventory open questions extract to Google Docs, and put them in a **Guides** folder inside the inventory folder.
2. Put the Google copy of the full CRVA open questions log in a Climate Unit-only folder.
3. Paste all four links on **Admin → Guide links**. Links must start with https://.

## 7. Switch on the weekly GIS export

In the editor, choose **installWeeklyGisExport** and press **Run** once, as the host account. Every Monday at about 6am it saves a CSV of verified events with coordinates in a **GIS exports** folder inside the inventory folder. "Verified" means Desk-verified, Partner-observed or Field-verified; training examples are left out. The GIS Specialist loads the CSV into the GeoPackage. The column `training_ready` marks landslide and flood points precise enough to train the susceptibility maps. Anyone who can enter records can also press **Export now** on the Overview tab.

## 8. Switch on the weekly maintenance

In the editor, choose **installWeeklyMaintenance** and press **Run** once, as the host account. Every Sunday at about 7am it:
- copies the whole data sheet into an **Inventory backups** folder inside the inventory folder (the newest 8 are kept);
- copies the activity log to a host-only archive and checks that the two still match (any changed or missing entry is flagged on the Admin tab);
- re-applies the Members lock, the admin list and who can open the activity log;
- keeps only the newest 8 GIS export files.

It also moves new activity into the activity log every hour.

The Admin tab's **Housekeeping** panel shows when the maintenance and the GIS export last ran, and flags them if they are more than a week old.

## Deleting, recovering and the training examples

- **Deleting** a record hides it in the app, but the row stays in the Sheet marked `deleted`, with who deleted it and when. An event keeps the list of sources it was linked to.
- **Recovering:** admins bring a record back from **Admin → Deleted records**, with its links.
- **Removing deleted rows for good** is done only from the script editor, by an admin. Run `purgeDeleted` to remove every deleted row. To remove only rows deleted more than, say, 90 days ago, add a small function that calls `purgeDeleted(90)` and run that.
- **Training examples:** an admin removes them all with the button in the **Training examples** box on the Overview tab, before real data entry.

## Activity and history

- **Activity log:** every sign-in refusal, member change, access request, record change, photo upload, export and settings change. Admins see it in plain words on **Admin → Activity**, and only they can open the log spreadsheet.
- **History box:** every member sees who added and changed each record, from the History tab of the data sheet.

## Where things are

| Tab in the data sheet | Holds |
| --- | --- |
| Events, Sources, Field checks, Hazardous events | The main records |
| Met Service IDs | Official hazardous event IDs from the Met Service, matched to our hazardous events |
| Slow-onset losses | Indicators tracked over time (beach width, well salinity) |
| Human effects, Damage and losses, Ecosystem losses, Non-economic losses, Response funding | Loss and damage detail for significant events |
| Event_Sources | One row per link between an event and a source (kept by the web app) |
| Lookups | Drop-down values, one row each. Change them only by team decision. |
| Members | Who can use the inventory: email, name, role, position, team. Locked to the owner and admins; managed from the Admin tab |
| Settings | Links shown on the How-to guide tab (set from Admin → Guide links) |
| History | Who added, edited, deleted or recovered each record. Written by the app; don't edit |

Outside the data sheet: the activity log and its host-only archive (host's My Drive), the **Inventory backups** and **GIS exports** folders (inside the inventory folder), and the **Community reports – restricted** folder.

**Please enter records through the web app, not directly in the Sheet.** The app applies the checks: required fields, ID numbering, the Desk-verified rule, and field checks setting Field-verified. Direct edits skip them and don't appear in the History box; QA will still flag most problems.

**Downloads:** "Download all (Excel)" downloads the whole data sheet; "Download this tab (CSV)" downloads one tab. Both need access to the inventory folder. Downloads go straight to Google, so they are not in the activity log.

## Updating from the 13 October (v1) version

1. Paste the new `Code.gs`, `Schema.gs`, `Seed.gs` and `Index.html` over the old ones. `appsscript.json` is unchanged.
2. Run **setup** once. It creates the activity log and moves the old AuditLog tab out of the data sheet into it, adds the History tab and the new Members columns (team, removed_at, removed_by), and locks the Members tab.
3. Run **installWeeklyMaintenance** once (step 8).
4. **Deploy → Manage deployments → Edit → New version**, so the URL stays the same.
5. On the Admin tab, check that each member has a team, and add the second admin.

## Phases

- **Phase 1:** Events, Sources (with Attach photos for WhatsApp), Field checks, Hazardous events, QA checks, the How-to guide tab.
- **Phase 2 (included):** Met Service IDs, Slow-onset, the five loss and damage tabs, grouped Sources views (by event and by hazardous event), the evidence chart, and the GIS export.

To go back to Phase 1 screens only, set `PHASE = 1` at the top of Code.gs and deploy a new version. No data is changed either way.
