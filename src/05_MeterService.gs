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
