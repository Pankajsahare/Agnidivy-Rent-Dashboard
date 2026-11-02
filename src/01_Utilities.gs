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
