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
