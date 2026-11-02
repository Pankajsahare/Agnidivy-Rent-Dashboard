const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'src', '01_Utilities.gs'), 'utf8');
const sandbox = { Number, Math, Date, String, Object, Array, encodeURIComponent, isNaN, parseInt, parseFloat };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

test('getColumnMap normalizes whitespace and case', () => {
  const map = sandbox.getColumnMap(['Room No', 'Month ', ' AMOUNT   PAID ']);
  assert.equal(map['room no'], 1);
  assert.equal(map['month'], 2);
  assert.equal(map['amount paid'], 3);
});

test('getColumnMap rejects duplicate normalized headers', () => {
  assert.throws(() => sandbox.getColumnMap(['Room No', ' room   no ']), /Duplicate column headers/);
});

test('monthNumber accepts English month names and numbers', () => {
  assert.equal(sandbox.monthNumber_('November'), 11);
  assert.equal(sandbox.monthNumber_('Nov'), 11);
  assert.equal(sandbox.monthNumber_(12), 12);
});

test('periodKey produces canonical YYYY-MM', () => {
  assert.equal(sandbox.periodKey_(2026, 'November'), '2026-11');
  assert.equal(sandbox.parsePeriodInput_('2026/2'), '2026-02');
});

test('roundMoney preserves paise without floating point noise', () => {
  assert.equal(sandbox.roundMoney_(5683.599999999), 5683.60);
  assert.equal(sandbox.roundMoney_(13.5 * 13.6), 183.60);
});

test('normalizeRoom trims and uppercases room labels', () => {
  assert.equal(sandbox.normalizeRoom_(' b2 '), 'B2');
});


test('billing message uses one consistent source for amounts and balance', () => {
  const message = sandbox.buildBillingMessage({
    tenantName: 'Tenant', period: '2026-11', baseRent: 5500,
    electricityAmount: 183.6, totalAmount: 5683.6,
    verifiedPayments: 0, outstandingAmount: 5683.6,
    upiLink: 'upi://pay?am=5683.60'
  });
  assert.match(message, /Base Rent: Rs\. 5500\.00/);
  assert.match(message, /Total Bill: Rs\. 5683\.60/);
  assert.match(message, /Balance Due: Rs\. 5683\.60/);
});

test('WhatsApp link encodes the shared billing message and normalizes Indian mobile', () => {
  const url = sandbox.buildWhatsAppUrl_('9405908605', 'Rent & electricity');
  assert.match(url, /^https:\/\/wa\.me\/919405908605\?text=/);
  assert.ok(url.includes(encodeURIComponent('Rent & electricity')));
});


test('parseRoomChoice extracts room from legacy Form choice labels', () => {
  assert.equal(sandbox.parseRoomChoice_('B2 - Aifaz (Meter: J0044)'), 'B2');
  assert.equal(sandbox.parseRoomChoice_('C2'), 'C2');
  assert.equal(sandbox.parseRoomChoice_(' c2 - Tiwari Sir '), 'C2');
});

test('addMonthsClamped is compatible with end-of-month date arithmetic', () => {
  const date = new Date(2026, 0, 31);
  const result = sandbox.addMonthsClamped_(date, 1);
  assert.equal(result.getFullYear(), 2026);
  assert.equal(result.getMonth(), 1);
  assert.equal(result.getDate(), 28);
});


test('reconciliationStatus distinguishes incomplete, paid, partial, and overpaid', () => {
  assert.equal(sandbox.reconciliationStatus_('', 100), 'LEGACY_INCOMPLETE');
  assert.equal(sandbox.reconciliationStatus_(100, 0), 'NOT_YET_VERIFIED');
  assert.equal(sandbox.reconciliationStatus_(100, 50), 'RECONCILED_PARTIAL_OR_DUE');
  assert.equal(sandbox.reconciliationStatus_(100, 100), 'RECONCILED_PAID');
  assert.equal(sandbox.reconciliationStatus_(100, 125), 'OVERPAID_REVIEW');
});


test('buildPeriodChoiceList returns canonical periods across year boundaries', () => {
  const result = sandbox.buildPeriodChoiceList_(new Date(2026, 0, 15), 1, 2);
  assert.deepEqual(Array.from(result), ['2025-12', '2026-01', '2026-02', '2026-03']);
});
