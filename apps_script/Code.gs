/**
 * Tobago Event Inventory — Google Apps Script web app.
 *
 * The Climate Unit's record of hazard events, their impacts and losses in Tobago.
 * Kept separately from the Bago Enviro Commons; the Commons links to it from its Spaces section.
 *
 * Data lives in one Google Sheet (one tab per record type). The Sheet sits inside one parent
 * folder that is shared with the team. Like the Commons, the web app runs as the person using it,
 * so only people the folder is shared with AND who are listed on the Members tab can use it.
 *
 * First time: run setup() once from the editor, then seedExamples() if you want the training
 * examples. See SETUP.md.
 */

var APP_NAME = 'Tobago Event Inventory';
var PHASE = 2;   // 1: Events, Sources, Hazardous events, Field checks only. 2: adds Met Service IDs, Slow-onset, Loss & damage detail, grouped views, evidence chart, GIS export.
var LINK_SHEET = 'Event_Sources';
var RESTRICTED_FOLDER = 'Community reports – restricted';

// Settings tab (key, value). Links shown on the How-to guide tab; point them at Google Docs copies
// of the guide and manual so colleagues without a Claude account can open them.
var DEFAULT_SETTINGS = {
  guideUrl: 'https://claude.ai/code/artifact/e990d7ac-b9dd-47dd-8b9d-56253e859708',
  manualUrl: 'https://claude.ai/artifact/AUUHSuvTLUWgXoBdmim12N',
  questionsUrl: 'https://claude.ai/artifact/9fQu6nQYsA3z9cVetgTRQ1',        // Event Inventory: Open Questions (extract, for every user)
  fullQuestionsUrl: 'https://claude.ai/artifact/17kMQQQfJ6HnbqtAye74dS',    // full CRVA open questions log (Climate Unit only)
  restrictedFolderUrl: ''
};

/* =========================================================================
 * SETUP (run once from the Apps Script editor; safe to run again after updates)
 * ========================================================================= */

function setup() {
  const props = PropertiesService.getScriptProperties();
  const me = Session.getEffectiveUser().getEmail();

  // Parent folder — share THIS folder with the team (Editor for people who enter records).
  let root = props.getProperty('ROOT_ID') ? DriveApp.getFolderById(props.getProperty('ROOT_ID')) : null;
  if (!root) { root = DriveApp.createFolder(APP_NAME); props.setProperty('ROOT_ID', root.getId()); }

  let ss = props.getProperty('SHEET_ID') ? SpreadsheetApp.openById(props.getProperty('SHEET_ID')) : null;
  if (!ss) {
    ss = SpreadsheetApp.create(APP_NAME + ' — Data');
    props.setProperty('SHEET_ID', ss.getId());
    DriveApp.getFileById(ss.getId()).moveTo(root);
  }
  ss.setSpreadsheetTimeZone(Session.getScriptTimeZone());

  // One tab per record type, plus links, lookups, members and settings.
  tabSpecs_().forEach(function (t) { ensureTab_(ss, t.name, t.headers, t.note); });
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);

  // Lookups: one row per allowed value. Add missing defaults; never remove the team's own.
  const lk = ss.getSheetByName('Lookups');
  const have = {};
  readAll_('Lookups').forEach(function (r) { have[r.list + '|' + r.value] = true; });
  const add = [];
  Object.keys(SCHEMA.look).forEach(function (list) {
    SCHEMA.look[list].forEach(function (v, i) { if (!have[list + '|' + v]) add.push([list, v, i + 1]); });
  });
  if (add.length) lk.getRange(lk.getLastRow() + 1, 1, add.length, 3).setValues(add);

  // Settings
  const st = ss.getSheetByName('Settings');
  const haveS = {};
  readAll_('Settings').forEach(function (r) { haveS[r.key] = true; });
  Object.keys(DEFAULT_SETTINGS).forEach(function (k) { if (!haveS[k]) st.appendRow([k, DEFAULT_SETTINGS[k]]); });
  // The questions button now opens the inventory extract; the full log is Climate Unit only.
  readAll_('Settings').forEach(function (r) { if (r.key === 'questionsUrl' && String(r.value) === OLD_QUESTIONS_URL) st.getRange(r._row, 2).setValue(DEFAULT_SETTINGS.questionsUrl); });

  // The person running setup is the first admin.
  if (!readAll_('Members').some(function (m) { return lc_(m.email) === lc_(me); })) {
    append_('Members', { email: lc_(me), name: 'Inventory admin', role: 'admin', position: '', team: 'Climate Unit' });
  }
  props.setProperty('OWNER_EMAIL', lc_(me));
  syncAdmins_();
  setupLog_();

  // Restricted folder for WhatsApp evidence: NOT inside the shared folder, so only people
  // you share it with directly (the Climate Unit) can open it.
  let rf = props.getProperty('RESTRICTED_ID');
  if (!rf) {
    const it = DriveApp.getFoldersByName(RESTRICTED_FOLDER);
    const f = it.hasNext() ? it.next() : DriveApp.createFolder(RESTRICTED_FOLDER);
    props.setProperty('RESTRICTED_ID', f.getId()); rf = f.getId();
  }
  const rfUrl = DriveApp.getFolderById(rf).getUrl();
  const rfRow = readAll_('Settings').filter(function (r) { return r.key === 'restrictedFolderUrl'; })[0];
  if (rfRow && !rfRow.value) st.getRange(rfRow._row, 2).setValue(rfUrl);

  // Re-apply the lock on the Members tab: owner and admins only.
  try { protectMembers_(); } catch (e) {}

  Logger.log('Setup complete.');
  Logger.log('Inventory folder (share this with the team): ' + root.getUrl());
  Logger.log('Data sheet: ' + ss.getUrl());
  Logger.log('Restricted WhatsApp folder (share with Climate Unit members only): ' + rfUrl);
  Logger.log('Activity log (admins only; shared by the app): ' + logBook_().getUrl());
}

/** Load the fictional training examples (IDs contain EX-). Run once after setup(), if wanted. */
function seedExamples() {
  withLock_(function () {
    Object.keys(SEED).forEach(function (k) {
      const c = col_(k);
      SEED[k].forEach(function (d) {
        if (findRowByKey_(c, d._id)) return;
        const body = {}; Object.keys(d).forEach(function (f) { if (f !== '_id') body[f] = d[f]; });
        writeDoc_(c, d._id, body, 'set');
      });
    });
  });
  Logger.log('Training examples loaded.');
}

function tabSpecs_() {
  const out = SCHEMA.cols.map(function (c) {
    return { name: c.name, headers: headersFor_(c), note: (c.when || '') + (c.feeds ? ' Feeds: ' + c.feeds : '') };
  });
  out.push({ name: LINK_SHEET, headers: ['event_id', 'source_id', 'linked_at'], note: 'One row per link between an event and a source. Kept by the web app.' });
  out.push({ name: 'Lookups', headers: ['list', 'value', 'order'], note: 'Allowed values for each drop-down. Change only by team decision.' });
  out.push({ name: 'Members', headers: ['email', 'name', 'role', 'position', 'team', 'removed_at', 'removed_by'], note: 'role: admin, editor, viewer or removed. team: Climate Unit, Coastal Unit or Other. Only active people listed here can open the inventory. Managed from the Admin tab of the web app; only the owner and admins can edit this tab.' });
  out.push({ name: 'Settings', headers: ['key', 'value'], note: 'Links shown on the How-to guide tab.' });
  out.push({ name: 'History', headers: ['at', 'email', 'action', 'record_type', 'record_id'], note: 'Who added, edited, deleted or recovered each record. Shown in the History box of each record. Written by the web app; do not edit. The full activity log (members, access, sign-ins) is kept separately and only admins can open it.' });
  return out;
}
var EXTRA_COLUMNS = { sources: ['attached_photos'] };   // kept by the app, not typed into the form
function headersFor_(c) {
  const key = c.id || 'row_id';
  return [key].concat(c.fields.map(function (f) { return f.k; }).filter(function (k) { return k !== key; }), EXTRA_COLUMNS[c.key] || [], ['updated_at', 'updated_by']);
}
function ensureTab_(ss, name, headers, note) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#dfe5ec');
    sh.setFrozenRows(1);
    if (note) sh.getRange(1, 1).setNote(note);
  } else {
    const have = headers_(sh);
    headers.filter(function (h) { return have.indexOf(h) < 0; }).forEach(function (h) {
      sh.getRange(1, sh.getLastColumn() + 1).setValue(h).setFontWeight('bold').setBackground('#dfe5ec');
    });
  }
  // Store everything as plain text so dates and IDs are never reformatted by Sheets.
  sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), sh.getMaxColumns()).setNumberFormat('@');
}

/* =========================================================================
 * WEB APP ENTRY
 * ========================================================================= */

function doGet() {
  const t = HtmlService.createTemplateFromFile('Index');
  let schema;
  try { schema = schemaWithLookups_(); } catch (e) { schema = SCHEMA; }   // lists from the Lookups tab when readable
  t.schemaJson = JSON.stringify(schema).replace(/</g, '\\u003c');
  return t.evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* =========================================================================
 * API — called from the page via google.script.run
 * ========================================================================= */

function getBootstrap() {
  const me = requireMember_();
  touchSeen_(me.email);
  const ss = ss_();
  const gids = {};
  ss.getSheets().forEach(function (sh) { gids[sh.getName()] = sh.getSheetId(); });
  const settings = {};
  readAll_('Settings').forEach(function (r) { if (r.key) settings[r.key] = String(r.value || ''); });
  if (String(me.team || '') !== 'Climate Unit') delete settings.fullQuestionsUrl;   // the full log is internal
  return {
    appName: APP_NAME, phase: PHASE,
    me: { email: me.email, name: me.name || me.email.split('@')[0], role: me.role || 'editor', position: me.position || '', team: me.team || '' },
    adminAlerts: me.role === 'admin' ? requests_().filter(function (r) { return r.status === 'Pending'; }).length : 0,
    canWrite: (me.role || 'editor') !== 'viewer',
    schema: schemaWithLookups_(),
    data: getAllData_(),
    sheet: { id: ss.getId(), url: ss.getUrl(), gids: gids, names: SCHEMA.cols.reduce(function (o, c) { o[c.key] = c.name; return o; }, {}) },
    settings: settings,
    gisLast: JSON.parse(PropertiesService.getScriptProperties().getProperty('GIS_LAST') || 'null')
  };
}

/** All records, for refreshing the page. */
function getData() { requireMember_(); return getAllData_(); }

/**
 * Create a record with a new ID. `id` is the ID the page offers; when `auto` is true and that ID
 * is taken, the next free number is used. Returns {id, data}.
 */
function createDoc(key, id, auto, body) {
  const me = requireWriter_();
  const c = col_(key);
  if (!/^[A-Za-z0-9_\-.~:@+]{1,200}$/.test(String(id))) throw new Error('The ID can use letters, numbers and - only.');
  return withLock_(function () {
    let tries = 0;
    while (findRowByKey_(c, id)) {
      if (!auto) throw new Error(id + ' already exists. Leave the ID blank to use the next free number.');
      id = bumpId_(id);
      if (++tries > 500) throw new Error('Could not find a free ID. Reload the page and try again.');
    }
    if (c.id) body[c.id] = id;
    writeDoc_(c, id, body, 'set', me.email);
    audit_(me, 'record.create', key + ' ' + id);
    return { id: id, data: getAllData_() };
  });
}

/** Replace (mode 'set') or merge into (mode 'update') an existing record. Returns all data. */
function saveDoc(key, id, body, mode) {
  const me = requireWriter_();
  const c = col_(key);
  return withLock_(function () {
    if (mode === 'update' && !findRowByKey_(c, id)) throw new Error('Record ' + id + ' was not found. It may have been deleted by a colleague.');
    writeDoc_(c, id, body, mode === 'update' ? 'update' : 'set', me.email);
    audit_(me, 'record.save', key + ' ' + id + (mode === 'update' ? ' (update)' : ' (set)'));
    return getAllData_();
  });
}

/**
 * Soft-delete one record (and, for events, its source links). The row is kept in the
 * sheet with deleted=TRUE + deleted_at/deleted_by, so a mistaken delete can be recovered;
 * it simply disappears from every view, which all read through getAllData_(). A record can
 * be restored by re-saving it (saveDoc 'set' overwrites and clears the flag), and an admin
 * can physically remove soft-deleted rows with purgeDeleted(). Returns all data.
 */
function deleteDoc(key, id) {
  const me = requireWriter_();
  const c = col_(key);
  return withLock_(function () {
    const row = findRowByKey_(c, id);
    const links = key === 'events' ? readAll_(LINK_SHEET).filter(function (r) { return String(r.event_id) === String(id); }).map(function (r) { return String(r.source_id); }) : [];
    if (row) writeDoc_(c, id, {
      deleted: 'TRUE',
      deleted_links: links.join('; '),   // so an admin can recover the event with its sources
      deleted_at: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
      deleted_by: me.email
    }, 'update', me.email);
    if (key === 'events') setLinks_(id, []);
    audit_(me, 'record.delete', key + ' ' + id);
    return getAllData_();
  });
}

/**
 * Physically remove soft-deleted rows (admin only, run from the script editor as the host).
 * If `days` is given, only rows deleted more than `days` ago are purged; otherwise all
 * soft-deleted rows are removed. Returns { removed, data } counts per tab.
 */
function purgeDeleted(days) {
  const me = requireAdmin_();
  const cutoff = days ? new Date(Date.now() - Number(days) * 86400000) : null;
  const out = {};
  SCHEMA.cols.forEach(function (c) {
    const sh = sheet_(c.name);
    const last = sh.getLastRow();
    if (last < 2) return;
    const head = headers_(sh);   // map by the Sheet's own header row (deleted/deleted_at are extra columns, not schema fields)
    const vals = sh.getRange(2, 1, last - 1, head.length).getValues();
    let removed = 0;
    for (let i = vals.length - 1; i >= 0; i--) {
      const rec = {};
      head.forEach(function (h, j) { rec[h] = vals[i][j]; });
      if (String(rec.deleted).toUpperCase() !== 'TRUE') continue;
      if (cutoff && rec.deleted_at) {
        const dt = new Date(rec.deleted_at);
        if (!isNaN(dt.getTime()) && dt > cutoff) continue;
      }
      sh.deleteRow(i + 2);
      removed++;
    }
    if (removed) out[c.name] = removed;
  });
  audit_(me, 'record.purge', (days ? 'older than ' + days + ' days: ' : 'all: ') + JSON.stringify(out));
  return { removed: out, data: getAllData_() };
}

/**
 * Save photos from a WhatsApp report into the restricted Climate Unit folder (never the Commons).
 * `files` = [{name, data(base64 JPEG)}], resized in the browser. Names follow the source's WA reference,
 * e.g. WA-20271112-03_01.jpg; the reference and file names are recorded on the source.
 */
function attachPhotos(sourceId, files) {
  const me = requireWriter_();
  const c = col_('sources');
  if (!files || !files.length) throw new Error('No photos were sent.');
  if (files.length > 10) throw new Error('Attach up to 10 photos at a time.');
  let folder;
  try { folder = DriveApp.getFolderById(prop_('RESTRICTED_ID')); folder.getName(); }
  catch (e) { throw new Error('The restricted Community reports folder is not shared with you. It is for Climate Unit members only: ask the folder owner (the host account) to share it with you in Drive. Do not save the photos anywhere else in the meantime.'); }
  return withLock_(function () {
    const row = findRowByKey_(c, sourceId);
    if (!row) throw new Error('Save the source first, then attach photos.');
    if (row.source_type !== 'WhatsApp or messaging app') throw new Error('Photos can be attached here only to WhatsApp sources.');
    let ref = (String(row.agency_record_ids || '').match(/WA-\d{8}-\d{2}/) || [])[0];
    if (!ref) {
      const day = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
      let n = 0;
      readAll_(c.name).forEach(function (r) {
        (String(r.agency_record_ids || '').match(new RegExp('WA-' + day + '-(\\d{2})', 'g')) || []).forEach(function (m) { n = Math.max(n, Number(m.slice(-2))); });
      });
      ref = 'WA-' + day + '-' + String(n + 1).padStart(2, '0');
    }
    const have = String(row.attached_photos || '').split(';').map(function (x) { return x.trim(); }).filter(String);
    const added = [];
    files.forEach(function (f, i) {
      const name = ref + '_' + String(have.length + i + 1).padStart(2, '0') + '.jpg';
      const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(f.data), 'image/jpeg', name));
      added.push(name + '|' + file.getId());
    });
    const ids = String(row.agency_record_ids || '');
    const names = added.map(function (x) { return x.split('|')[0]; });
    const upd = {
      attached_photos: have.concat(added).join('; '),
      agency_record_ids: (ids.indexOf(ref) >= 0 ? ids : (ids ? ids + '; ' : '') + ref) + '; ' + names.join('; ')
    };
    if (!row.reference_or_url) upd.reference_or_url = 'Community reports – restricted (Climate Unit Google Drive folder)';
    writeDoc_(c, sourceId, upd, 'update', me.email);
    audit_(me, 'photos.attach', sourceId + ' ×' + files.length);
    return { ref: ref, saved: added.length, data: getAllData_() };
  });
}

/* =========================================================================
 * GIS EXPORT — a CSV of verified events with coordinates for the GeoPackage
 * ========================================================================= */

var GIS_COLUMNS = ['event_id', 'event_type', 'event_subtype', 'trigger', 'hazardous_event_id', 'parent_event_id', 'date_start', 'date_end', 'date_precision',
  'parish', 'community', 'location_desc', 'easting', 'northing', 'location_precision', 'coords_from', 'training_ready',
  'verification_status', 'confidence', 'data_origin', 'climate_related', 'deaths', 'people_affected', 'buildings_damaged', 'buildings_destroyed',
  'road_closed', 'closure_hours', 'length_m', 'width_m', 'area_m2', 'volume_m3', 'water_depth_m', 'site_id', 'source_ids', 'updated_at'];

/** Run once from the editor to save the export automatically every Monday morning. */
function installWeeklyGisExport() {
  ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'exportGisCsv'; }).forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('exportGisCsv').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(6).create();
  Logger.log('Weekly GIS export switched on (Mondays, about 6-7am).');
}

/** Save the CSV in the 'GIS exports' folder inside the inventory folder. Returns {at, count, name, url}. */
function exportGisCsv() {
  // The weekly trigger may run without a signed-in page user; requireMember_ then throws "Who are you?". Allow only that case.
  let me = null;
  try { me = requireWriter_(); } catch (e) { if (Session.getActiveUser().getEmail()) throw e; }
  const data = getAllData_();
  const ok = ['Desk-verified', 'Partner-observed', 'Field-verified'];
  const precise = ['GPS / RTK (< 10 m)', 'Road chainage (< 100 m)'];
  const rows = data.events.filter(function (e) {
    return ok.indexOf(e.verification_status) >= 0 && String(e.is_example).toUpperCase() !== 'Y' && !/(^|-)EX-|^EX-/.test(e._id) && e.easting !== undefined && e.northing !== undefined;
  });
  const q = function (v) { v = Array.isArray(v) ? v.join('; ') : (v === undefined || v === null ? '' : String(v)); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const lines = [GIS_COLUMNS.join(',')].concat(rows.map(function (e) {
    const o = Object.assign({}, e, { training_ready: precise.indexOf(e.location_precision) >= 0 && ['Landslide', 'Rockfall', 'Debris flow', 'Flash flood', 'River flood', 'Urban / surface-water flood'].indexOf(e.event_type) >= 0 ? 'Y' : 'N' });
    return GIS_COLUMNS.map(function (k) { return q(o[k]); }).join(',');
  }));
  const props = PropertiesService.getScriptProperties();
  let fid = props.getProperty('GIS_FOLDER_ID'), folder;
  try { folder = fid ? DriveApp.getFolderById(fid) : null; } catch (e) { folder = null; }
  if (!folder) { folder = DriveApp.getFolderById(prop_('ROOT_ID')).createFolder('GIS exports'); props.setProperty('GIS_FOLDER_ID', folder.getId()); }
  const day = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const name = 'Tobago_Event_Inventory_verified_events_' + day + '.csv';
  const file = folder.createFile(name, lines.join('\n'), MimeType.CSV);
  const info = { at: day, count: rows.length, name: name, url: file.getUrl() };
  props.setProperty('GIS_LAST', JSON.stringify(info));
  audit_(me || { email: Session.getEffectiveUser().getEmail(), role: 'trigger' }, 'export.gis', rows.length + ' rows');
  return info;
}

/* =========================================================================
 * WEEKLY MAINTENANCE — run once from the editor (as the host) to register
 * a Sunday-morning trigger. Each step is failure-isolated so one problem
 * doesn't stop the rest; a summary is logged and written to the AuditLog.
 * ========================================================================= */

/** Run once from the editor (as the host) to switch on the Sunday-morning maintenance. */
function installWeeklyMaintenance() {
  ScriptApp.getProjectTriggers().filter(function (t) { return ['weeklyMaintenance', 'flushAudit'].indexOf(t.getHandlerFunction()) >= 0; }).forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('weeklyMaintenance').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(7).create();
  ScriptApp.newTrigger('flushAudit').timeBased().everyHours(1).create();   // moves new activity into the admin-only log
  Logger.log('Weekly maintenance switched on (Sundays, about 7-8am): backups, audit archive, tampering check, Members protection, GIS retention. New activity is also moved into the admin-only log every hour.');
}

/**
 * Sunday housekeeping: (a) copy the whole data sheet into the 'Inventory backups' folder
 * (newest 8 kept), (b) archive the audit log to the host-only archive sheet, (c) re-apply
 * the Members-tab protection, (d) trim old GIS CSVs to the newest 8.
 */
function weeklyMaintenance() {
  const summary = [];
  const step = function (name, fn) {
    try { const r = fn(); summary.push(name + ': OK' + (r ? ' (' + r + ')' : '')); }
    catch (e) { summary.push(name + ': FAILED — ' + e.message); Logger.log(name + ' failed: ' + e.stack); }
  };

  step('backup', function () {
    const props = PropertiesService.getScriptProperties();
    let bfid = props.getProperty('BACKUP_ID'), bfolder;
    try { bfolder = bfid ? DriveApp.getFolderById(bfid) : null; } catch (e) { bfolder = null; }
    if (!bfolder) { bfolder = DriveApp.getFolderById(prop_('ROOT_ID')).createFolder('Inventory backups'); props.setProperty('BACKUP_ID', bfolder.getId()); }
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    DriveApp.getFileById(prop_('SHEET_ID')).makeCopy('Tobago_Event_Inventory_backup_' + stamp, bfolder);
    const files = bfolder.getFilesByType(MimeType.GOOGLE_SHEETS);
    const list = [];
    while (files.hasNext()) list.push(files.next());
    list.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
    list.slice(8).forEach(function (f) { f.setTrashed(true); });
    return 'kept newest ' + Math.min(8, list.length);
  });

  step('activity flush', flushAudit_);
  step('audit archive', archiveAudit_);
  step('tampering check', checkAudit_);
  step('activity log sharing', syncLogSharing_);
  step('members protection', protectMembers_);
  step('admin list', syncAdmins_);

  step('GIS retention', function () {
    const fid = PropertiesService.getScriptProperties().getProperty('GIS_FOLDER_ID');
    if (!fid) return 'no GIS folder yet';
    const folder = DriveApp.getFolderById(fid);
    const list = [];
    const it = folder.getFilesByType(MimeType.CSV);
    while (it.hasNext()) list.push(it.next());
    list.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
    const out = list.slice(8);
    out.forEach(function (f) { f.setTrashed(true); });
    return 'removed ' + out.length + ' old CSV(s)';
  });

  audit_({ email: Session.getEffectiveUser().getEmail(), role: 'trigger' }, 'maintenance.weekly', summary.join(' | '));
  PropertiesService.getScriptProperties().setProperty('MAINT_LAST', JSON.stringify({ at: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), summary: summary }));
  Logger.log('weeklyMaintenance: ' + summary.join(' | '));
  return summary;
}

/** Delete every training example (IDs containing EX-, or is_example = Y). Admins only. */
function deleteExamples() {
  const me = requireWriter_();
  if (me.role !== 'admin') throw new Error('Only an admin can delete the training examples.');
  return withLock_(function () {
    SCHEMA.cols.forEach(function (c) {
      const sh = sheet_(c.name); if (!sh) return;
      readAll_(c.name).filter(function (r) { return isExampleRow_(r, keyOf_(c)); }).map(function (r) { return r._row; })
        .sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
    });
    const ls = sheet_(LINK_SHEET);
    readAll_(LINK_SHEET).filter(function (r) { return /(^|-)EX-|^EX-/.test(String(r.event_id)) || /(^|-)EX-|^EX-/.test(String(r.source_id)); })
      .map(function (r) { return r._row; }).sort(function (a, b) { return b - a; }).forEach(function (r) { ls.deleteRow(r); });
    audit_(me, 'examples.delete', '');
    return getAllData_();
  });
}

/* =========================================================================
 * DATA LAYER
 * ========================================================================= */

function col_(key) {
  const c = SCHEMA.cols.filter(function (x) { return x.key === key; })[0];
  if (!c) throw new Error('Unknown record type: ' + key);
  return c;
}
function keyOf_(c) { return c.id || 'row_id'; }
function isExampleRow_(r, key) { return String(r.is_example).toUpperCase() === 'Y' || /(^|-)EX-|^EX-/.test(String(r[key] || '')); }

function schemaWithLookups_() {
  const look = {};
  readAll_('Lookups').sort(function (a, b) { return (Number(a.order) || 0) - (Number(b.order) || 0); }).forEach(function (r) {
    if (!r.list || r.value === '') return;
    (look[r.list] = look[r.list] || []).push(String(r.value));
  });
  Object.keys(SCHEMA.look).forEach(function (k) { if (!look[k]) look[k] = SCHEMA.look[k]; });
  const s = JSON.parse(JSON.stringify(SCHEMA)); s.look = look; return s;
}

function getAllData_() {
  const links = {};
  readAll_(LINK_SHEET).forEach(function (r) { if (r.event_id) (links[r.event_id] = links[r.event_id] || []).push(String(r.source_id)); });
  const out = {};
  SCHEMA.cols.forEach(function (c) {
    const key = keyOf_(c), types = {};
    c.fields.forEach(function (f) { types[f.k] = f.t; });
    out[c.key] = readAll_(c.name).filter(function (r) {
      return String(r[key] || '') !== '' && String(r.deleted).toUpperCase() !== 'TRUE';
    }).map(function (r) {
      const d = { _id: String(r[key]) };
      Object.keys(r).forEach(function (h) {
        if (h === '_row' || h === key && !c.id) return;
        let v = r[h];
        if (v === '' || v === null || v === undefined) return;
        if ((types[h] === 'number' || h === 'change') && v !== '' && !isNaN(Number(v))) v = Number(v);
        else v = String(v);
        d[h] = v;
      });
      if (c.key === 'events') d.source_ids = links[d._id] || [];
      return d;
    });
  });
  return out;
}

/** Write one record. mode 'set' replaces every column; 'update' only the columns given. */
function writeDoc_(c, id, body, mode, by) {
  const sh = sheet_(c.name);
  let head = headers_(sh);
  const key = keyOf_(c);
  // New fields sent by the page that the Sheet doesn't have yet: add the column at the end.
  Object.keys(body).forEach(function (k) {
    if (k === 'source_ids' || k === '_id' || head.indexOf(k) >= 0) return;
    sh.getRange(1, sh.getLastColumn() + 1).setValue(k).setFontWeight('bold').setBackground('#dfe5ec');
    head = headers_(sh);
  });
  const row = findRowByKey_(c, id);
  const vals = row ? sh.getRange(row._row, 1, 1, head.length).getValues()[0] : head.map(function () { return ''; });
  head.forEach(function (h, j) {
    if (h === key) { vals[j] = id; return; }
    if (h === 'updated_at') { vals[j] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); return; }
    if (h === 'updated_by') { if (by) vals[j] = by; return; }
    if (body.hasOwnProperty(h)) vals[j] = cell_(body[h]);
    else if (mode === 'set') vals[j] = '';
  });
  if (row) sh.getRange(row._row, 1, 1, head.length).setValues([vals]);
  else {
    const r = sh.getLastRow() + 1;
    sh.getRange(r, 1, 1, head.length).setNumberFormat('@').setValues([vals]);
  }
  if (c.key === 'events' && body.hasOwnProperty('source_ids')) setLinks_(id, body.source_ids || []);
}

/** Replace the set of sources linked to one event. */
function setLinks_(eventId, sourceIds) {
  const sh = sheet_(LINK_SHEET);
  const want = (Array.isArray(sourceIds) ? sourceIds : String(sourceIds || '').split(/[;,]/)).map(function (s) { return String(s).trim(); }).filter(String);
  const rows = readAll_(LINK_SHEET).filter(function (r) { return String(r.event_id) === String(eventId); });
  const haveIds = rows.map(function (r) { return String(r.source_id); });
  rows.filter(function (r) { return want.indexOf(String(r.source_id)) < 0; }).map(function (r) { return r._row; })
    .sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const add = want.filter(function (s, i) { return haveIds.indexOf(s) < 0 && want.indexOf(s) === i; }).map(function (s) { return [eventId, s, now]; });
  if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, 3).setNumberFormat('@').setValues(add);
}

function findRowByKey_(c, id) {
  const key = keyOf_(c);
  return readAll_(c.name).filter(function (r) { return String(r[key]) === String(id); })[0] || null;
}
function bumpId_(id) {
  const m = String(id).match(/^(.*?)(\d+)$/);
  return m ? m[1] + String(Number(m[2]) + 1).padStart(m[2].length, '0') : id + '-2';
}
function cell_(v) {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) v = v.join('; ');
  if (typeof v === 'string' && /^[=+@]/.test(v)) return "'" + v;   // never let text become a formula
  return typeof v === 'number' ? String(v) : v;
}

/* =========================================================================
 * HELPERS (same pattern as the Commons)
 * ========================================================================= */

function prop_(k) {
  const v = PropertiesService.getScriptProperties().getProperty(k);
  if (!v) throw new Error('The inventory is not set up yet. Run setup() in the Apps Script editor.');
  return v;
}
function ss_() { return SpreadsheetApp.openById(prop_('SHEET_ID')); }
function sheet_(name) { return ss_().getSheetByName(name); }
function lc_(s) { return String(s || '').trim().toLowerCase(); }
function headers_(sh) { return sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String); }

function readAll_(name) {
  const sh = sheet_(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const head = values.shift().map(String);
  const tz = Session.getScriptTimeZone();
  const out = [];
  values.forEach(function (r, i) {
    if (r.join('') === '') return;
    const o = { _row: i + 2 };
    head.forEach(function (h, j) {
      let v = r[j];
      if (v instanceof Date) v = Utilities.formatDate(v, tz, 'yyyy-MM-dd');
      o[h] = v;
    });
    out.push(o);
  });
  return out;
}

function append_(name, obj) {
  const sh = sheet_(name);
  const head = headers_(sh);
  sh.appendRow(head.map(function (h) { return cell_(obj[h]); }));
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function requireMember_() {
  // Never fall back to getEffectiveUser(): if this app is ever redeployed "Execute as: Me",
  // that fallback would silently identify every visitor as the deployer — the exact failure
  // the Commons had (visitors see and act as the owner). Fail closed instead.
  const active = Session.getActiveUser().getEmail();
  if (!active) throw new Error('Who are you? Your Google account couldn\'t be identified. Sign out of other Google accounts, allow third-party cookies for this site, then reload.');
  const email = lc_(active);
  let rows;
  try { rows = readAll_('Members'); } catch (e) { audit_(null, 'auth.nofolder', email); throw new Error('NO_ACCESS:' + email); }   // cannot open the data sheet: folder not shared with them
  const m = rows.filter(function (r) { return lc_(r.email) === email && activeMember_(r); })[0];
  if (!m) { audit_(null, 'auth.notmember', email); throw new Error('NOT_MEMBER:' + email); }
  m.email = email;
  return m;
}
function requireWriter_() {
  const m = requireMember_();
  if (m.role === 'viewer') throw new Error('You have view-only access. Ask an admin if you need to enter records.');
  return m;
}
/** Members-tab role must be exactly 'admin'; used for purgeDeleted(). */
function requireAdmin_() {
  const m = requireMember_();
  if (m.role !== 'admin') throw new Error('Admin access required. Ask the Climate Unit admin to run this.');
  return m;
}

/* =========================================================================
 * AUDIT — append-only log of record changes (create/save/delete/photos/exports),
 * in its own tab of the data sheet. The app writes as the person acting
 * (Execute as: User), so the tab must remain editable and a determined member
 * could tamper with it; weeklyMaintenance() copies every row into a host-only
 * archive spreadsheet, which makes tampering detectable by diff.
 * ========================================================================= */
function audit_(me, action, detail) {
  const tz = Session.getScriptTimeZone();
  const at = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
  const email = me ? lc_(me.email) : '';
  const row = [at, email, me ? String(me.role || '') : '', String(action || ''), String(detail || '').slice(0, 500)];
  // 1. Full activity log: buffered in script properties (any user can write them, no user can read them),
  //    then moved hourly into the admin-only log spreadsheet. Refusals: one entry per person per day.
  try {
    const props = PropertiesService.getScriptProperties();
    const key = /^auth\./.test(action) ? 'AUD_R_' + lc_(detail).replace(/[^a-z0-9@._-]/g, '') + '_' + at.slice(0, 10)
      : 'AUD_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
    props.setProperty(key, JSON.stringify(row));
  } catch (e) {}
  // 2. Record history (data sheet, readable by every member): record changes only.
  const m = /^record\.(create|save|delete|recover)$/.test(action) ? String(detail || '').match(/^(\S+) (\S+)/)
    : action === 'photos.attach' ? ['', 'sources', String(detail || '').split(' ')[0]] : null;
  if (m && email) { try { sheet_('History').appendRow([at, email, action, m[1], m[2]]); } catch (e) {} }
}

/**
 * Members tab: only the spreadsheet owner and active admins may edit it. Members need edit
 * access to the data sheet to enter records, so without this protection anyone could grant
 * themselves admin. Admins manage members from the Admin tab of the web app (which runs as
 * them, so they must be on this protection); editors and viewers cannot change the tab.
 * Re-applied after every member change and weekly by weeklyMaintenance().
 */
function protectMembers_() {
  const ss = ss_();
  const sh = ss.getSheetByName('Members');
  if (!sh) return;
  const owner = ownerEmail_();
  // Owner plus every active admin may edit the Members tab (agreed: option B). Editors and viewers may not.
  const allowed = [owner].concat(readAll_('Members').filter(function (m) { return activeMember_(m) && lc_(m.role) === 'admin'; })
    .map(function (m) { return lc_(m.email); })).filter(String);
  const ps = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  const p = ps[0] || sh.protect().setDescription('Members: owner and admins only');
  p.getEditors().forEach(function (u) { if (allowed.indexOf(lc_(u.getEmail())) < 0) { try { p.removeEditor(u.getEmail()); } catch (e) {} } });
  allowed.forEach(function (e) { try { p.addEditor(e); } catch (x) {} });
  if (p.canDomainEdit()) p.setDomainEdit(false);
  return 'editable by ' + allowed.length + ' account(s)';
}

/** Copies new AuditLog rows into a host-only archive spreadsheet, then trims the live log past 5000 rows. */
function archiveAudit_() {
  const props = PropertiesService.getScriptProperties();
  const sh = logSheet_();
  if (!sh || sh.getLastRow() < 2) return 'nothing to archive';
  let book = null;
  const id = props.getProperty('AUDIT_ARCHIVE_ID');
  if (id) { try { book = SpreadsheetApp.openById(id); } catch (e) { book = null; } }
  if (!book) {
    book = SpreadsheetApp.create(APP_NAME + ' audit archive (host only)');   // never shared — only the host can open it
    props.setProperty('AUDIT_ARCHIVE_ID', book.getId());
  }
  let ash = book.getSheetByName('AuditLog');
  if (!ash) ash = book.insertSheet('AuditLog');
  if (ash.getLastRow() === 0) ash.appendRow(['archivedAt', 'at', 'email', 'role', 'action', 'detail']);
  const last = Number(props.getProperty('AUDIT_ARCHIVED_ROW') || 1);
  const total = sh.getLastRow();
  if (total > last) {
    const rows = sh.getRange(last + 1, 1, total - last, 5).getValues();
    const now = new Date();
    ash.getRange(ash.getLastRow() + 1, 1, rows.length, 6).setValues(rows.map(function (r) { return [now].concat(r); }));
    props.setProperty('AUDIT_ARCHIVED_ROW', String(total));
  }
  if (sh.getLastRow() > 5000) {
    const cut = sh.getLastRow() - 5000;
    sh.deleteRows(2, cut);   // archive already holds everything removed
    props.setProperty('AUDIT_ARCHIVED_ROW', String(sh.getLastRow()));
    props.setProperty('AUDIT_TRIMMED', String(Number(props.getProperty('AUDIT_TRIMMED') || 0) + cut));   // for the tampering check
  }
}

/* =========================================================================
 * ADMIN — the Admin tab of the web app (admins only) and access requests.
 * Members: add, change role/team, remove (kept as role "removed"), with the inventory
 * folder shared or unshared to match. The restricted WhatsApp folder is never shared by
 * the app: the Admin tab only shows who can open it and flags anyone outside the Climate Unit.
 * Access requests are kept in script properties, because the person asking usually
 * cannot open the data sheet yet.
 * ========================================================================= */
var TEAMS = ['Climate Unit', 'Coastal Unit', 'Other'];
var ROLES = ['admin', 'editor', 'viewer'];
var SETTING_KEYS = ['guideUrl', 'manualUrl', 'questionsUrl', 'fullQuestionsUrl'];
var OLD_QUESTIONS_URL = 'https://claude.ai/artifact/17kMQQQfJ6HnbqtAye74dS';   // before 13 Oct 2026 the button opened the full log

function activeMember_(m) { return !!m && lc_(m.role) !== 'removed'; }
function ownerEmail_() {
  try { const o = ss_().getOwner(); if (o && o.getEmail()) return lc_(o.getEmail()); } catch (e) {}
  return lc_(PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL') || '');
}
function nowStamp_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); }
function clip_(v, n) { return String(v || '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, n); }

/** Keep a copy of the admin emails where anyone running the script can read it (for request emails). */
function syncAdmins_() {
  const admins = readAll_('Members').filter(function (m) { return activeMember_(m) && lc_(m.role) === 'admin'; }).map(function (m) { return lc_(m.email); });
  PropertiesService.getScriptProperties().setProperty('ADMIN_EMAILS', JSON.stringify(admins));
  return admins.length + ' admin(s)';
}

/** Last visit per person, at most one write per person per day. Kept in script properties because viewers cannot write to the Sheet. */
function touchSeen_(email) {
  try {
    const props = PropertiesService.getScriptProperties();
    const seen = JSON.parse(props.getProperty('LAST_SEEN') || '{}');
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (seen[email] === today) return;
    seen[email] = today;
    props.setProperty('LAST_SEEN', JSON.stringify(seen));
  } catch (e) {}
}

function requests_() { return JSON.parse(PropertiesService.getScriptProperties().getProperty('ACCESS_REQUESTS') || '[]'); }
function saveRequests_(list) {
  const pending = list.filter(function (r) { return r.status === 'Pending'; }).slice(-30);
  const done = list.filter(function (r) { return r.status !== 'Pending'; }).slice(-15);   // a short history only
  PropertiesService.getScriptProperties().setProperty('ACCESS_REQUESTS', JSON.stringify(done.concat(pending)));
}

/** For the "Ask for access" screen: the signed-in person's pending request, if any. Open to anyone with a Google account. */
function myAccessRequest() {
  const email = lc_(Session.getActiveUser().getEmail());
  if (!email) return null;
  return requests_().filter(function (r) { return r.email === email && r.status === 'Pending'; })[0] || null;
}

/** Ask for access (anyone not yet a member, including Coastal Unit viewers). Emails the admins. */
function requestAccess(name, team, note) {
  const email = lc_(Session.getActiveUser().getEmail());
  if (!email) throw new Error('Who are you? Your Google account couldn\'t be identified. Sign out of other Google accounts, then reload.');
  name = clip_(name, 80); note = clip_(note, 300);
  if (!name) throw new Error('Please give your name.');
  if (TEAMS.indexOf(team) < 0) team = 'Other';
  const r = withLock_(function () {
    const list = requests_();
    const prev = list.filter(function (x) { return x.email === email && x.status === 'Pending'; })[0];
    if (prev) return prev;
    const req = { id: 'AR-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss'), email: email, name: name, team: team, note: note, at: nowStamp_(), status: 'Pending' };
    list.push(req); saveRequests_(list);
    req._new = true;
    return req;
  });
  if (!r._new) return { at: r.at, already: true };
  audit_({ email: email, role: 'visitor' }, 'access.request', team + (note ? ': ' + note : ''));
  const props = PropertiesService.getScriptProperties();
  let to = JSON.parse(props.getProperty('ADMIN_EMAILS') || '[]');
  if (!to.length && props.getProperty('OWNER_EMAIL')) to = [props.getProperty('OWNER_EMAIL')];
  let mailed = false;
  if (to.length) {
    try {
      const url = ScriptApp.getService().getUrl();
      MailApp.sendEmail({ to: to.join(','), replyTo: email, subject: APP_NAME + ': ' + name + ' (' + team + ') asks for access',
        body: name + ' (' + email + ', ' + team + ') is asking for access to the ' + APP_NAME + '.\n\n' + (note ? 'Reason: ' + note + '\n\n' : '') +
          'To decide, open the inventory and go to the Admin tab: ' + url + '\n\nThe inventory folder is shared from there, so you do not need to share anything in Drive.' });
      mailed = true;
    } catch (e) {}
  }
  return { at: r.at, mailed: mailed };
}

/** Everything the Admin tab shows. */
function getAdminView() { return adminView_(requireAdmin_()); }
function adminView_(me) {
  const props = PropertiesService.getScriptProperties();
  const owner = ownerEmail_();
  const seen = JSON.parse(props.getProperty('LAST_SEEN') || '{}');
  const members = readAll_('Members').map(function (m) {
    const e = lc_(m.email);
    return { email: e, name: String(m.name || ''), role: lc_(m.role) || 'editor', team: String(m.team || ''), position: String(m.position || ''),
      removed_at: String(m.removed_at || ''), removed_by: String(m.removed_by || ''), last_seen: seen[e] || '', owner: e === owner, me: e === me.email };
  });
  const peopleOf = function (id) {
    const f = DriveApp.getFolderById(id), ppl = {};
    try { ppl[lc_(f.getOwner().getEmail())] = 'Owner'; } catch (e) {}
    f.getEditors().forEach(function (u) { const e = lc_(u.getEmail()); if (!ppl[e]) ppl[e] = 'Editor'; });
    f.getViewers().forEach(function (u) { const e = lc_(u.getEmail()); if (!ppl[e]) ppl[e] = 'Viewer'; });
    return { url: f.getUrl(), people: ppl };
  };
  let folder = null, restricted = null;
  try { folder = peopleOf(prop_('ROOT_ID')); } catch (e) { folder = { error: 'Could not read the inventory folder\'s sharing: ' + e.message }; }
  try { restricted = peopleOf(prop_('RESTRICTED_ID')); } catch (e) { restricted = { error: 'You cannot open the restricted WhatsApp folder, so its sharing can\'t be checked here. The owner can check it in Drive.' }; }
  const deleted = [];
  SCHEMA.cols.forEach(function (c) {
    readAll_(c.name).forEach(function (r) {
      if (String(r.deleted).toUpperCase() !== 'TRUE') return;
      deleted.push({ key: c.key, tab: c.name, id: String(r[keyOf_(c)]), title: clip_(r.title || r.description || r.indicator || r.publisher || '', 90),
        deleted_at: String(r.deleted_at || ''), deleted_by: String(r.deleted_by || '') });
    });
  });
  const settings = {};
  readAll_('Settings').forEach(function (r) { if (SETTING_KEYS.indexOf(r.key) >= 0) settings[r.key] = String(r.value || ''); });
  return {
    members: members, requests: requests_().reverse(), folder: folder, restricted: restricted, deleted: deleted, settings: settings,
    house: { tamper: JSON.parse(props.getProperty('TAMPER_LAST') || 'null'), maint: JSON.parse(props.getProperty('MAINT_LAST') || 'null'), gis: JSON.parse(props.getProperty('GIS_LAST') || 'null'), today: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') },
    teams: TEAMS, owner: owner
  };
}

/** Share (or re-share) the inventory folder to match the role. Returns a warning or ''. */
function shareInventory_(email, role) {
  try {
    const f = DriveApp.getFolderById(prop_('ROOT_ID'));
    if (role === 'viewer') {
      try { f.removeEditor(email); } catch (e) {}
      f.addViewer(email);
    } else f.addEditor(email);
    return '';
  } catch (e) { return 'The inventory folder could not be shared with ' + email + ' (' + e.message + '). Share it in Drive: ' + (role === 'viewer' ? 'Viewer' : 'Editor') + '.'; }
}

/** Add a member, or change an existing member's name, role, team or position. m = {email,name,role,team,position,requestId} */
function saveMember(m) {
  const me = requireAdmin_();
  const email = lc_(m && m.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('That does not look like an email address.');
  const role = ROLES.indexOf(lc_(m.role)) >= 0 ? lc_(m.role) : '';
  if (!role) throw new Error('Choose a role: admin, editor or viewer.');
  const team = TEAMS.indexOf(m.team) >= 0 ? m.team : '';
  if (!team) throw new Error('Choose a team.');
  const name = clip_(m.name, 80) || email.split('@')[0], position = clip_(m.position, 80);
  const warnings = [];
  const result = withLock_(function () {
    const rows = readAll_('Members');
    const row = rows.filter(function (r) { return lc_(r.email) === email; })[0];
    const wasActive = activeMember_(row);
    const oldRole = row ? lc_(row.role) : '';
    const admins = rows.filter(function (r) { return activeMember_(r) && lc_(r.role) === 'admin'; }).length;
    if (wasActive && oldRole === 'admin' && role !== 'admin') {
      if (email === me.email) throw new Error('You cannot take away your own admin role. Ask the other admin to do it.');
      if (email === ownerEmail_()) throw new Error('The host account (the owner of the data sheet) always stays an admin.');
      if (admins <= 1) throw new Error('There must always be at least one admin.');
    }
    const w = shareInventory_(email, role); if (w) warnings.push(w);
    const sh = sheet_('Members'), head = headers_(sh);
    const obj = { email: email, name: name, role: role, team: team, position: position, removed_at: '', removed_by: '' };
    if (row) {
      const vals = sh.getRange(row._row, 1, 1, head.length).getValues()[0];
      head.forEach(function (h, j) { if (obj.hasOwnProperty(h)) vals[j] = cell_(obj[h]); });
      sh.getRange(row._row, 1, 1, head.length).setValues([vals]);
    } else append_('Members', obj);
    syncAdmins_();
    try { syncLogSharing_(); } catch (e) { warnings.push('Activity log sharing could not be updated (' + e.message + '). It is re-applied on Sunday.'); }
    try { protectMembers_(); } catch (e) { warnings.push('The Members tab lock could not be updated (' + e.message + '). It is re-applied on Sunday, or the owner can run setup.'); }
    // Close any pending request from this person.
    const list = requests_(); let closed = false;
    list.forEach(function (r) { if (r.email === email && r.status === 'Pending') { r.status = 'Approved'; r.handled_by = me.email; r.handled_at = nowStamp_(); closed = true; } });
    if (closed) saveRequests_(list);
    if (team !== 'Climate Unit') warnings.push('Reminder: never share the restricted WhatsApp folder with ' + name + ' (' + team + ').');
    audit_(me, wasActive ? 'member.update' : 'member.add', email + ' role=' + role + ' team=' + team + (wasActive && oldRole !== role ? ' (was ' + oldRole + ')' : ''));
    return true;
  });
  return { ok: result, warnings: warnings, view: adminView_(me) };
}

/** Remove a member: kept on the tab as role "removed" (so names on old records still make sense), folder access taken away. */
function removeMember(email) {
  const me = requireAdmin_();
  email = lc_(email);
  if (email === me.email) throw new Error('You cannot remove yourself. Ask the other admin.');
  if (email === ownerEmail_()) throw new Error('The host account (the owner of the data sheet) cannot be removed.');
  const warnings = [];
  withLock_(function () {
    const rows = readAll_('Members');
    const row = rows.filter(function (r) { return lc_(r.email) === email && activeMember_(r); })[0];
    if (!row) throw new Error('Not an active member.');
    if (lc_(row.role) === 'admin' && rows.filter(function (r) { return activeMember_(r) && lc_(r.role) === 'admin'; }).length <= 1) throw new Error('There must always be at least one admin.');
    const sh = sheet_('Members'), head = headers_(sh);
    const vals = sh.getRange(row._row, 1, 1, head.length).getValues()[0];
    const set = { role: 'removed', removed_at: nowStamp_(), removed_by: me.email };
    head.forEach(function (h, j) { if (set.hasOwnProperty(h)) vals[j] = set[h]; });
    sh.getRange(row._row, 1, 1, head.length).setValues([vals]);
    try { const f = DriveApp.getFolderById(prop_('ROOT_ID')); try { f.removeEditor(email); } catch (e) {} try { f.removeViewer(email); } catch (e) {} }
    catch (e) { warnings.push('Could not take away access to the inventory folder. Remove ' + email + ' in Drive.'); }
    // Taking someone OFF the restricted folder is always safe to try; adding is never done by the app.
    try {
      const rf = DriveApp.getFolderById(prop_('RESTRICTED_ID'));
      const has = rf.getEditors().concat(rf.getViewers()).some(function (u) { return lc_(u.getEmail()) === email; });
      if (has) { try { rf.removeEditor(email); } catch (e) {} try { rf.removeViewer(email); } catch (e) {}
        if (rf.getEditors().concat(rf.getViewers()).some(function (u) { return lc_(u.getEmail()) === email; })) warnings.push(email + ' can still open the restricted WhatsApp folder. Ask the folder owner to remove them in Drive.'); }
    } catch (e) {}
    syncAdmins_();
    try { syncLogSharing_(); } catch (e) {}
    try { protectMembers_(); } catch (e) {}
    audit_(me, 'member.remove', email + ' (was ' + lc_(row.role) + ')');
  });
  return { ok: true, warnings: warnings, view: adminView_(me) };
}

/** Decline a pending access request (no email is sent; tell the person directly if needed). */
function declineRequest(id) {
  const me = requireAdmin_();
  withLock_(function () {
    const list = requests_(); const r = list.filter(function (x) { return x.id === id; })[0];
    if (!r) throw new Error('Request not found.');
    r.status = 'Declined'; r.handled_by = me.email; r.handled_at = nowStamp_();
    saveRequests_(list);
    audit_(me, 'access.decline', r.email);
  });
  return adminView_(me);
}

/** Bring back a soft-deleted record (and, for events, the sources it was linked to). */
function recoverRecord(key, id) {
  const me = requireAdmin_();
  const c = col_(key);
  return withLock_(function () {
    const row = findRowByKey_(c, id);
    if (!row || String(row.deleted).toUpperCase() !== 'TRUE') throw new Error(id + ' is not a deleted record.');
    const links = String(row.deleted_links || '');
    writeDoc_(c, id, { deleted: '', deleted_at: '', deleted_by: '', deleted_links: '' }, 'update', me.email);
    if (key === 'events' && links) setLinks_(id, links);
    audit_(me, 'record.recover', key + ' ' + id);
    return { view: adminView_(me), data: getAllData_() };
  });
}

/** Change the links shown on the How-to guide tab. */
function saveSettings(obj) {
  const me = requireAdmin_();
  return withLock_(function () {
    const sh = sheet_('Settings');
    const rows = readAll_('Settings');
    SETTING_KEYS.forEach(function (k) {
      if (!obj || !obj.hasOwnProperty(k)) return;
      const v = String(obj[k] || '').trim();
      if (v && !/^https:\/\//i.test(v)) throw new Error('Links must start with https://');
      const r = rows.filter(function (x) { return x.key === k; })[0];
      if (r) sh.getRange(r._row, 2).setValue(v); else sh.appendRow([k, v]);
    });
    audit_(me, 'settings.save', SETTING_KEYS.map(function (k) { return k + '=' + String((obj || {})[k] || ''); }).join(' ').slice(0, 480));
    const settings = {};
    readAll_('Settings').forEach(function (r) { if (r.key) settings[r.key] = String(r.value || ''); });
    return { view: adminView_(me), settings: settings };
  });
}

/* =========================================================================
 * ACTIVITY LOG — its own spreadsheet, outside the inventory folder, shared by the app with
 * active admins only. Members never write to it directly: audit_() buffers entries in script
 * properties and flushAudit() moves them in (hourly trigger, weekly maintenance, and whenever
 * an admin opens the Activity list). The History tab in the data sheet keeps the record-only
 * part for the History box, which every member can see.
 * ========================================================================= */
var LOG_HEAD = ['at', 'email', 'role', 'action', 'detail'];
function logBook_() {
  const id = PropertiesService.getScriptProperties().getProperty('LOG_ID');
  return id ? SpreadsheetApp.openById(id) : null;
}
function logSheet_() {
  const b = logBook_(); if (!b) return null;
  let sh = b.getSheetByName('AuditLog');
  if (!sh) sh = b.insertSheet('AuditLog');
  if (sh.getLastRow() === 0) { sh.getRange(1, 1, 1, LOG_HEAD.length).setValues([LOG_HEAD]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return sh;
}

/** Run by setup(): create the log (moving any old AuditLog tab out of the data sheet) and share it with the admins. */
function setupLog_() {
  const props = PropertiesService.getScriptProperties();
  let book = null;
  try { book = logBook_(); } catch (e) { book = null; }
  if (!book) {
    book = SpreadsheetApp.create(APP_NAME + ' — activity log (admins only)');   // in My Drive, NOT the shared inventory folder
    props.setProperty('LOG_ID', book.getId());
    const first = book.getSheets()[0];
    first.setName('AuditLog');
    first.getRange(1, 1, 1, LOG_HEAD.length).setValues([LOG_HEAD]).setFontWeight('bold');
    first.setFrozenRows(1);
    first.getRange(2, 1, Math.max(first.getMaxRows() - 1, 1), LOG_HEAD.length).setNumberFormat('@');
    // Move the old AuditLog tab (from the earlier version) into the new log, row for row, so the archive stays in step.
    const ss = ss_(), old = ss.getSheetByName('AuditLog');
    if (old) {
      if (old.getLastRow() > 1) {
        const v = old.getRange(2, 1, old.getLastRow() - 1, LOG_HEAD.length).getValues();
        first.getRange(2, 1, v.length, LOG_HEAD.length).setValues(v);
        const hist = v.map(function (r) {
          const m = /^record\.(create|save|delete|recover)$/.test(r[3]) ? String(r[4]).match(/^(\S+) (\S+)/) : null;
          return m && r[1] ? [r[0], r[1], r[3], m[1], m[2]] : null;
        }).filter(Boolean);
        if (hist.length) { const h = ss.getSheetByName('History'); h.getRange(h.getLastRow() + 1, 1, hist.length, 5).setValues(hist); }
      }
      ss.deleteSheet(old);
    }
  }
  syncLogSharing_();
}

/** Only active admins (and the owner) can open the activity log. */
function syncLogSharing_() {
  const book = logBook_(); if (!book) return 'no log yet';
  const file = DriveApp.getFileById(book.getId());
  const owner = ownerEmail_();
  const want = readAll_('Members').filter(function (m) { return activeMember_(m) && lc_(m.role) === 'admin'; })
    .map(function (m) { return lc_(m.email); }).filter(function (e) { return e && e !== owner; });
  const eds = file.getEditors().map(function (u) { return lc_(u.getEmail()); });
  file.getViewers().forEach(function (u) { try { file.removeViewer(u.getEmail()); } catch (e) {} });
  eds.filter(function (e) { return want.indexOf(e) < 0 && e !== owner; }).forEach(function (e) { try { file.removeEditor(e); } catch (x) {} });
  want.filter(function (e) { return eds.indexOf(e) < 0; }).forEach(function (e) { try { file.addEditor(e); } catch (x) {} });
  return 'open to ' + (want.length + 1) + ' account(s)';
}

/** Move buffered activity into the log. Runs hourly (as the owner) and when an admin opens the Activity list. */
function flushAudit() { return flushAudit_(); }
function flushAudit_() {
  const sh = logSheet_(); if (!sh) return 'no log yet';
  return withLock_(function () {
    const props = PropertiesService.getScriptProperties();
    const all = props.getProperties();
    const keys = Object.keys(all).filter(function (k) { return /^AUD_/.test(k); });
    if (!keys.length) return 'nothing new';
    const rows = keys.map(function (k) { try { return JSON.parse(all[k]); } catch (e) { return null; } }).filter(Boolean)
      .sort(function (a, b) { return String(a[0]).localeCompare(String(b[0])); });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, LOG_HEAD.length).setNumberFormat('@').setValues(rows);
    keys.forEach(function (k) { props.deleteProperty(k); });
    return rows.length + ' entries';
  });
}

/** Weekly: compare the log with the host-only archive. Any changed or missing entry is flagged on the Admin tab. */
function checkAudit_() {
  const props = PropertiesService.getScriptProperties();
  const sh = logSheet_();
  const aid = props.getProperty('AUDIT_ARCHIVE_ID');
  if (!sh || !aid) return 'nothing to compare yet';
  const ash = SpreadsheetApp.openById(aid).getSheetByName('AuditLog');
  const tz = Session.getScriptTimeZone();
  const norm = function (v) { return v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd HH:mm:ss') : String(v); };
  const upto = Number(props.getProperty('AUDIT_ARCHIVED_ROW') || 1);   // live rows 2..upto are in the archive
  const trimmed = Number(props.getProperty('AUDIT_TRIMMED') || 0);
  const n = Math.min(upto, sh.getLastRow()) - 1;
  const live = n > 0 ? sh.getRange(2, 1, n, 5).getValues() : [];
  const arch = ash && ash.getLastRow() > 1 ? ash.getRange(2 + trimmed, 2, Math.max(ash.getLastRow() - 1 - trimmed, 0) || 1, 5).getValues() : [];
  const bad = [];
  for (let i = 0; i < Math.max(live.length, Math.min(arch.length, upto - 1)); i++) {
    const a = live[i] ? live[i].map(norm).join('|') : '(missing)', b = arch[i] ? arch[i].map(norm).join('|') : '(missing)';
    if (a !== b) bad.push({ row: i + 2, live: a.slice(0, 160), archived: b.slice(0, 160) });
  }
  const res = { at: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm'), checked: live.length, ok: !bad.length, mismatches: bad.length, first: bad.slice(0, 5) };
  props.setProperty('TAMPER_LAST', JSON.stringify(res));
  if (bad.length) audit_({ email: Session.getEffectiveUser().getEmail(), role: 'trigger' }, 'check.tamper', bad.length + ' entries differ from the archive, first at row ' + bad[0].row);
  return res.ok ? res.checked + ' entries match the archive' : bad.length + ' entries DIFFER from the archive';
}

/** Admins: the activity list (newest first, up to 3000 entries) plus anything not yet moved into the log. */
function getActivity() {
  requireAdmin_();
  let note = '';
  try { flushAudit_(); } catch (e) { note = 'Some recent activity could not be moved into the log yet: ' + e.message; }
  const tz = Session.getScriptTimeZone();
  const norm = function (v) { return v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd HH:mm:ss') : String(v); };
  let rows = [], total = 0, url = '';
  const sh = logSheet_();
  if (sh) {
    url = logBook_().getUrl();
    const last = sh.getLastRow(); total = Math.max(last - 1, 0);
    const start = Math.max(2, last - 2999);
    if (last >= 2) rows = sh.getRange(start, 1, last - start + 1, 5).getValues().map(function (r) { return r.map(norm); });
  }
  const all = PropertiesService.getScriptProperties().getProperties();
  Object.keys(all).filter(function (k) { return /^AUD_/.test(k); }).forEach(function (k) { try { rows.push(JSON.parse(all[k])); } catch (e) {} });
  rows.reverse().sort(function (a, b) { return String(b[0]).localeCompare(String(a[0])); });   // newest first, same-second entries kept in order
  const names = {};
  readAll_('Members').forEach(function (m) { names[lc_(m.email)] = String(m.name || ''); });
  return { rows: rows, total: total, shown: rows.length, url: url, names: names, note: note,
    archiveNote: 'Entries older than the newest 5,000 are kept in the host-only archive spreadsheet.' };
}

/** Any member: who added and changed one record (from the History tab of the data sheet). */
function getHistory(key, id) {
  requireMember_();
  col_(key);
  const names = {};
  readAll_('Members').forEach(function (m) { names[lc_(m.email)] = String(m.name || ''); });
  const sh = sheet_('History'); if (!sh || sh.getLastRow() < 2) return [];
  const tz = Session.getScriptTimeZone();
  const norm = function (v) { return v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd HH:mm:ss') : String(v); };   // keep the time of day
  return sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues()
    .filter(function (r) { return String(r[3]) === key && String(r[4]) === String(id); })
    .map(function (r) { const e = lc_(r[1]); return { at: norm(r[0]), email: e, name: names[e] || e, action: String(r[2]) }; })
    .reverse().sort(function (a, b) { return b.at.localeCompare(a.at); });
}
