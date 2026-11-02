/**
 * SAHARE PROPERTIES — RENT & COLLECTION AUTO-PILOT v7
 * Generated from modular source files in /src.
 * Edit /src modules and rebuild; do not hand-edit this bundle.
 */


/* ==========================================================================
 * MODULE: 00_Constants.gs
 * ========================================================================== */

/** Sahare Properties Auto-Pilot v7.0.0 — shared constants and schemas. */
var V7 = Object.freeze({
  VERSION: '7.0.0',
  TIMEZONE: 'Asia/Kolkata',
  MENU_NAME: 'Sahare Properties v7',
  SHEETS: Object.freeze({
    CONFIG: 'System Config',
    ROOM_MASTER: 'Room Master',
    TENANT_HISTORY: 'Tenant History',
    BILLING: 'Billing Ledger',
    PAYMENTS: 'Payment Ledger',
    METERS: 'Meter Reading Ledger',
    RECEIPTS: 'Receipt Register',
    AGREEMENTS: 'Agreement Register',
    NOTIFICATIONS: 'Notification Queue',
    AUDIT: 'Audit Log',
    ERRORS: 'Error Log',
    MIGRATION: 'Migration Preview',
    OVERRIDES: 'Migration Overrides',
    DASHBOARD: 'V7 Dashboard'
  }),
  CONFIG_DEFAULTS: [
    ['UPI_ID', '9405908605@ybi', 'UPI payment address'],
    ['UPI_NAME', 'Sahare Properties', 'UPI payee display name'],
    ['TIMEZONE', 'Asia/Kolkata', 'Script timezone'],
    ['ADMIN_EMAIL', '', 'Optional administrator email; receives BCC and system alerts'],
    ['DEFAULT_ELECTRICITY_RATE', '13.50', 'Default rupees per unit; room-specific rate takes precedence'],
    ['AGREEMENT_DURATION_MONTHS', '11', 'Agreement duration in months'],
    ['AGREEMENT_TEMPLATE_ID', '1pdU3DT2DVHygpOIvNLmVticsKQDaBF8X-BOWsVVSviY', 'Google Docs live master template ID'],
    ['AGREEMENT_FOLDER_ID', '11M_D3H-O8UTHFMBAlI6zcVQipbiI-P16', 'Google Drive destination folder supplied for Sahare Properties documents'],
    ['FORM_ID', '12pG5ulPbLwKGJd17gejL3sjPZsK8kpR26ntbLxsheu4', 'Linked Google Form ID for room and billing-period choice synchronization'],
    ['FORM_PERIOD_LOOKBACK_MONTHS', '3', 'How many earlier billing periods to show in the Form'],
    ['FORM_PERIOD_LOOKAHEAD_MONTHS', '12', 'How many future billing periods to show in the Form'],
    ['RENEWAL_REMINDER_DAYS', '30', 'Queue one agreement-renewal reminder within this many days before expiry'],
    ['MAIL_ENABLED', 'NO', 'Set YES only after email settings and recipient details are verified'],
    ['PAYMENT_VERIFICATION_REQUIRED', 'YES', 'Reported payments do not reduce dues until verified'],
    ['MIGRATION_APPROVED', 'NO', 'Must be changed to YES before applying a reviewed migration preview'],
    ['ENABLE_EXTERNAL_QR', 'NO', 'Set YES to use QuickChart for UPI QR rendering'],
    ['QR_SIZE', '220', 'QuickChart QR output size in pixels'],
    ['BILLING_DUE_DAY', '5', 'Rent payment due day of each month'],
    ['NOTIFICATION_BATCH_SIZE', '20', 'Maximum notification queue items processed per run'],
    ['AUTO_CREATE_MONTHLY_BILLS', 'NO', 'Keep NO until monthly billing is tested and approved'],
    ['LAST_MIGRATION_RUN_ID', '', 'Most recent migration preview run identifier']
  ],
  SCHEMAS: Object.freeze({
    'Room Master': ['RoomNo', 'MeterNo', 'BaseRent', 'ElectricityRate', 'OccupancyStatus', 'CurrentTenantID', 'CurrentTenantName', 'CurrentTenantMobile', 'CurrentTenantEmail', 'SecurityDeposit', 'DepositMode', 'DepositDate', 'AgreementStartDate', 'AgreementEndDate', 'Notes', 'UpdatedAt'],
    'Tenant History': ['TenantID', 'TenantName', 'Mobile', 'Email', 'RoomNo', 'MoveInDate', 'MoveOutDate', 'Status', 'Source', 'Notes', 'CreatedAt'],
    'Billing Ledger': ['BillID', 'RoomNo', 'TenantID', 'BillingPeriod', 'BaseRent', 'PreviousReading', 'CurrentReading', 'UnitsConsumed', 'ElectricityRate', 'ElectricityAmount', 'TotalAmount', 'VerifiedPayments', 'OutstandingAmount', 'DueDate', 'BillStatus', 'ReconciliationStatus', 'WhatsAppURL', 'UPIURL', 'UPIQRURL', 'CreatedAt', 'Source', 'SourceSheet', 'SourceRow', 'Notes'],
    'Payment Ledger': ['PaymentID', 'BillID', 'RoomNo', 'TenantID', 'BillingPeriod', 'Amount', 'ReportedAt', 'PaymentMethod', 'ReferenceNumber', 'ReceiptURL', 'VerificationStatus', 'VerifiedAt', 'VerifiedBy', 'IdempotencyKey', 'SourceType', 'SourceSheet', 'SourceRow', 'Notes'],
    'Meter Reading Ledger': ['ReadingID', 'RoomNo', 'MeterNo', 'BillingPeriod', 'ReadingValue', 'ReadingDate', 'PhotoReference', 'IdempotencyKey', 'SourceType', 'SourceSheet', 'SourceRow', 'Notes', 'CreatedAt'],
    'Receipt Register': ['ReceiptID', 'RoomNo', 'TenantID', 'BillingPeriod', 'PaymentID', 'ReceiptType', 'FileReference', 'SourceSheet', 'SourceRow', 'AccessStatus', 'IdempotencyKey', 'CreatedAt', 'Notes'],
    'Agreement Register': ['AgreementID', 'RoomNo', 'TenantID', 'TenantName', 'StartDate', 'EndDate', 'TemplateID', 'GoogleDocID', 'PdfFileID', 'PdfURL', 'Status', 'CreatedAt', 'EmailedAt', 'Notes'],
    'Notification Queue': ['NotificationID', 'Type', 'Recipient', 'Subject', 'PlainBody', 'HtmlBody', 'AttachmentFileIDs', 'ReferenceType', 'ReferenceID', 'Status', 'Attempts', 'LastError', 'CreatedAt', 'SentAt'],
    'Audit Log': ['LogID', 'Timestamp', 'Actor', 'Action', 'EntityType', 'EntityID', 'DetailsJSON', 'Source'],
    'Error Log': ['ErrorID', 'Timestamp', 'FunctionName', 'Message', 'Stack', 'ContextJSON', 'Status'],
    'Migration Preview': ['RunID', 'EntityType', 'TargetSheet', 'RecordID', 'SourceSheet', 'SourceRow', 'BillingPeriod', 'PreviewStatus', 'Warnings', 'PayloadJSON', 'CreatedAt', 'AppliedAt'],
    'Migration Overrides': ['OverrideID', 'OverrideType', 'RoomNo', 'BillingPeriod', 'OverrideValue', 'RelatedValues', 'Notes', 'ConfirmedBy', 'ConfirmedAt', 'Active']
  })
});

/* ==========================================================================
 * MODULE: 01_Utilities.gs
 * ========================================================================== */

/** Pure helpers and common Google Sheets utilities. */
function normalizeHeader_(value) {
  return String(value == null ? '' : value).trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Returns 1-based column indexes. Duplicate normalized headers are rejected. */
function getColumnMap(headers) {
  var map = {};
  var duplicates = [];
  (headers || []).forEach(function (header, index) {
    var key = normalizeHeader_(header);
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(map, key)) duplicates.push(key);
    else map[key] = index + 1;
  });
  if (duplicates.length) {
    throw new Error('Duplicate column headers detected: ' + duplicates.join(', '));
  }
  return map;
}

function getColumnByAliases_(columnMap, aliases, required) {
  for (var i = 0; i < aliases.length; i++) {
    var key = normalizeHeader_(aliases[i]);
    if (columnMap[key]) return columnMap[key];
  }
  if (required) throw new Error('Missing required column. Expected one of: ' + aliases.join(', '));
  return 0;
}

function valueByAliases_(row, columnMap, aliases) {
  var column = getColumnByAliases_(columnMap, aliases, false);
  return column ? row[column - 1] : '';
}

function toNumber_(value, fallback) {
  if (value === '' || value === null || value === undefined) return fallback === undefined ? 0 : fallback;
  var cleaned = typeof value === 'string' ? value.replace(/[₹,\s]/g, '') : value;
  var number = Number(cleaned);
  return Number.isFinite(number) ? number : (fallback === undefined ? 0 : fallback);
}

function roundMoney_(value) {
  return Math.round((toNumber_(value) + Number.EPSILON) * 100) / 100;
}

function reconciliationStatus_(totalValue, verifiedValue) {
  if (totalValue === '' || totalValue === null || totalValue === undefined) return 'LEGACY_INCOMPLETE';
  var total = roundMoney_(totalValue);
  var verified = roundMoney_(verifiedValue);
  if (verified > total) return 'OVERPAID_REVIEW';
  if (verified >= total) return 'RECONCILED_PAID';
  if (verified > 0) return 'RECONCILED_PARTIAL_OR_DUE';
  return 'NOT_YET_VERIFIED';
}

function normalizeRoom_(room) {
  return String(room == null ? '' : room).trim().toUpperCase();
}

/** Accepts legacy Google Form choices such as `B2 - Aifaz (Meter: J0044)`. */
function parseRoomChoice_(value) {
  var raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  var match = raw.match(/^([A-Za-z0-9]+)(?:\s+-|\s*\(|$)/);
  return normalizeRoom_(match ? match[1] : raw.split(/\s+/)[0]);
}

/** Adds calendar months with end-of-month clamping (EDATE-compatible). */
function addMonthsClamped_(dateValue, months) {
  var date = toDateSafe_(dateValue);
  if (!date) throw new Error('A valid date is required.');
  var count = Number(months);
  if (!Number.isInteger(count)) throw new Error('Month offset must be an integer.');
  var year = date.getFullYear();
  var month = date.getMonth() + count;
  var day = date.getDate();
  var firstOfTarget = new Date(year, month, 1);
  var lastDay = new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth() + 1, 0).getDate();
  return new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth(), Math.min(day, lastDay));
}

/** Writes sorted non-contiguous row updates as one write per contiguous block. */
function writeContiguousRows_(sheet, updates, width) {
  if (!updates || !updates.length) return 0;
  updates.sort(function (a, b) { return a.rowNumber - b.rowNumber; });
  var groups = [];
  updates.forEach(function (item) {
    var last = groups.length ? groups[groups.length - 1] : null;
    if (!last || item.rowNumber !== last.startRow + last.rows.length) {
      groups.push({ startRow: item.rowNumber, rows: [item.values] });
    } else {
      last.rows.push(item.values);
    }
  });
  groups.forEach(function (group) {
    sheet.getRange(group.startRow, 1, group.rows.length, width).setValues(group.rows);
  });
  return groups.length;
}

function monthNumber_(month) {
  if (month instanceof Date && !isNaN(month.getTime())) return month.getMonth() + 1;
  var raw = String(month == null ? '' : month).trim().toLowerCase();
  var numeric = Number(raw);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 12) return numeric;
  var names = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  for (var i = 0; i < names.length; i++) {
    if (raw === names[i] || raw === names[i].slice(0, 3)) return i + 1;
  }
  throw new Error('Unrecognized month: ' + month);
}

function periodKey_(year, month) {
  var y = Number(year);
  var m = monthNumber_(month);
  if (!Number.isInteger(y) || y < 2000 || y > 2100) throw new Error('Invalid billing year: ' + year);
  return String(y) + '-' + String(m).padStart(2, '0');
}

function parsePeriodInput_(period) {
  var match = String(period || '').trim().match(/^(\d{4})[-/](\d{1,2})$/);
  if (!match) throw new Error('Billing period must use YYYY-MM, for example 2026-11.');
  return periodKey_(Number(match[1]), Number(match[2]));
}

function periodParts_(key) {
  var canonical = parsePeriodInput_(key);
  return { year: Number(canonical.slice(0, 4)), month: Number(canonical.slice(5, 7)), key: canonical };
}

function buildPeriodChoiceList_(todayValue, lookbackMonths, lookaheadMonths) {
  var today = toDateSafe_(todayValue) || new Date();
  var back = Math.max(0, Math.min(24, Number(lookbackMonths) || 0));
  var ahead = Math.max(0, Math.min(24, Number(lookaheadMonths) || 0));
  var count = back + ahead + 1;
  var result = [];
  for (var i = -back; i <= ahead; i++) {
    var date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    result.push(periodKey_(date.getFullYear(), date.getMonth() + 1));
  }
  return result;
}

function toDateSafe_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return new Date(value.getTime());
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value === 'number' && value > 20000 && value < 80000) {
    // Excel/Sheets serial date fallback (1899-12-30 origin).
    return new Date(Date.UTC(1899, 11, 30) + value * 86400000);
  }
  var date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function formatDate_(value, pattern) {
  var date = toDateSafe_(value);
  if (!date) return '';
  return Utilities.formatDate(date, getConfigValue_('TIMEZONE', V7.TIMEZONE), pattern || 'dd-MM-yyyy');
}

function makeId_(prefix) {
  return String(prefix || 'ID') + '-' + Utilities.getUuid();
}

function makeBillId_(room, period) {
  return 'BILL-' + normalizeRoom_(room) + '-' + parsePeriodInput_(period);
}

function buildUpiLink_(amount, room, period) {
  var config = getConfigMap_();
  var upiId = String(config.UPI_ID || '').trim();
  if (!upiId) return '';
  var payee = String(config.UPI_NAME || 'Sahare Properties').trim();
  var amt = roundMoney_(amount);
  if (amt <= 0) return '';
  var note = 'Room ' + normalizeRoom_(room) + ' ' + parsePeriodInput_(period) + ' Rent';
  return 'upi://pay?pa=' + encodeURIComponent(upiId) +
    '&pn=' + encodeURIComponent(payee) +
    '&am=' + amt.toFixed(2) + '&cu=INR&tn=' + encodeURIComponent(note);
}

function buildQrUrl_(upiLink) {
  if (!upiLink || String(getConfigValue_('ENABLE_EXTERNAL_QR', 'NO')).toUpperCase() !== 'YES') return '';
  var size = Math.max(100, Math.min(600, toNumber_(getConfigValue_('QR_SIZE', '220'), 220)));
  return 'https://quickchart.io/qr?size=' + size + '&margin=2&text=' + encodeURIComponent(upiLink);
}

/** Single source of truth for tenant billing text (also used for migrated bills). */
function buildBillingMessage(data) {
  var lines = [
    'Hello ' + (data.tenantName || 'Tenant') + ',',
    '',
    'Rent update for ' + data.period + ':',
    'Base Rent: Rs. ' + roundMoney_(data.baseRent).toFixed(2),
    'Electricity: Rs. ' + roundMoney_(data.electricityAmount).toFixed(2),
    'Total Bill: Rs. ' + roundMoney_(data.totalAmount).toFixed(2),
    'Verified Received: Rs. ' + roundMoney_(data.verifiedPayments).toFixed(2),
    'Balance Due: Rs. ' + roundMoney_(data.outstandingAmount).toFixed(2)
  ];
  if (data.outstandingAmount > 0 && data.upiLink) lines.push('', 'Pay via UPI:', data.upiLink);
  lines.push('', 'Thank you,', 'Sahare Properties');
  return lines.join('\n');
}

function buildWhatsAppUrl_(mobile, message) {
  var phone = String(mobile || '').replace(/\D/g, '');
  if (phone.length === 10) phone = '91' + phone;
  if (!phone || !message) return '';
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
}

function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getActor_() {
  try { return Session.getActiveUser().getEmail() || 'SYSTEM'; }
  catch (error) { Logger.log('Unable to resolve actor: ' + error.message); return 'SYSTEM'; }
}

function getCurrentTimestamp_() { return new Date(); }

/* ==========================================================================
 * MODULE: 02_ConfigAndSchema.gs
 * ========================================================================== */

/** Setup and configuration management. Setup only creates new v7 sheets; it never clears legacy tabs. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu(V7.MENU_NAME)
    .addItem('1. Create v7 Sheets & Config', 'setupV7Structure')
    .addItem('2. Prepare Room Master', 'previewRoomMasterSeed')
    .addItem('Sync Form Room Choices', 'syncV7FormRoomChoices')
    .addItem('3. Run Migration Dry Run', 'runMigrationDryRun')
    .addItem('4. Apply Approved Migration', 'applyMigrationPreview')
    .addSeparator()
    .addItem('Create Monthly Bills…', 'promptCreateMonthlyBills')
    .addItem('Generate Agreement…', 'promptGenerateAgreement')
    .addItem('Verify Selected Payment', 'verifySelectedPayment')
    .addItem('Refresh v7 Dashboard', 'refreshV7Dashboard')
    .addSeparator()
    .addItem('Install v7 Triggers', 'installV7Triggers')
    .addToUi();
}

function setupV7Structure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(V7.SCHEMAS).forEach(function (sheetName) {
    ensureSheetWithHeaders_(ss, sheetName, V7.SCHEMAS[sheetName]);
  });
  ensureSheetWithHeaders_(ss, V7.SHEETS.CONFIG, ['KEY', 'VALUE', 'DESCRIPTION', 'UPDATED_AT']);
  seedDefaultConfig_();
  seedMigrationOverrides_();
  ensureDashboardSheet_(ss);
  SpreadsheetApp.flush();
  logAudit_('SETUP_V7_STRUCTURE', 'SYSTEM', V7.VERSION, { createdOrChecked: Object.keys(V7.SCHEMAS).concat([V7.SHEETS.CONFIG, V7.SHEETS.DASHBOARD]) });
  SpreadsheetApp.getUi().alert('v7 sheets and configuration are ready. Existing legacy sheets were not cleared or overwritten.');
}

function ensureSheetWithHeaders_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setWrap(true);
    return sheet;
  }
  var existing = sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn())).getDisplayValues()[0];
  var map = getColumnMap(existing);
  var missing = headers.filter(function (h) { return !map[normalizeHeader_(h)]; });
  if (missing.length) {
    throw new Error('Sheet "' + name + '" already contains data but is missing expected headers: ' + missing.join(', ') + '. No columns were changed. Review manually.');
  }
  return sheet;
}

function seedDefaultConfig_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(V7.SHEETS.CONFIG);
  if (!sheet) throw new Error('Run setupV7Structure first.');
  var existing = sheet.getLastRow() >= 2 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().map(function (r) { return String(r[0]).trim(); }) : [];
  var known = {};
  existing.forEach(function (key) { known[key] = true; });
  var additions = V7.CONFIG_DEFAULTS.filter(function (row) { return !known[row[0]]; }).map(function (row) { return [row[0], row[1], row[2], new Date()]; });
  if (additions.length) sheet.getRange(sheet.getLastRow() + 1, 1, additions.length, 4).setValues(additions);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  CacheService.getScriptCache().remove('V7_CONFIG');
}

function getConfigMap_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('V7_CONFIG');
  if (cached) return JSON.parse(cached);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.CONFIG);
  if (!sheet || sheet.getLastRow() < 2) return {};
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getDisplayValues();
  var config = {};
  values.forEach(function (row) {
    var key = String(row[0] || '').trim();
    if (key) config[key] = String(row[1] == null ? '' : row[1]).trim();
  });
  cache.put('V7_CONFIG', JSON.stringify(config), 90);
  return config;
}

function getConfigValue_(key, fallback) {
  // Safety switches must always read the live sheet value, never a potentially stale cache.
  var safetyKeys = ['MIGRATION_APPROVED', 'MAIL_ENABLED', 'AUTO_CREATE_MONTHLY_BILLS', 'ENABLE_EXTERNAL_QR'];
  if (safetyKeys.indexOf(key) !== -1) {
    var liveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.CONFIG);
    if (liveSheet && liveSheet.getLastRow() >= 2) {
      var liveValues = liveSheet.getRange(2, 1, liveSheet.getLastRow() - 1, 2).getDisplayValues();
      for (var i = 0; i < liveValues.length; i++) {
        if (String(liveValues[i][0]).trim() === key) {
          var liveValue = String(liveValues[i][1] == null ? '' : liveValues[i][1]).trim();
          return liveValue !== '' ? liveValue : fallback;
        }
      }
    }
    return fallback;
  }
  var config = getConfigMap_();
  return Object.prototype.hasOwnProperty.call(config, key) && config[key] !== '' ? config[key] : fallback;
}

function setConfigValue_(key, value) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.CONFIG);
  if (!sheet) throw new Error('System Config sheet missing. Run setupV7Structure.');
  var values = sheet.getLastRow() >= 2 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues() : [];
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === key) {
      values[i][1] = String(value);
      values[i][3] = new Date();
      sheet.getRange(i + 2, 1, 1, 4).setValues([values[i]]);
      CacheService.getScriptCache().remove('V7_CONFIG');
      return;
    }
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, 4).setValues([[key, String(value), 'Added by administrator', new Date()]]);
  CacheService.getScriptCache().remove('V7_CONFIG');
}

function seedMigrationOverrides_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.OVERRIDES);
  if (!sheet || sheet.getLastRow() >= 2) return;
  var rows = [
    ['USER-CONFIRMED-B2-NOV26', 'CURRENT_TENANT_NAME', 'B2', '2026-11', 'Aifaz', '', 'User confirmed that Aifaz occupied B2 in November 2026.', 'USER', new Date(), 'YES'],
    ['USER-CONFIRMED-B3-NOV26', 'CURRENT_TENANT_NAME', 'B3', '2026-11', 'Aman', '', 'User confirmed that Aman occupied B3 in November 2026.', 'USER', new Date(), 'YES'],
    ['USER-CONFIRMED-C2-NOV26', 'PAYMENT_FINAL_VALUE', 'C2', '2026-11', '5683.60', '5500|5683|5683.60', 'Three C2 Form payment values are revisions of one transaction. Import final amount once from the canonical room tab; do not add each form response.', 'USER', new Date(), 'YES']
  ];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function ensureDashboardSheet_(ss) {
  var sheet = ss.getSheetByName(V7.SHEETS.DASHBOARD);
  if (!sheet) sheet = ss.insertSheet(V7.SHEETS.DASHBOARD);
  if (sheet.getLastRow() === 0) {
    sheet.getRange('A1:B1').setValues([['SAHARE PROPERTIES — V7 DASHBOARD', V7.VERSION]]);
    sheet.getRange('A3:B8').setValues([
      ['Metric', 'Value'],
      ['Current Period', ''],
      ['Total Billed', 0],
      ['Verified Received', 0],
      ['Reported / Unverified', 0],
      ['Outstanding (against verified payments)', 0]
    ]);
    sheet.getRange('A10:H10').setValues([['Room', 'Tenant', 'Billing Period', 'Billed', 'Verified', 'Unverified', 'Outstanding', 'Bill Status']]);
    sheet.setFrozenRows(3);
    sheet.getRange('A1:H1').setFontWeight('bold').setFontSize(14);
    sheet.getRange('A3:B3').setFontWeight('bold');
    sheet.getRange('A10:H10').setFontWeight('bold');
  }
}


/** Updates only the Room question choices; it does not edit or delete Form responses. */
function syncV7FormRoomChoices() {
  return withSystemErrorHandling_('syncV7FormRoomChoices', {}, function () {
    var formId = String(getConfigValue_('FORM_ID', '')).trim();
    if (!formId) throw new Error('FORM_ID is blank in System Config.');
    var roomMap = getRoomMasterMap_();
    var choices = Object.keys(roomMap).sort().filter(function (roomNo) {
      var room = roomMap[roomNo];
      return room.occupancyStatus === 'ACTIVE' || room.occupancyStatus === 'OCCUPIED';
    }).map(function (roomNo) {
      var room = roomMap[roomNo];
      return roomNo + ' - ' + room.tenantName + (room.meterNo ? ' (Meter: ' + room.meterNo + ')' : '');
    });
    if (!choices.length) throw new Error('No active rooms found in Room Master. Complete migration before syncing Form choices.');
    var form = FormApp.openById(formId);
    var periodChoices = buildPeriodChoiceList_(new Date(), getConfigValue_('FORM_PERIOD_LOOKBACK_MONTHS', '3'), getConfigValue_('FORM_PERIOD_LOOKAHEAD_MONTHS', '12'));
    var items = form.getItems();
    var roomQuestionsUpdated = 0;
    var periodQuestionsUpdated = 0;
    items.forEach(function (item) {
      var title = String(item.getTitle() || '').toLowerCase();
      var isList = item.getType() === FormApp.ItemType.LIST;
      var isMultipleChoice = item.getType() === FormApp.ItemType.MULTIPLE_CHOICE;
      if (!isList && !isMultipleChoice) return;
      if (title.indexOf('room') !== -1) {
        if (isList) item.asListItem().setChoiceValues(choices);
        else item.asMultipleChoiceItem().setChoiceValues(choices);
        roomQuestionsUpdated++;
      } else if (title.indexOf('month') !== -1 || title.indexOf('period') !== -1) {
        if (isList) item.asListItem().setChoiceValues(periodChoices);
        else item.asMultipleChoiceItem().setChoiceValues(periodChoices);
        periodQuestionsUpdated++;
      }
    });
    if (!roomQuestionsUpdated) throw new Error('No Room dropdown or multiple-choice question was found in the configured Form.');
    if (!periodQuestionsUpdated) Logger.log('No Month/Billing Period choice question was updated; form month values may still use legacy month names.');
    logAudit_('FORM_CHOICES_SYNCED', 'GOOGLE_FORM', formId, { roomChoices: choices, periodChoices: periodChoices, roomQuestionsUpdated: roomQuestionsUpdated, periodQuestionsUpdated: periodQuestionsUpdated });
    SpreadsheetApp.getUi().alert('Google Form choices updated.\nRoom choices: ' + choices.length + '\nBilling periods: ' + periodChoices.length + '\nRoom questions updated: ' + roomQuestionsUpdated + '\nPeriod questions updated: ' + periodQuestionsUpdated + '\nExisting Form responses were not changed.');
    return { roomChoices: choices.length, periodChoices: periodChoices.length, roomQuestionsUpdated: roomQuestionsUpdated, periodQuestionsUpdated: periodQuestionsUpdated };
  });
}

/* ==========================================================================
 * MODULE: 03_AuditAndError.gs
 * ========================================================================== */

/** Central audit and exception logging. */
function logAudit_(action, entityType, entityId, details) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.AUDIT);
    if (!sheet) return;
    var row = [[makeId_('LOG'), new Date(), getActor_(), action, entityType, String(entityId || ''), JSON.stringify(details || {}), 'Apps Script v' + V7.VERSION]];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row[0].length).setValues(row);
  } catch (error) {
    Logger.log('Audit logging failed: ' + (error.stack || error.message));
  }
}

function logSystemError(functionName, error, context) {
  var message = error && error.message ? error.message : String(error);
  var stack = error && error.stack ? error.stack : '';
  Logger.log('[' + functionName + '] ' + message + '\n' + stack);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.ERRORS);
    if (!sheet) return;
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 7).setValues([[
      makeId_('ERR'), new Date(), functionName, message, stack,
      JSON.stringify(context || {}), 'OPEN'
    ]]);
  } catch (loggingError) {
    Logger.log('Error Log write failed: ' + (loggingError.stack || loggingError.message));
  }
}

function withSystemErrorHandling_(functionName, context, callback) {
  try {
    return callback();
  } catch (error) {
    logSystemError(functionName, error, context);
    throw error;
  }
}

/* ==========================================================================
 * MODULE: 04_TenantService.gs
 * ========================================================================== */

/** Tenant and room master services. Legacy Tenant Master is read-only for migration. */
function getRoomMasterMap_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.ROOM_MASTER);
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var columns = getColumnMap(data[0]);
  var result = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var room = normalizeRoom_(valueByAliases_(row, columns, ['RoomNo']));
    if (!room) continue;
    result[room] = {
      roomNo: room,
      meterNo: String(valueByAliases_(row, columns, ['MeterNo']) || '').trim(),
      baseRent: toNumber_(valueByAliases_(row, columns, ['BaseRent'])),
      electricityRate: toNumber_(valueByAliases_(row, columns, ['ElectricityRate']), toNumber_(getConfigValue_('DEFAULT_ELECTRICITY_RATE', '13.50'))),
      occupancyStatus: String(valueByAliases_(row, columns, ['OccupancyStatus']) || 'ACTIVE').toUpperCase(),
      tenantId: String(valueByAliases_(row, columns, ['CurrentTenantID']) || ''),
      tenantName: String(valueByAliases_(row, columns, ['CurrentTenantName']) || 'Tenant'),
      mobile: String(valueByAliases_(row, columns, ['CurrentTenantMobile']) || '').replace(/\D/g, ''),
      email: String(valueByAliases_(row, columns, ['CurrentTenantEmail']) || '').trim(),
      deposit: toNumber_(valueByAliases_(row, columns, ['SecurityDeposit'])),
      depositMode: String(valueByAliases_(row, columns, ['DepositMode']) || ''),
      depositDate: valueByAliases_(row, columns, ['DepositDate']),
      agreementStartDate: valueByAliases_(row, columns, ['AgreementStartDate']),
      agreementEndDate: valueByAliases_(row, columns, ['AgreementEndDate']),
      notes: String(valueByAliases_(row, columns, ['Notes']) || '')
    };
  }
  return result;
}

function getTenantForRoom_(roomNo) {
  var room = getRoomMasterMap_()[normalizeRoom_(roomNo)];
  if (!room) throw new Error('Room is not configured in Room Master: ' + roomNo);
  if (room.occupancyStatus !== 'ACTIVE' && room.occupancyStatus !== 'OCCUPIED') {
    throw new Error('Room is not currently occupied: ' + roomNo);
  }
  return room;
}

/** Read-only preview: describes records that would be seeded from Tenant Master. */
function previewRoomMasterSeed() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var source = ss.getSheetByName('Tenant Master');
  if (!source) throw new Error('Legacy Tenant Master sheet was not found.');
  var data = source.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  var existing = getRoomMasterMap_();
  var additions = [];
  data.slice(1).forEach(function (row, index) {
    var room = normalizeRoom_(valueByAliases_(row, cols, ['Room No', 'Room Number']));
    var tenantName = String(valueByAliases_(row, cols, ['Tenant Name', 'Name']) || '').trim();
    if (!room || room === 'TOTAL' || !tenantName) return;
    additions.push({ room: room, tenant: tenantName, action: existing[room] ? 'EXISTS — no change' : 'WOULD ADD', sourceRow: index + 2 });
  });
  var msg = additions.map(function (r) { return r.room + ' — ' + r.tenant + ' — ' + r.action; }).join('\n');
  SpreadsheetApp.getUi().alert('Room Master seed preview (read-only)', msg || 'No tenant rows found.', SpreadsheetApp.getUi().ButtonSet.OK);
  return additions;
}

/* ==========================================================================
 * MODULE: 05_MeterService.gs
 * ========================================================================== */

/** Meter readings are append-only; each Form row is idempotent. */
function recordMeterReading_(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.METERS);
  var idempotencyKey = data.idempotencyKey;
  if (idempotencyKey && columnContainsValue_(sheet, 'IdempotencyKey', idempotencyKey)) return { duplicate: true };
  var room = getTenantForRoom_(data.roomNo);
  var row = [[
    makeId_('READ'), room.roomNo, room.meterNo, data.period,
    roundMoney_(data.reading), data.readingDate || new Date(), data.photoReference || '',
    idempotencyKey || '', data.sourceType || 'FORM', data.sourceSheet || '', data.sourceRow || '', data.notes || '', new Date()
  ]];
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row[0].length).setValues(row);
  logAudit_('METER_READING_REPORTED', 'METER_READING', row[0][0], { room: room.roomNo, period: data.period, reading: data.reading });
  return { duplicate: false, readingId: row[0][0] };
}

function getMeterReadingForPeriod_(roomNo, period) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.METERS);
  if (!sheet || sheet.getLastRow() < 2) return null;
  var values = sheet.getDataRange().getValues();
  var cols = getColumnMap(values[0]);
  var target = parsePeriodInput_(period);
  var matches = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (normalizeRoom_(valueByAliases_(row, cols, ['RoomNo'])) !== normalizeRoom_(roomNo)) continue;
    if (String(valueByAliases_(row, cols, ['BillingPeriod'])) !== target) continue;
    matches.push({ reading: toNumber_(valueByAliases_(row, cols, ['ReadingValue'])), date: toDateSafe_(valueByAliases_(row, cols, ['ReadingDate'])), row: i + 1 });
  }
  if (!matches.length) return null;
  matches.sort(function (a, b) { return (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0) || b.row - a.row; });
  return matches[0];
}

function getPreviousMeterReading_(roomNo, period) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.METERS);
  if (!sheet || sheet.getLastRow() < 2) return null;
  var values = sheet.getDataRange().getValues();
  var cols = getColumnMap(values[0]);
  var target = parsePeriodInput_(period);
  var matches = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (normalizeRoom_(valueByAliases_(row, cols, ['RoomNo'])) !== normalizeRoom_(roomNo)) continue;
    var key = String(valueByAliases_(row, cols, ['BillingPeriod']) || '');
    if (!/^\d{4}-\d{2}$/.test(key) || key >= target) continue;
    matches.push({ period: key, reading: toNumber_(valueByAliases_(row, cols, ['ReadingValue'])) });
  }
  matches.sort(function (a, b) { return b.period.localeCompare(a.period); });
  return matches.length ? matches[0] : null;
}

function columnContainsValue_(sheet, headerName, value) {
  if (!sheet || sheet.getLastRow() < 2) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var cols = getColumnMap(headers);
  var col = cols[normalizeHeader_(headerName)];
  if (!col) throw new Error('Column ' + headerName + ' not found in ' + sheet.getName());
  var values = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getDisplayValues();
  return values.some(function (row) { return String(row[0]) === String(value); });
}

/** Reads Meter Reading Ledger once and builds an in-memory room-period index. */
function buildMeterReadingIndex_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.METERS);
  var index = {};
  if (!sheet || sheet.getLastRow() < 2) return index;
  var values = sheet.getDataRange().getValues();
  var cols = getColumnMap(values[0]);
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var room = normalizeRoom_(valueByAliases_(row, cols, ['RoomNo']));
    var period = String(valueByAliases_(row, cols, ['BillingPeriod']) || '');
    if (!room || !/^\d{4}-\d{2}$/.test(period)) continue;
    var key = room + '|' + period;
    var candidate = { reading: toNumber_(valueByAliases_(row, cols, ['ReadingValue'])), date: toDateSafe_(valueByAliases_(row, cols, ['ReadingDate'])), row: i + 1, period: period };
    if (!index[key] || (candidate.date ? candidate.date.getTime() : 0) >= (index[key].date ? index[key].date.getTime() : 0)) index[key] = candidate;
  }
  return index;
}

function getPreviousReadingFromIndex_(index, roomNo, period) {
  var target = parsePeriodInput_(period);
  var prefix = normalizeRoom_(roomNo) + '|';
  var candidates = Object.keys(index).filter(function (key) { return key.indexOf(prefix) === 0 && key.slice(prefix.length) < target; });
  if (!candidates.length) return null;
  candidates.sort(function (a, b) { return b.slice(prefix.length).localeCompare(a.slice(prefix.length)); });
  return index[candidates[0]];
}

/* ==========================================================================
 * MODULE: 06_BillingService.gs
 * ========================================================================== */

/** Billing engine: unique bills per room-period, indexed reads, batch writes. */
function createMonthlyBills(periodInput, options) {
  return withSystemErrorHandling_('createMonthlyBills', { period: periodInput }, function () {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Billing run is already in progress. Please retry after it finishes.');
    try {
      var period = parsePeriodInput_(periodInput);
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var roomMap = getRoomMasterMap_();
      var meterIndex = buildMeterReadingIndex_();
      var verifiedTotals = getVerifiedPaymentTotals_();
      var billSheet = ss.getSheetByName(V7.SHEETS.BILLING);
      var existing = {};
      if (billSheet.getLastRow() >= 2) {
        var existingData = billSheet.getDataRange().getValues();
        var existingCols = getColumnMap(existingData[0]);
        existingData.slice(1).forEach(function (r, index) {
          var id = String(valueByAliases_(r, existingCols, ['BillID']));
          if (id) existing[id] = { rowNumber: index + 2, status: String(valueByAliases_(r, existingCols, ['BillStatus'])).toUpperCase() };
        });
      }
      var output = [];
      var updates = [];
      var notificationRows = [];
      var skipped = [];
      Object.keys(roomMap).sort().forEach(function (roomNo) {
        var room = roomMap[roomNo];
        if (room.occupancyStatus !== 'ACTIVE' && room.occupancyStatus !== 'OCCUPIED') return;
        var billId = makeBillId_(roomNo, period);
        var existingBill = existing[billId];
        if (existingBill && existingBill.status !== 'PLANNED') {
          skipped.push(roomNo + ': already exists (' + existingBill.status + ')');
          return;
        }
        var current = meterIndex[roomNo + '|' + period] || null;
        var previous = getPreviousReadingFromIndex_(meterIndex, roomNo, period);
        if (!current || !previous) { skipped.push(roomNo + ': missing current or previous meter reading'); return; }
        if (current.reading < previous.reading) { skipped.push(roomNo + ': current reading is lower than previous reading; manual review required'); return; }
        var units = roundMoney_(current.reading - previous.reading);
        var rate = room.electricityRate || toNumber_(getConfigValue_('DEFAULT_ELECTRICITY_RATE', '13.50'));
        var electricity = roundMoney_(units * rate);
        var baseRent = roundMoney_(room.baseRent);
        var total = roundMoney_(baseRent + electricity);
        var dueDate = dueDateForPeriod_(period, toNumber_(getConfigValue_('BILLING_DUE_DAY', '5')));
        var verified = roundMoney_(verifiedTotals[billId] || 0);
        var outstanding = roundMoney_(Math.max(0, total - verified));
        var upi = buildUpiLink_(outstanding, roomNo, period);
        var message = buildBillingMessage({
          tenantName: room.tenantName, period: period, baseRent: baseRent,
          electricityAmount: electricity, totalAmount: total,
          verifiedPayments: verified, outstandingAmount: outstanding, upiLink: upi
        });
        var whatsapp = buildWhatsAppUrl_(room.mobile, message);
        var qrUrl = buildQrUrl_(upi);
        var htmlMessage = '<div style="font-family:Arial;white-space:pre-line">' + escapeHtml_(message) + '</div>' + (qrUrl ? '<p><img src="' + qrUrl + '" alt="UPI QR Code" width="180"></p>' : '');
        var billRow = [
          billId, roomNo, room.tenantId, period, baseRent, previous.reading, current.reading,
          units, rate, electricity, total, verified, outstanding, dueDate,
          'ISSUED', reconciliationStatus_(total, verified), whatsapp, upi, qrUrl, new Date(), 'V7_BILLING_ENGINE', '', '', ''
        ];
        if (existingBill && existingBill.status === 'PLANNED') updates.push({ rowNumber: existingBill.rowNumber, values: billRow });
        else output.push(billRow);
        if (room.email) notificationRows.push(buildNotificationRow_('TENANT_BILL', room.email, 'Rent Bill — Room ' + roomNo + ' — ' + period, message, htmlMessage, 'BILL', billId, []));
      });
      if (output.length) billSheet.getRange(billSheet.getLastRow() + 1, 1, output.length, output[0].length).setValues(output);
      // A planned future row is converted to an issued bill only after the meter readings are available.
      var plannedWriteBlocks = writeContiguousRows_(billSheet, updates, V7.SCHEMAS[V7.SHEETS.BILLING].length);
      appendNotificationRows_(notificationRows);
      logAudit_('MONTHLY_BILLS_CREATED', 'BILLING_PERIOD', period, { created: output.length, activatedPlanned: updates.length, plannedWriteBlocks: plannedWriteBlocks, skipped: skipped });
      refreshV7Dashboard();
      if (!options || !options.silent) SpreadsheetApp.getUi().alert('Billing run completed for ' + period + '\nNew bills: ' + output.length + '\nPlanned bills activated: ' + updates.length + '\nSkipped: ' + skipped.length + (skipped.length ? '\n\n' + skipped.join('\n') : ''));
      return { created: output.length, updatedPlanned: updates.length, plannedWriteBlocks: plannedWriteBlocks, skipped: skipped };
    } finally {
      lock.releaseLock();
    }
  });
}

function dueDateForPeriod_(period, day) {
  var parts = periodParts_(period);
  return new Date(parts.year, parts.month - 1, Math.max(1, Math.min(28, day || 5)));
}

function promptCreateMonthlyBills() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Create monthly bills', 'Enter period as YYYY-MM (example: 2026-11).', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  createMonthlyBills(response.getResponseText());
}

/* ==========================================================================
 * MODULE: 07_PaymentService.gs
 * ========================================================================== */

/** Payment ledger. Reported amounts are not treated as received until verified. */
function recordReportedPayment_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(V7.SHEETS.PAYMENTS);
  var room = getTenantForRoom_(data.roomNo);
  var receiptIdempotencyKey = data.idempotencyKey ? data.idempotencyKey + ':RECEIPT' : '';
  var existingPaymentId = data.idempotencyKey ? findPaymentIdByIdempotencyKey_(sheet, data.idempotencyKey) : '';
  if (existingPaymentId) {
    // Recover a receipt if a prior attempt committed the payment row but failed before receipt registration.
    if (data.receiptUrl) registerReceipt_({
      roomNo: room.roomNo, tenantId: room.tenantId, period: data.period,
      paymentId: existingPaymentId, receiptType: 'PAYMENT_RECEIPT', fileReference: data.receiptUrl,
      sourceSheet: data.sourceSheet, sourceRow: data.sourceRow,
      idempotencyKey: receiptIdempotencyKey,
      notes: 'Recovered receipt reference for an idempotent payment submission.'
    });
    return { duplicate: true };
  }
  var paymentId = makeId_('PAY');
  var billId = makeBillId_(room.roomNo, data.period);
  var row = [[
    paymentId, billId, room.roomNo, room.tenantId, data.period,
    roundMoney_(data.amount), data.reportedAt || new Date(), data.paymentMethod || 'UPI / NOT SPECIFIED',
    data.referenceNumber || '', data.receiptUrl || '', 'REPORTED_UNVERIFIED', '', '',
    data.idempotencyKey || '', data.sourceType || 'FORM', data.sourceSheet || '', data.sourceRow || '', data.notes || ''
  ]];
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row[0].length).setValues(row);
  if (data.receiptUrl) registerReceipt_({ roomNo: room.roomNo, tenantId: room.tenantId, period: data.period, paymentId: paymentId, receiptType: 'PAYMENT_RECEIPT', fileReference: data.receiptUrl, sourceSheet: data.sourceSheet, sourceRow: data.sourceRow, idempotencyKey: receiptIdempotencyKey, notes: 'Reported by tenant; access is not made public.' });
  var message = 'Hello ' + room.tenantName + ',\n\nYour payment submission of Rs. ' + roundMoney_(data.amount).toFixed(2) + ' for ' + data.period + ' has been received for verification. This is not a payment confirmation.\n\nThank you,\nSahare Properties';
  if (room.email) enqueueEmail_('PAYMENT_REPORTED', room.email, 'Payment Submission Received — Room ' + room.roomNo, message, '<div style="font-family:Arial;white-space:pre-line">' + escapeHtml_(message) + '</div>', 'PAYMENT', paymentId);
  logAudit_('PAYMENT_REPORTED_UNVERIFIED', 'PAYMENT', paymentId, { room: room.roomNo, period: data.period, amount: data.amount, sourceRow: data.sourceRow });
  return { duplicate: false, paymentId: paymentId };
}

function findPaymentIdByIdempotencyKey_(sheet, idempotencyKey) {
  if (!sheet || sheet.getLastRow() < 2) return '';
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  for (var i = 1; i < data.length; i++) {
    if (String(valueByAliases_(data[i], cols, ['IdempotencyKey'])) === String(idempotencyKey)) {
      return String(valueByAliases_(data[i], cols, ['PaymentID']) || '');
    }
  }
  return '';
}

function registerReceipt_(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.RECEIPTS);
  if (data.idempotencyKey && columnContainsValue_(sheet, 'IdempotencyKey', data.idempotencyKey)) return;
  var row = [[
    makeId_('REC'), data.roomNo || '', data.tenantId || '', data.period || '', data.paymentId || '',
    data.receiptType || 'OTHER', data.fileReference || '', data.sourceSheet || '', data.sourceRow || '',
    'RESTRICTED_OR_SOURCE_PERMISSIONS', data.idempotencyKey || '', new Date(), data.notes || ''
  ]];
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row[0].length).setValues(row);
}

function getVerifiedPaymentTotals_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.PAYMENTS);
  var totals = {};
  if (!sheet || sheet.getLastRow() < 2) return totals;
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(valueByAliases_(row, cols, ['VerificationStatus'])).toUpperCase() !== 'VERIFIED') continue;
    var billId = String(valueByAliases_(row, cols, ['BillID']));
    if (!billId) continue;
    totals[billId] = roundMoney_((totals[billId] || 0) + toNumber_(valueByAliases_(row, cols, ['Amount'])));
  }
  return totals;
}

function getVerifiedPaymentsForBill_(billId) {
  return roundMoney_(getVerifiedPaymentTotals_()[billId] || 0);
}

function verifySelectedPayment() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Payment ledger is being updated. Please retry.');
  try {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== V7.SHEETS.PAYMENTS) {
    ui.alert('Payment Ledger sheet निवडा आणि ज्या पेमेंटची पडताळणी करायची आहे ती row निवडा.');
    return;
  }
  var range = sheet.getActiveRange();
  if (!range || range.getRow() < 2) { ui.alert('Header च्या खालील Payment row निवडा.'); return; }
  var rowNumber = range.getRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var cols = getColumnMap(headers);
  var row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  var statusCol = cols[normalizeHeader_('VerificationStatus')];
  var currentStatus = String(row[statusCol - 1] || '').toUpperCase();
  if (currentStatus === 'VERIFIED') { ui.alert('हे पेमेंट आधीच Verified आहे.'); return; }
  if (currentStatus !== 'REPORTED_UNVERIFIED' && currentStatus !== 'LEGACY_UNVERIFIED') { ui.alert('या Status मधील पेमेंट Verify करता येणार नाही: ' + currentStatus); return; }
  var amount = toNumber_(valueByAliases_(row, cols, ['Amount']));
  if (amount <= 0) { ui.alert('पेमेंट रक्कम शून्य किंवा अवैध आहे.'); return; }
  var answer = ui.alert('Confirm payment verification', 'Room: ' + valueByAliases_(row, cols, ['RoomNo']) + '\nPeriod: ' + valueByAliases_(row, cols, ['BillingPeriod']) + '\nAmount: Rs. ' + amount.toFixed(2) + '\n\nबँक/UPI व्यवहार तपासूनच Verified करा. पुढे जायचे?', ui.ButtonSet.YES_NO);
  if (answer !== ui.Button.YES) return;
  row[statusCol - 1] = 'VERIFIED';
  row[cols[normalizeHeader_('VerifiedAt')] - 1] = new Date();
  row[cols[normalizeHeader_('VerifiedBy')] - 1] = getActor_();
  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  var billId = String(valueByAliases_(row, cols, ['BillID']));
  refreshBillBalance_(billId);
  logAudit_('PAYMENT_VERIFIED', 'PAYMENT', valueByAliases_(row, cols, ['PaymentID']), { amount: amount, billId: billId, row: rowNumber });
  ui.alert('Payment verified. संबंधित Bill balance refresh केले आहे.');
  } finally {
    lock.releaseLock();
  }
}

function refreshBillBalance_(billId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.BILLING);
  if (!sheet || sheet.getLastRow() < 2) return;
  var values = sheet.getDataRange().getValues();
  var cols = getColumnMap(values[0]);
  var paymentTotal = getVerifiedPaymentsForBill_(billId);
  for (var i = 1; i < values.length; i++) {
    if (String(valueByAliases_(values[i], cols, ['BillID'])) !== billId) continue;
    var totalRaw = valueByAliases_(values[i], cols, ['TotalAmount']);
    var totalKnown = totalRaw !== '' && totalRaw !== null && totalRaw !== undefined;
    var amount = totalKnown ? roundMoney_(totalRaw) : 0;
    var outstanding = totalKnown ? roundMoney_(Math.max(0, amount - paymentTotal)) : '';
    values[i][cols[normalizeHeader_('VerifiedPayments')] - 1] = paymentTotal;
    values[i][cols[normalizeHeader_('OutstandingAmount')] - 1] = outstanding;
    values[i][cols[normalizeHeader_('ReconciliationStatus')] - 1] = reconciliationStatus_(totalRaw, paymentTotal);
    var room = getRoomMasterMap_()[normalizeRoom_(valueByAliases_(values[i], cols, ['RoomNo']))];
    if (!room) throw new Error('Room Master entry missing while reconciling bill ' + billId);
    var period = String(valueByAliases_(values[i], cols, ['BillingPeriod']));
    var upi = totalKnown ? buildUpiLink_(outstanding, room.roomNo, period) : '';
    var message = buildBillingMessage({ tenantName: room.tenantName, period: period, baseRent: valueByAliases_(values[i], cols, ['BaseRent']), electricityAmount: valueByAliases_(values[i], cols, ['ElectricityAmount']), totalAmount: amount, verifiedPayments: paymentTotal, outstandingAmount: totalKnown ? outstanding : 0, upiLink: upi });
    values[i][cols[normalizeHeader_('UPIURL')] - 1] = upi;
    values[i][cols[normalizeHeader_('UPIQRURL')] - 1] = totalKnown ? buildQrUrl_(upi) : '';
    values[i][cols[normalizeHeader_('WhatsAppURL')] - 1] = totalKnown ? buildWhatsAppUrl_(room.mobile, message) : '';
    sheet.getRange(i + 1, 1, 1, values[i].length).setValues([values[i]]);
    break;
  }
}

/* ==========================================================================
 * MODULE: 08_FormHandler.gs
 * ========================================================================== */

/** Spreadsheet form-submit trigger. Processes only the submitted row. */
function v7_onFormSubmit(e) {
  return withSystemErrorHandling_('v7_onFormSubmit', { hasEvent: !!e }, function () {
    if (!e || !e.range) throw new Error('This handler must be called by a spreadsheet form-submit trigger.');
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Could not obtain script lock within 30 seconds.');
    try {
      var sheet = e.range.getSheet();
      var rowNumber = e.range.getRow();
      if (rowNumber < 2) return;
      var lastColumn = sheet.getLastColumn();
      var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      var row = sheet.getRange(rowNumber, 1, 1, lastColumn).getValues()[0];
      var columns = getColumnMap(headers);
      var timestamp = valueByAliases_(row, columns, ['Timestamp', 'Submitted At']) || new Date();
      var roomNo = parseRoomChoice_(valueByAliases_(row, columns, ['Select Room Number', 'Room Number', 'RoomNo', 'Room']));
      var monthValue = valueByAliases_(row, columns, ['Billing Period', 'Select Month', 'Month']);
      if (!roomNo || !monthValue) throw new Error('Form row is missing Room Number or Month.');
      var period = resolveFormPeriod_(monthValue, timestamp);
      var reading = valueByAliases_(row, columns, ['Current Meter Reading', 'Reading']);
      var amount = valueByAliases_(row, columns, ['Rent Amount Paid (Rs)', 'Amount Paid', 'Payment Amount']);
      var readingPhoto = valueByAliases_(row, columns, ['Meter Reading Photo', 'Reading Photo']);
      var receiptPhoto = valueByAliases_(row, columns, ['Payment Receipt Photo / Screenshot', 'Payment Receipt Photo', 'Receipt Photo']);
      var remarks = valueByAliases_(row, columns, ['Remarks / Note', 'Remarks', 'Note']);
      var sourceKey = 'FORM:' + sheet.getSheetId() + ':' + rowNumber;
      var results = [];
      if (reading !== '' && reading !== null && reading !== undefined) {
        var readingNumber = toNumber_(reading, NaN);
        if (!Number.isFinite(readingNumber) || readingNumber < 0) throw new Error('Invalid meter reading in submitted row ' + rowNumber);
        results.push(recordMeterReading_({ roomNo: roomNo, period: period, reading: readingNumber, readingDate: timestamp, photoReference: String(readingPhoto || ''), idempotencyKey: sourceKey + ':METER', sourceType: 'GOOGLE_FORM', sourceSheet: sheet.getName(), sourceRow: rowNumber, notes: remarks }));
      }
      if (amount !== '' && amount !== null && amount !== undefined) {
        var amountNumber = toNumber_(amount, NaN);
        if (!Number.isFinite(amountNumber) || amountNumber <= 0) throw new Error('Payment amount must be greater than zero in row ' + rowNumber);
        results.push(recordReportedPayment_({ roomNo: roomNo, period: period, amount: amountNumber, reportedAt: timestamp, receiptUrl: String(receiptPhoto || ''), idempotencyKey: sourceKey + ':PAYMENT', sourceType: 'GOOGLE_FORM', sourceSheet: sheet.getName(), sourceRow: rowNumber, notes: remarks }));
      }
      if (readingPhoto) registerReceipt_({ roomNo: roomNo, period: period, receiptType: 'METER_PHOTO', fileReference: String(readingPhoto), sourceSheet: sheet.getName(), sourceRow: rowNumber, idempotencyKey: sourceKey + ':METER_PHOTO', notes: 'Meter photo reference from form; no public sharing applied.' });
      logAudit_('FORM_ROW_PROCESSED', 'FORM_RESPONSE', sourceKey, { period: period, room: roomNo, results: results });
      return results;
    } finally {
      lock.releaseLock();
    }
  });
}

function resolveFormPeriod_(monthOrPeriod, timestamp) {
  var raw = String(monthOrPeriod || '').trim();
  if (/^\d{4}[-/]\d{1,2}$/.test(raw)) return parsePeriodInput_(raw);
  var date = toDateSafe_(timestamp) || new Date();
  return periodKey_(date.getFullYear(), raw);
}

/* ==========================================================================
 * MODULE: 09_NotificationService.gs
 * ========================================================================== */

/** Email queue with bounded retries. WhatsApp is generated as a click-to-chat URL only. */
function enqueueEmail_(type, recipient, subject, plainBody, htmlBody, referenceType, referenceId, attachmentFileIds) {
  if (!recipient) return null;
  var existingId = findNotificationByReference_(type, recipient, referenceType, referenceId);
  if (existingId) return existingId;
  var row = buildNotificationRow_(type, recipient, subject, plainBody, htmlBody, referenceType, referenceId, attachmentFileIds);
  appendNotificationRows_([row]);
  return row[0];
}

function buildNotificationRow_(type, recipient, subject, plainBody, htmlBody, referenceType, referenceId, attachmentFileIds) {
  return [makeId_('NTF'), type, recipient, subject, plainBody, htmlBody, (attachmentFileIds || []).join(','), referenceType || '', referenceId || '', 'QUEUED', 0, '', new Date(), ''];
}

/** Prevents repeated daily triggers from enqueueing the same business notification. */
function findNotificationByReference_(type, recipient, referenceType, referenceId) {
  if (!referenceType || !referenceId) return '';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.NOTIFICATIONS);
  if (!sheet || sheet.getLastRow() < 2) return '';
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    if (String(valueByAliases_(row, cols, ['Type'])) !== String(type)) continue;
    if (String(valueByAliases_(row, cols, ['Recipient'])).toLowerCase() !== String(recipient).toLowerCase()) continue;
    if (String(valueByAliases_(row, cols, ['ReferenceType'])) !== String(referenceType)) continue;
    if (String(valueByAliases_(row, cols, ['ReferenceID'])) !== String(referenceId)) continue;
    return String(valueByAliases_(row, cols, ['NotificationID']) || 'EXISTING_NOTIFICATION');
  }
  return '';
}

function appendNotificationRows_(rows) {
  if (!rows || !rows.length) return;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.NOTIFICATIONS);
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function processNotificationQueue() {
  return withSystemErrorHandling_('processNotificationQueue', {}, function () {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Notification queue is already being processed.');
    try {
    if (String(getConfigValue_('MAIL_ENABLED', 'NO')).toUpperCase() !== 'YES') return { sent: 0, skipped: 'MAIL_ENABLED is not YES' };
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.NOTIFICATIONS);
    if (!sheet || sheet.getLastRow() < 2) return { sent: 0 };
    var range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
    var data = range.getValues();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    var cols = getColumnMap(headers);
    var maxBatch = Math.max(1, Math.min(100, toNumber_(getConfigValue_('NOTIFICATION_BATCH_SIZE', '20'), 20)));
    var adminEmail = String(getConfigValue_('ADMIN_EMAIL', '')).trim();
    var sent = 0;
    for (var i = 0; i < data.length && sent < maxBatch; i++) {
      var status = String(valueByAliases_(data[i], cols, ['Status'])).toUpperCase();
      if (status !== 'QUEUED' && status !== 'RETRY') continue;
      var attempts = toNumber_(valueByAliases_(data[i], cols, ['Attempts'])) + 1;
      try {
        var email = {
          to: String(valueByAliases_(data[i], cols, ['Recipient'])),
          subject: String(valueByAliases_(data[i], cols, ['Subject'])),
          body: String(valueByAliases_(data[i], cols, ['PlainBody'])),
          htmlBody: String(valueByAliases_(data[i], cols, ['HtmlBody'])),
          name: 'Sahare Properties'
        };
        var attachmentIds = String(valueByAliases_(data[i], cols, ['AttachmentFileIDs']) || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        if (attachmentIds.length) email.attachments = attachmentIds.map(function (id) { return DriveApp.getFileById(id).getBlob(); });
        if (adminEmail) email.bcc = adminEmail;
        MailApp.sendEmail(email);
        data[i][cols[normalizeHeader_('Status')] - 1] = 'SENT';
        data[i][cols[normalizeHeader_('Attempts')] - 1] = attempts;
        data[i][cols[normalizeHeader_('LastError')] - 1] = '';
        data[i][cols[normalizeHeader_('SentAt')] - 1] = new Date();
        sent++;
      } catch (error) {
        data[i][cols[normalizeHeader_('Attempts')] - 1] = attempts;
        data[i][cols[normalizeHeader_('LastError')] - 1] = error.message || String(error);
        data[i][cols[normalizeHeader_('Status')] - 1] = attempts >= 3 ? 'FAILED' : 'RETRY';
        logSystemError('processNotificationQueue', error, { notificationId: data[i][cols[normalizeHeader_('NotificationID')] - 1], attempt: attempts });
      }
    }
    range.setValues(data);
    return { sent: sent };
    } finally {
      lock.releaseLock();
    }
  });
}

/* ==========================================================================
 * MODULE: 10_AgreementService.gs
 * ========================================================================== */

/** Agreement generation from the user-designated live Google Docs master template. */
function promptGenerateAgreement() {
  var ui = SpreadsheetApp.getUi();
  var answer = ui.prompt('Generate Rent Agreement', 'Enter Room Number (for example B1 or C2).', ui.ButtonSet.OK_CANCEL);
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  var result = generateAgreementForRoom(answer.getResponseText());
  if (result && result.pdfUrl) ui.alert('Agreement PDF तयार आहे.\n' + result.pdfUrl + (result.duplicate ? '\nExisting agreement returned; duplicate was not created.' : ''));
}

function generateAgreementForRoom(roomNo) {
  return withSystemErrorHandling_('generateAgreementForRoom', { roomNo: roomNo }, function () {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Agreement generation is already in progress.');
    var docCopy = null;
    var pdfFile = null;
    var registered = false;
    try {
      var room = getTenantForRoom_(roomNo);
      var templateId = String(getConfigValue_('AGREEMENT_TEMPLATE_ID', '')).trim();
      if (!templateId) throw new Error('AGREEMENT_TEMPLATE_ID is missing in System Config.');
      var startDate = toDateSafe_(room.agreementStartDate);
      if (!startDate) throw new Error('Agreement start date is missing for room ' + room.roomNo + '.');
      var months = Math.max(1, Math.min(24, toNumber_(getConfigValue_('AGREEMENT_DURATION_MONTHS', '11'), 11)));
      var endDate = addMonthsClamped_(startDate, months);
      endDate.setDate(endDate.getDate() - 1);
      var agreementKey = room.roomNo + '|' + room.tenantId + '|' + Utilities.formatDate(startDate, V7.TIMEZONE, 'yyyy-MM-dd');
      var register = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.AGREEMENTS);
      var existing = findAgreementByKey_(register, agreementKey);
      if (existing) return { duplicate: true, pdfUrl: existing.pdfUrl, agreementId: existing.agreementId };

      var replacements = {
        '{{TenantName}}': room.tenantName,
        '{{RoomNo}}': room.roomNo,
        '{{MobileNumber}}': room.mobile,
        '{{Rent}}': roundMoney_(room.baseRent).toFixed(2),
        '{{Deposit}}': roundMoney_(room.deposit).toFixed(2),
        '{{DepositMode}}': room.depositMode || 'Online / UPI',
        '{{DepositDate}}': formatDate_(room.depositDate, 'dd-MM-yyyy') || 'N/A',
        '{{StartDate}}': Utilities.formatDate(startDate, V7.TIMEZONE, 'dd-MM-yyyy'),
        '{{EndDate}}': Utilities.formatDate(endDate, V7.TIMEZONE, 'dd-MM-yyyy')
      };
      // Validate the live master before copying it, avoiding orphan copies when placeholders are absent.
      var templateDoc = DocumentApp.openById(templateId);
      var templateText = templateDoc.getBody().getText();
      var missingTokens = Object.keys(replacements).filter(function (token) { return templateText.indexOf(token) === -1; });
      if (missingTokens.length) throw new Error('Live Google Docs master is missing expected placeholders: ' + missingTokens.join(', '));

      var templateFile = DriveApp.getFileById(templateId);
      var docName = 'Rent Agreement — Room ' + room.roomNo + ' — ' + safeFileName_(room.tenantName);
      var folderId = String(getConfigValue_('AGREEMENT_FOLDER_ID', '')).trim();
      docCopy = folderId ? templateFile.makeCopy(docName, DriveApp.getFolderById(folderId)) : templateFile.makeCopy(docName);
      var doc = DocumentApp.openById(docCopy.getId());
      var body = doc.getBody();
      Object.keys(replacements).forEach(function (token) {
        body.replaceText(escapeRegex_(token), String(replacements[token]));
      });
      var unresolved = body.getText().match(/\{\{[^}]+\}\}/g);
      if (unresolved && unresolved.length) throw new Error('Unresolved agreement placeholders: ' + unresolved.join(', '));
      doc.saveAndClose();

      var pdfName = 'Rent_Agreement_Room_' + room.roomNo + '_' + safeFileName_(room.tenantName) + '.pdf';
      var pdfBlob = DriveApp.getFileById(docCopy.getId()).getAs(MimeType.PDF).setName(pdfName);
      pdfFile = folderId ? DriveApp.getFolderById(folderId).createFile(pdfBlob) : DriveApp.createFile(pdfBlob);
      // No public/anyone-with-link sharing is granted. Drive's inherited/private permissions remain in effect.

      var agreementId = makeId_('AGR');
      var row = [[agreementId, room.roomNo, room.tenantId, room.tenantName, startDate, endDate, templateId, docCopy.getId(), pdfFile.getId(), pdfFile.getUrl(), 'GENERATED', new Date(), '', 'Generated from live Google Docs master template.']];
      register.getRange(register.getLastRow() + 1, 1, 1, row[0].length).setValues(row);
      registered = true;

      if (room.email) {
        var message = 'Hello ' + room.tenantName + ',\n\nPlease find attached your rent agreement for Room ' + room.roomNo + '.\nValidity: ' + formatDate_(startDate) + ' to ' + formatDate_(endDate) + '.\n\nThank you,\nSahare Properties';
        enqueueEmail_('RENT_AGREEMENT', room.email, 'Rent Agreement — Room ' + room.roomNo + ' — Sahare Properties', message, '<div style="font-family:Arial;white-space:pre-line">' + escapeHtml_(message) + '</div>', 'AGREEMENT', agreementId, [pdfFile.getId()]);
      }
      logAudit_('AGREEMENT_GENERATED', 'AGREEMENT', agreementId, { room: room.roomNo, tenant: room.tenantName, pdfFileId: pdfFile.getId() });
      return { duplicate: false, agreementId: agreementId, pdfUrl: pdfFile.getUrl(), googleDocId: docCopy.getId() };
    } catch (error) {
      // Clean up only files created by this invocation, and only if no register row committed.
      if (!registered) {
        try { if (pdfFile) pdfFile.setTrashed(true); } catch (cleanupPdfError) { Logger.log('PDF cleanup failed: ' + cleanupPdfError.message); }
        try { if (docCopy) docCopy.setTrashed(true); } catch (cleanupDocError) { Logger.log('Google Doc cleanup failed: ' + cleanupDocError.message); }
      }
      throw error;
    } finally {
      lock.releaseLock();
    }
  });
}

function findAgreementByKey_(sheet, key) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  var values = sheet.getDataRange().getValues();
  var cols = getColumnMap(values[0]);
  for (var i = 1; i < values.length; i++) {
    var room = normalizeRoom_(valueByAliases_(values[i], cols, ['RoomNo']));
    var tenantId = String(valueByAliases_(values[i], cols, ['TenantID']) || '');
    var start = toDateSafe_(valueByAliases_(values[i], cols, ['StartDate']));
    if (!start) continue;
    var candidate = room + '|' + tenantId + '|' + Utilities.formatDate(start, V7.TIMEZONE, 'yyyy-MM-dd');
    if (candidate === key) return {
      agreementId: valueByAliases_(values[i], cols, ['AgreementID']),
      pdfUrl: valueByAliases_(values[i], cols, ['PdfURL'])
    };
  }
  return null;
}

function escapeRegex_(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function safeFileName_(value) { return String(value || 'Tenant').replace(/[\\/:*?"<>|#%{}]/g, '').replace(/\s+/g, '_').slice(0, 80); }

/* ==========================================================================
 * MODULE: 11_MigrationService.gs
 * ========================================================================== */

/**
 * Append-only migration. Dry run writes only Migration Preview; apply is blocked unless
 * MIGRATION_APPROVED=YES and the administrator confirms the dialog.
 */
function runMigrationDryRun() {
  return withSystemErrorHandling_('runMigrationDryRun', {}, function () {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var runId = makeId_('MIG');
    var preview = ss.getSheetByName(V7.SHEETS.MIGRATION);
    if (!preview) throw new Error('Migration Preview sheet missing. Run setupV7Structure first.');
    var plan = buildMigrationPlan_(ss, runId);
    if (!plan.length) throw new Error('No legacy records were found to preview.');
    var rows = plan.map(function (item) {
      return [runId, item.entityType, item.targetSheet, item.recordId, item.sourceSheet, item.sourceRow, item.period || '', 'READY', item.warnings || '', JSON.stringify(item.payload), new Date(), ''];
    });
    preview.getRange(preview.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    setConfigValue_('LAST_MIGRATION_RUN_ID', runId);
    logAudit_('MIGRATION_DRY_RUN_CREATED', 'MIGRATION', runId, { plannedRows: rows.length, entityCounts: countBy_(plan, 'entityType') });
    SpreadsheetApp.getUi().alert('Migration dry run तयार झाला.\nRun ID: ' + runId + '\nPreview rows: ' + rows.length + '\n\nMigration Preview sheet तपासा. या टप्प्यावर जुन्या किंवा नवीन Ledger मधील कोणताही आर्थिक डेटा बदललेला नाही.');
    return { runId: runId, plannedRows: rows.length, counts: countBy_(plan, 'entityType') };
  });
}

function buildMigrationPlan_(ss, runId) {
  var plan = [];
  var seenReceiptRefs = {};
  var overrides = getMigrationOverrides_();
  var tenantSheet = ss.getSheetByName('Tenant Master');
  if (tenantSheet && tenantSheet.getLastRow() >= 2) {
    var tenantData = tenantSheet.getDataRange().getValues();
    var tenantCols = getColumnMap(tenantData[0]);
    tenantData.slice(1).forEach(function (row, index) {
      var sourceRow = index + 2;
      var room = normalizeRoom_(valueByAliases_(row, tenantCols, ['Room No', 'Room Number']));
      var name = String(valueByAliases_(row, tenantCols, ['Tenant Name', 'Name']) || '').trim();
      var tenantNameOverride = overrides['CURRENT_TENANT_NAME|' + room + '|2026-11'];
      if (tenantNameOverride && tenantNameOverride.active) name = String(tenantNameOverride.value).trim();
      if (!room || room === 'TOTAL' || !name) return;
      var mobile = String(valueByAliases_(row, tenantCols, ['Mobile Number', 'Mobile']) || '').replace(/\D/g, '');
      var tenantId = 'TEN-' + room + '-' + (mobile.slice(-4) || '0000');
      var startDate = toDateSafe_(valueByAliases_(row, tenantCols, ['Agreement Start Date', 'Start Date']));
      var endDate = toDateSafe_(valueByAliases_(row, tenantCols, ['Agreement End Date (11 Months)', 'Agreement End Date', 'End Date']));
      var status = String(valueByAliases_(row, tenantCols, ['Renewal Status / Alert', 'Status']) || 'ACTIVE').toUpperCase();
      var meter = String(valueByAliases_(row, tenantCols, ['Meter Number', 'Meter No']) || '').trim();
      var roomPayload = {
        RoomNo: room, MeterNo: meter,
        BaseRent: roundMoney_(valueByAliases_(row, tenantCols, ['Base Monthly Rent', 'Base Rent', 'Rent'])),
        ElectricityRate: roundMoney_(valueByAliases_(row, tenantCols, ['Electricity Rate']) || getConfigValue_('DEFAULT_ELECTRICITY_RATE', '13.50')),
        OccupancyStatus: /ACTIVE|OCCUPIED/i.test(status) ? 'ACTIVE' : status,
        CurrentTenantID: tenantId, CurrentTenantName: name, CurrentTenantMobile: mobile,
        CurrentTenantEmail: String(valueByAliases_(row, tenantCols, ['Tenant Email', 'Email']) || '').trim(),
        UpdatedAt: new Date(),
        SecurityDeposit: roundMoney_(valueByAliases_(row, tenantCols, ['Total Deposit', 'Security Deposit'])),
        DepositMode: String(valueByAliases_(row, tenantCols, ['Deposit Payment Mode', 'Deposit Mode']) || ''),
        DepositDate: valueByAliases_(row, tenantCols, ['Deposit Date']) || '',
        AgreementStartDate: startDate || '', AgreementEndDate: endDate || '',
        Notes: String(valueByAliases_(row, tenantCols, ['Remarks / Shifting History', 'Remarks', 'Notes']) || '')
      };
      plan.push(makePlanItem_('ROOM_MASTER', V7.SHEETS.ROOM_MASTER, room, 'Tenant Master', sourceRow, '', roomPayload, 'Current occupancy snapshot; legacy row is retained.'));
      var historyPayload = {
        TenantID: tenantId, TenantName: name, Mobile: mobile,
        Email: roomPayload.CurrentTenantEmail, RoomNo: room,
        MoveInDate: startDate || '', MoveOutDate: '', Status: 'CURRENT',
        Source: 'Tenant Master legacy snapshot', Notes: roomPayload.Notes, CreatedAt: new Date()
      };
      plan.push(makePlanItem_('TENANT_HISTORY', V7.SHEETS.TENANT_HISTORY, tenantId, 'Tenant Master', sourceRow, '', historyPayload, 'One current-state snapshot only; prior movements are not inferred.'));
    });
  }

  var roomMasterRows = plan.filter(function (item) { return item.entityType === 'ROOM_MASTER'; });
  var roomToTenant = {};
  roomMasterRows.forEach(function (item) { roomToTenant[item.payload.RoomNo] = item.payload; });
  Object.keys(roomToTenant).forEach(function (roomNo) {
    var roomSheet = ss.getSheetByName(roomNo);
    if (!roomSheet || roomSheet.getLastRow() < 2) return;
    var data = roomSheet.getDataRange().getValues();
    var cols = getColumnMap(data[0]);
    var headerYear = toNumber_(data[0][0], 0);
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var month = valueByAliases_(row, cols, ['Month']);
      if (!month) continue;
      var firstCellYear = toNumber_(row[0], 0);
      var year = firstCellYear >= 2000 && firstCellYear <= 2100 ? firstCellYear : (headerYear >= 2000 && headerYear <= 2100 ? headerYear : 0);
      if (!year) continue;
      var period = periodKey_(year, month);
      var baseRent = roundMoney_(valueByAliases_(row, cols, ['Rent', 'Base Rent']));
      var totalRaw = valueByAliases_(row, cols, ['Total Rent', 'Total Amount']);
      var total = totalRaw === '' || totalRaw === null ? '' : roundMoney_(totalRaw);
      var electricRaw = valueByAliases_(row, cols, ['Electric Bill', 'Electricity Amount']);
      var electric = electricRaw === '' || electricRaw === null ? '' : roundMoney_(electricRaw);
      var reading = valueByAliases_(row, cols, ['Reading', 'Current Reading']);
      var units = valueByAliases_(row, cols, ['Unit Consumed', 'Units Consumed']);
      var rate = toNumber_(valueByAliases_(row, cols, ['Elc. Rate', 'Electricity Rate']), toNumber_(roomToTenant[roomNo].ElectricityRate));
      var paidRaw = valueByAliases_(row, cols, ['Amount Paid']);
      var paid = roundMoney_(paidRaw);
      var paymentOverride = overrides['PAYMENT_FINAL_VALUE|' + roomNo + '|' + period];
      if (paymentOverride && paymentOverride.active) paid = roundMoney_(paymentOverride.value);
      var balanceRaw = valueByAliases_(row, cols, ['Balance Due']);
      var sourceRow = i + 1;
      var future = period > Utilities.formatDate(new Date(), V7.TIMEZONE, 'yyyy-MM');
      var billStatus = future ? 'PLANNED' : (total === '' ? 'LEGACY_INCOMPLETE' : 'LEGACY_IMPORTED');
      var billId = makeBillId_(roomNo, period);
      var billPayload = {
        BillID: billId, RoomNo: roomNo, TenantID: roomToTenant[roomNo].CurrentTenantID,
        BillingPeriod: period, BaseRent: baseRent,
        PreviousReading: '', CurrentReading: reading === '' ? '' : toNumber_(reading),
        UnitsConsumed: units === '' ? '' : roundMoney_(units), ElectricityRate: rate,
        ElectricityAmount: electric, TotalAmount: total,
        VerifiedPayments: 0, OutstandingAmount: total === '' ? '' : total,
        DueDate: dueDateForPeriod_(period, toNumber_(getConfigValue_('BILLING_DUE_DAY', '5'))),
        BillStatus: billStatus, ReconciliationStatus: 'LEGACY_NOT_RECONCILED',
        WhatsAppURL: '', UPIURL: '', UPIQRURL: '', CreatedAt: new Date(), Source: 'LEGACY_ROOM_TAB',
        SourceSheet: roomNo, SourceRow: sourceRow,
        Notes: String(valueByAliases_(row, cols, ['Remark', 'Remarks']) || '') + (balanceRaw !== '' ? ' | Legacy displayed balance: ' + balanceRaw : '')
      };
      if (total !== '' || baseRent > 0) {
        plan.push(makePlanItem_('BILLING_LEDGER', V7.SHEETS.BILLING, billId, roomNo, sourceRow, period, billPayload, total === '' ? 'No legacy Total Rent value; imported as incomplete, not billed.' : 'Historical bill imported without assuming payment verification.'));
      }
      if (reading !== '' && reading !== null && toNumber_(reading) >= 0) {
        var readingId = 'LEGACY-READ-' + roomNo + '-' + period;
        var meterPayload = {
          ReadingID: readingId, RoomNo: roomNo, MeterNo: roomToTenant[roomNo].MeterNo,
          BillingPeriod: period, ReadingValue: roundMoney_(reading), ReadingDate: '',
          PhotoReference: String(valueByAliases_(row, cols, ['Reading Photo']) || ''),
          IdempotencyKey: readingId, SourceType: 'LEGACY_ROOM_TAB', SourceSheet: roomNo,
          SourceRow: sourceRow, Notes: 'Canonical room-tab reading; individual Form Responses are not separately counted.', CreatedAt: new Date()
        };
        plan.push(makePlanItem_('METER_READING_LEDGER', V7.SHEETS.METERS, readingId, roomNo, sourceRow, period, meterPayload, 'Room tab selected as canonical reading source to prevent duplicate form submissions.'));
      }
      if (paid > 0) {
        var paymentId = 'LEGACY-PAY-' + roomNo + '-' + period;
        var receiptRef = String(valueByAliases_(row, cols, ['Payment Receipt Photo']) || '');
        var paymentPayload = {
          PaymentID: paymentId, BillID: billId, RoomNo: roomNo,
          TenantID: roomToTenant[roomNo].CurrentTenantID, BillingPeriod: period,
          Amount: paid, ReportedAt: '', PaymentMethod: 'LEGACY_RECORDED', ReferenceNumber: '',
          ReceiptURL: receiptRef, VerificationStatus: 'LEGACY_UNVERIFIED', VerifiedAt: '',
          VerifiedBy: '', IdempotencyKey: paymentId, SourceType: 'LEGACY_ROOM_TAB',
          SourceSheet: roomNo, SourceRow: sourceRow,
          Notes: roomNo === 'C2' && period === '2026-11' ? 'User-confirmed corrections: Form values 5500 -> 5683 -> 5683.60 are revisions of one transaction. Import final Room Tab value once; earlier form values are superseded evidence. Verification still required.' : 'Imported from legacy Amount Paid cell; not verified against bank/UPI evidence.'
        };
        plan.push(makePlanItem_('PAYMENT_LEDGER', V7.SHEETS.PAYMENTS, paymentId, roomNo, sourceRow, period, paymentPayload, 'Imported as LEGACY_UNVERIFIED; does not reduce confirmed outstanding until manually verified.'));
        if (receiptRef) {
          var refs = receiptRef.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
          refs.forEach(function (ref, refIndex) {
            var receiptKey = roomNo + '|' + period + '|PAYMENT_RECEIPT|' + ref;
            if (seenReceiptRefs[receiptKey]) return;
            seenReceiptRefs[receiptKey] = true;
            var receiptId = 'LEGACY-REC-' + roomNo + '-' + period + '-' + (refIndex + 1);
            var receiptPayload = {
              ReceiptID: receiptId, RoomNo: roomNo, TenantID: roomToTenant[roomNo].CurrentTenantID,
              BillingPeriod: period, PaymentID: paymentId, ReceiptType: 'PAYMENT_RECEIPT',
              FileReference: ref, SourceSheet: roomNo, SourceRow: sourceRow,
              AccessStatus: 'LEGACY_PERMISSION_NOT_VERIFIED', IdempotencyKey: receiptId, CreatedAt: new Date(),
              Notes: 'Original sharing permissions were not changed during migration.'
            };
            plan.push(makePlanItem_('RECEIPT_REGISTER', V7.SHEETS.RECEIPTS, receiptId, roomNo, sourceRow, period, receiptPayload, 'Check Drive permissions separately; no public sharing is created.'));
          });
        }
      }
    }
  });

  // Preserve Form-uploaded photo/receipt references without importing form amounts as separate payments.
  if (formSheet && formSheet.getLastRow() >= 2) {
    var formValues = formSheet.getDataRange().getValues();
    var formHeaders = getColumnMap(formValues[0]);
    for (var fr = 1; fr < formValues.length; fr++) {
      var formRow = formValues[fr];
      var formRoom = parseRoomChoice_(valueByAliases_(formRow, formHeaders, ['Select Room Number', 'Room Number']));
      var formMonth = valueByAliases_(formRow, formHeaders, ['Select Month', 'Month']);
      if (!formRoom || !formMonth || !roomToTenant[formRoom]) continue;
      var formTimestamp = toDateSafe_(valueByAliases_(formRow, formHeaders, ['Timestamp'])) || new Date();
      var formPeriod = resolveFormPeriod_(formMonth, formTimestamp);
      var meterPhoto = String(valueByAliases_(formRow, formHeaders, ['Meter Reading Photo', 'Reading Photo']) || '').trim();
      var payPhoto = String(valueByAliases_(formRow, formHeaders, ['Payment Receipt Photo / Screenshot', 'Payment Receipt Photo', 'Receipt Photo']) || '').trim();
      var legacyPaymentId = 'LEGACY-PAY-' + formRoom + '-' + formPeriod;
      if (meterPhoto) {
        var meterPhotoKey = formRoom + '|' + formPeriod + '|METER_PHOTO|' + meterPhoto;
        if (!seenReceiptRefs[meterPhotoKey]) {
          seenReceiptRefs[meterPhotoKey] = true;
          var meterReceiptId = 'LEGACY-FORM-METER-PHOTO-' + formRoom + '-' + formPeriod + '-' + (fr + 1);
          var meterReceiptPayload = {
            ReceiptID: meterReceiptId, RoomNo: formRoom, TenantID: roomToTenant[formRoom].CurrentTenantID,
            BillingPeriod: formPeriod, PaymentID: '', ReceiptType: 'METER_PHOTO',
            FileReference: meterPhoto, SourceSheet: formSheet.getName(), SourceRow: fr + 1,
            AccessStatus: 'LEGACY_PERMISSION_NOT_VERIFIED', IdempotencyKey: meterReceiptId,
            CreatedAt: formTimestamp, Notes: 'Form upload reference retained as evidence; canonical meter value comes from the room tab.'
          };
          plan.push(makePlanItem_('RECEIPT_REGISTER', V7.SHEETS.RECEIPTS, meterReceiptId, formSheet.getName(), fr + 1, formPeriod, meterReceiptPayload, 'Original Drive permissions were not changed.'));
        }
      }
      if (payPhoto) {
        var payPhotoKey = formRoom + '|' + formPeriod + '|PAYMENT_RECEIPT|' + payPhoto;
        if (!seenReceiptRefs[payPhotoKey]) {
          seenReceiptRefs[payPhotoKey] = true;
          var payReceiptId = 'LEGACY-FORM-PAY-RECEIPT-' + formRoom + '-' + formPeriod + '-' + (fr + 1);
          var payReceiptPayload = {
            ReceiptID: payReceiptId, RoomNo: formRoom, TenantID: roomToTenant[formRoom].CurrentTenantID,
            BillingPeriod: formPeriod, PaymentID: legacyPaymentId, ReceiptType: 'PAYMENT_RECEIPT',
            FileReference: payPhoto, SourceSheet: formSheet.getName(), SourceRow: fr + 1,
            AccessStatus: 'LEGACY_PERMISSION_NOT_VERIFIED', IdempotencyKey: payReceiptId,
            CreatedAt: formTimestamp,
            Notes: formRoom === 'C2' && formPeriod === '2026-11' ? 'Receipt evidence attached to one corrected C2 transaction; Form amount revisions are not separate payments.' : 'Form-uploaded payment receipt retained as evidence; not counted as a separate payment.'
          };
          plan.push(makePlanItem_('RECEIPT_REGISTER', V7.SHEETS.RECEIPTS, payReceiptId, formSheet.getName(), fr + 1, formPeriod, payReceiptPayload, 'Original Drive permissions were not changed.'));
        }
      }
    }
  }

  // Explicit audit note for the user-confirmed C2 November correction chain.
  var c2PaymentRows = [];
  var formSheet = ss.getSheetByName('Form Responses');
  if (formSheet && formSheet.getLastRow() >= 2) {
    var fdata = formSheet.getDataRange().getValues();
    var fcols = getColumnMap(fdata[0]);
    for (var f = 1; f < fdata.length; f++) {
      var froom = parseRoomChoice_(valueByAliases_(fdata[f], fcols, ['Select Room Number', 'Room Number']));
      var fmonth = valueByAliases_(fdata[f], fcols, ['Select Month', 'Month']);
      var ftime = toDateSafe_(valueByAliases_(fdata[f], fcols, ['Timestamp'])) || new Date();
      if (!froom || !fmonth) continue;
      var fperiod = resolveFormPeriod_(fmonth, ftime);
      var famount = toNumber_(valueByAliases_(fdata[f], fcols, ['Rent Amount Paid (Rs)', 'Amount Paid']));
      if (froom === 'C2' && fperiod === '2026-11' && famount > 0) c2PaymentRows.push({ row: f + 1, amount: roundMoney_(famount) });
    }
  }
  if (c2PaymentRows.length || overrides['PAYMENT_FINAL_VALUE|C2|2026-11']) {
    var c2Override = overrides['PAYMENT_FINAL_VALUE|C2|2026-11'];
    var auditId = 'MIGRATION-NOTE-C2-2026-11';
    var finalValue = c2Override ? roundMoney_(c2Override.value) : 0;
    var relatedAmounts = c2Override && c2Override.relatedValues ? String(c2Override.relatedValues).split('|').map(function (x) { return roundMoney_(x); }) : c2PaymentRows.map(function (x) { return x.amount; });
    var details = {
      userConfirmed: true, correctionAmounts: relatedAmounts, formResponseRows: c2PaymentRows,
      finalAmount: finalValue, action: 'Import one Payment Ledger row from canonical Room Tab value / override; do not add each Form Response as a separate payment.',
      supersededSourceRows: c2PaymentRows.filter(function (x) { return roundMoney_(x.amount) !== finalValue; }).map(function (x) { return x.row; })
    };
    var auditPayload = { LogID: auditId, Timestamp: new Date(), Actor: getActor_(), Action: 'C2_PAYMENT_CORRECTION_RECONCILIATION', EntityType: 'PAYMENT', EntityID: 'LEGACY-PAY-C2-2026-11', DetailsJSON: JSON.stringify(details), Source: 'User-confirmed migration rule' };
    plan.push(makePlanItem_('AUDIT_LOG', V7.SHEETS.AUDIT, auditId, 'Form Responses', '', '2026-11', auditPayload, 'Captures the superseded form amounts without double-counting them.'));
  }
  return plan;
}

function makePlanItem_(entityType, targetSheet, recordId, sourceSheet, sourceRow, period, payload, warnings) {
  return { entityType: entityType, targetSheet: targetSheet, recordId: recordId, sourceSheet: sourceSheet, sourceRow: sourceRow, period: period, payload: payload, warnings: warnings || '' };
}

function applyMigrationPreview() {
  return withSystemErrorHandling_('applyMigrationPreview', {}, function () {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Migration is already running.');
    try {
    if (String(getConfigValue_('MIGRATION_APPROVED', 'NO')).toUpperCase() !== 'YES') {
      throw new Error('Migration blocked. Review Migration Preview, then set System Config → MIGRATION_APPROVED to YES.');
    }
    var ui = SpreadsheetApp.getUi();
    var runId = String(getConfigValue_('LAST_MIGRATION_RUN_ID', '')).trim();
    if (!runId) throw new Error('LAST_MIGRATION_RUN_ID is blank. Run migration dry run first.');
    var answer = ui.alert('Apply append-only migration?', 'Run: ' + runId + '\nOnly READY rows from this preview run will be appended. Existing rows will not be overwritten or deleted. Continue?', ui.ButtonSet.YES_NO);
    if (answer !== ui.Button.YES) return { applied: 0, cancelled: true };
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var preview = ss.getSheetByName(V7.SHEETS.MIGRATION);
    var dataRange = preview.getDataRange();
    var data = dataRange.getValues();
    var cols = getColumnMap(data[0]);
    var byTarget = {};
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(valueByAliases_(row, cols, ['RunID'])) !== runId) continue;
      if (String(valueByAliases_(row, cols, ['PreviewStatus'])).toUpperCase() !== 'READY') continue;
      var target = String(valueByAliases_(row, cols, ['TargetSheet']));
      if (!V7.SCHEMAS[target]) throw new Error('Unrecognized migration target: ' + target);
      if (!byTarget[target]) byTarget[target] = [];
      byTarget[target].push({ recordId: String(valueByAliases_(row, cols, ['RecordID'])), payload: JSON.parse(String(valueByAliases_(row, cols, ['PayloadJSON']))), previewIndex: i });
    }
    var applied = 0;
    Object.keys(byTarget).forEach(function (target) {
      var sheet = ss.getSheetByName(target);
      if (!sheet) throw new Error('Target sheet missing: ' + target + '. Run setupV7Structure.');
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      getColumnMap(headers); // Validate destination headers before writing.
      var existingIds = {};
      if (sheet.getLastRow() >= 2) sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().forEach(function (r) { existingIds[String(r[0])] = true; });
      var toAppend = [];
      byTarget[target].forEach(function (item) {
        if (existingIds[item.recordId]) {
          data[item.previewIndex][cols[normalizeHeader_('PreviewStatus')] - 1] = 'ALREADY_PRESENT';
          return;
        }
        var payload = revivePayloadDates_(item.payload);
        var output = headers.map(function (header) {
          var key = header;
          return Object.prototype.hasOwnProperty.call(payload, key) ? payload[key] : '';
        });
        toAppend.push(output);
        existingIds[item.recordId] = true;
        data[item.previewIndex][cols[normalizeHeader_('PreviewStatus')] - 1] = 'APPLIED';
        data[item.previewIndex][cols[normalizeHeader_('AppliedAt')] - 1] = new Date();
        applied++;
      });
      if (toAppend.length) sheet.getRange(sheet.getLastRow() + 1, 1, toAppend.length, headers.length).setValues(toAppend);
    });
    // Write preview status updates in one batch; legacy sheets are untouched.
    dataRange.setValues(data);
    setConfigValue_('MIGRATION_APPROVED', 'NO');
    logAudit_('MIGRATION_APPLIED', 'MIGRATION', runId, { applied: applied, targets: Object.keys(byTarget) });
    refreshV7Dashboard();
    ui.alert('Migration completed.\nRows appended: ' + applied + '\nLegacy source sheets were not edited or deleted.\nNext: verify totals and manually reconcile LEGACY_UNVERIFIED payments.');
    return { applied: applied, targets: Object.keys(byTarget) };
    } finally {
      lock.releaseLock();
    }
  });
}

function countBy_(items, key) {
  var result = {};
  items.forEach(function (item) { result[item[key]] = (result[item[key]] || 0) + 1; });
  return result;
}

function revivePayloadDates_(payload) {
  var result = {};
  Object.keys(payload || {}).forEach(function (key) {
    var value = payload[key];
    if (typeof value === 'string' && /(?:Date|At)$/.test(key) && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      var date = new Date(value);
      result[key] = isNaN(date.getTime()) ? value : date;
    } else {
      result[key] = value;
    }
  });
  return result;
}

function getMigrationOverrides_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.OVERRIDES);
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  var result = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(valueByAliases_(row, cols, ['Active'])).toUpperCase() !== 'YES') continue;
    var type = String(valueByAliases_(row, cols, ['OverrideType'])).trim();
    var room = normalizeRoom_(valueByAliases_(row, cols, ['RoomNo']));
    var period = String(valueByAliases_(row, cols, ['BillingPeriod']) || '');
    if (!type || !room || !period) continue;
    result[type + '|' + room + '|' + period] = {
      value: valueByAliases_(row, cols, ['OverrideValue']),
      relatedValues: valueByAliases_(row, cols, ['RelatedValues']),
      notes: valueByAliases_(row, cols, ['Notes']),
      active: true
    };
  }
  return result;
}

/* ==========================================================================
 * MODULE: 12_DashboardService.gs
 * ========================================================================== */

/** Read-only V7 dashboard. Legacy Dashboard remains untouched. */
function refreshV7Dashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName(V7.SHEETS.DASHBOARD);
  if (!dash) throw new Error('V7 Dashboard sheet missing. Run setupV7Structure first.');
  var period = Utilities.formatDate(new Date(), V7.TIMEZONE, 'yyyy-MM');
  var billing = readSheetObjects_(V7.SHEETS.BILLING);
  var payments = readSheetObjects_(V7.SHEETS.PAYMENTS);
  var rooms = getRoomMasterMap_();
  var currentBills = billing.filter(function (b) { return String(b.BillingPeriod) === period; });
  var currentBillIds = {};
  var billed = 0;
  var verified = 0;
  var outstanding = 0;
  currentBills.forEach(function (b) {
    currentBillIds[String(b.BillID)] = true;
    if (b.TotalAmount !== '' && b.TotalAmount !== null) billed += toNumber_(b.TotalAmount);
    outstanding += toNumber_(b.OutstandingAmount);
  });
  var unverified = 0;
  payments.forEach(function (p) {
    if (!currentBillIds[String(p.BillID)]) return;
    var amount = toNumber_(p.Amount);
    if (String(p.VerificationStatus).toUpperCase() === 'VERIFIED') verified += amount;
    else unverified += amount;
  });
  var detailRows = currentBills.map(function (b) {
    var room = rooms[normalizeRoom_(b.RoomNo)] || {};
    var roomPayments = payments.filter(function (p) { return String(p.BillID) === String(b.BillID); });
    var confirmed = roomPayments.filter(function (p) { return String(p.VerificationStatus).toUpperCase() === 'VERIFIED'; }).reduce(function (sum, p) { return sum + toNumber_(p.Amount); }, 0);
    var pending = roomPayments.filter(function (p) { return String(p.VerificationStatus).toUpperCase() !== 'VERIFIED'; }).reduce(function (sum, p) { return sum + toNumber_(p.Amount); }, 0);
    return [b.RoomNo, room.tenantName || '', b.BillingPeriod, b.TotalAmount, roundMoney_(confirmed), roundMoney_(pending), b.OutstandingAmount, b.BillStatus];
  });
  dash.getRange('A4:B8').setValues([
    ['Current Period', period],
    ['Total Billed', roundMoney_(billed)],
    ['Verified Received', roundMoney_(verified)],
    ['Reported / Unverified', roundMoney_(unverified)],
    ['Outstanding (against verified payments)', roundMoney_(outstanding)]
  ]);
  var activeRooms = Object.keys(rooms).filter(function (key) { return rooms[key].occupancyStatus === 'ACTIVE' || rooms[key].occupancyStatus === 'OCCUPIED'; }).length;
  dash.getRange('D3:E5').setValues([
    ['Occupied Rooms', activeRooms],
    ['Room Records', Object.keys(rooms).length],
    ['Dashboard Refreshed', new Date()]
  ]);
  var oldRows = Math.max(0, dash.getLastRow() - 10);
  if (oldRows) dash.getRange(11, 1, oldRows, 8).clearContent();
  if (detailRows.length) dash.getRange(11, 1, detailRows.length, 8).setValues(detailRows);
  dash.getRange('A3:B8').setFontWeight('bold');
  dash.getRange('A10:H10').setFontWeight('bold');
  dash.getRange('B5:B8').setNumberFormat('₹#,##0.00');
  dash.getRange('D5:E5').setNumberFormat('dd-mmm-yyyy hh:mm');
  dash.autoResizeColumns(1, 8);
  return { period: period, bills: currentBills.length, billed: roundMoney_(billed), verified: roundMoney_(verified), unverified: roundMoney_(unverified), outstanding: roundMoney_(outstanding), occupiedRooms: activeRooms };
}

function readSheetObjects_(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function (h) { return String(h); });
  return data.slice(1).map(function (row) {
    var item = {};
    headers.forEach(function (header, index) { item[header] = row[index]; });
    return item;
  });
}

/* ==========================================================================
 * MODULE: 13_TriggerService.gs
 * ========================================================================== */

/** Trigger creation is opt-in and does not remove or modify existing v6.1 triggers. */
function installV7Triggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var existingHandlers = {};
  triggers.forEach(function (trigger) { existingHandlers[trigger.getHandlerFunction()] = true; });
  var created = [];
  if (!existingHandlers.v7_onFormSubmit) {
    ScriptApp.newTrigger('v7_onFormSubmit').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onFormSubmit().create();
    created.push('v7_onFormSubmit');
  }
  if (!existingHandlers.processNotificationQueue) {
    ScriptApp.newTrigger('processNotificationQueue').timeBased().everyMinutes(10).create();
    created.push('processNotificationQueue');
  }
  if (!existingHandlers.v7_dailyMaintenance) {
    ScriptApp.newTrigger('v7_dailyMaintenance').timeBased().everyDays(1).atHour(9).create();
    created.push('v7_dailyMaintenance');
  }
  logAudit_('V7_TRIGGERS_INSTALLED', 'SYSTEM', V7.VERSION, { created: created, note: 'Existing v6 triggers were not removed.' });
  SpreadsheetApp.getUi().alert('v7 triggers ready: ' + (created.length ? created.join(', ') : 'all already existed') + '\n\nGo-live पूर्वी जुन्या v6.1 onFormSubmit आणि monthly-report triggers निष्क्रिय करायचे आहेत. ते आपोआप हटवलेले नाहीत.');
}

function v7_dailyMaintenance() {
  return withSystemErrorHandling_('v7_dailyMaintenance', {}, function () {
    var summary = refreshV7Dashboard();
    var renewalSummary = enqueueAgreementRenewalReminders_();
    if (String(getConfigValue_('AUTO_CREATE_MONTHLY_BILLS', 'NO')).toUpperCase() === 'YES') {
      // Default is OFF; enabling this flag allows idempotent current-month bill creation after readings exist.
      var period = Utilities.formatDate(new Date(), V7.TIMEZONE, 'yyyy-MM');
      createMonthlyBills(period, { silent: true });
    }
    summary.renewalRemindersQueued = renewalSummary.queued;
    return summary;
  });
}

/** Queues one renewal reminder per room/tenant/expiry date within the configured window. */
function enqueueAgreementRenewalReminders_() {
  var rooms = getRoomMasterMap_();
  var windowDays = Math.max(1, Math.min(120, toNumber_(getConfigValue_('RENEWAL_REMINDER_DAYS', '30'), 30)));
  var today = new Date();
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var queued = 0;
  Object.keys(rooms).forEach(function (roomNo) {
    var room = rooms[roomNo];
    if (room.occupancyStatus !== 'ACTIVE' && room.occupancyStatus !== 'OCCUPIED') return;
    if (!room.email) return;
    var expiry = toDateSafe_(room.agreementEndDate);
    if (!expiry) return;
    var expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    var daysLeft = Math.floor((expiryDay.getTime() - today.getTime()) / 86400000);
    if (daysLeft < 0 || daysLeft > windowDays) return;
    var expiryText = Utilities.formatDate(expiryDay, V7.TIMEZONE, 'dd MMM yyyy');
    var referenceId = roomNo + '|' + room.tenantId + '|' + Utilities.formatDate(expiryDay, V7.TIMEZONE, 'yyyy-MM-dd') + '|' + windowDays;
    var subject = 'Rent Agreement Renewal Reminder — Room ' + roomNo;
    var message = 'Hello ' + room.tenantName + ',\n\nYour rent agreement for Room ' + roomNo + ' is scheduled to expire on ' + expiryText + '. Please contact Sahare Properties to discuss renewal.\n\nThank you,\nSahare Properties';
    if (findNotificationByReference_('AGREEMENT_RENEWAL', room.email, 'AGREEMENT_RENEWAL', referenceId)) return;
    enqueueEmail_('AGREEMENT_RENEWAL', room.email, subject, message, '<div style="font-family:Arial;white-space:pre-line">' + escapeHtml_(message) + '</div>', 'AGREEMENT_RENEWAL', referenceId, []);
    queued++;
  });
  if (queued) logAudit_('AGREEMENT_RENEWAL_REMINDERS_QUEUED', 'SYSTEM', new Date().toISOString(), { queued: queued, windowDays: windowDays });
  return { queued: queued, windowDays: windowDays };
}
