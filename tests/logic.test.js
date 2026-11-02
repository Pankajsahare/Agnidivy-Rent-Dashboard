const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'src', '01_Utilities.gs'), 'utf8');
const agreementSource = fs.readFileSync(path.join(__dirname, '..', 'src', '10_AgreementService.gs'), 'utf8');
const sandbox = { Number, Math, Date, String, Object, Array, encodeURIComponent, isNaN, parseInt, parseFloat };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
vm.runInContext(agreementSource, sandbox);

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


test('migration override periods normalize Google Sheets Date and serial values', () => {
  const sandbox = {
    Number, Math, Date, String, Object, Array, encodeURIComponent, isNaN, parseInt, parseFloat,
    Utilities: { formatDate: (date, timezone, pattern) => {
      assert.equal(timezone, 'Asia/Kolkata');
      assert.equal(pattern, 'yyyy-MM');
      return String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0');
    }},
    V7: { TIMEZONE: 'Asia/Kolkata' }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  const migration = fs.readFileSync(path.join(__dirname, '..', 'src', '11_MigrationService.gs'), 'utf8');
  vm.runInContext(migration, sandbox);
  assert.equal(sandbox.normalizeMigrationPeriod_(new Date(2026, 10, 1)), '2026-11');
  assert.equal(sandbox.normalizeMigrationPeriod_(new Date(Date.UTC(2026, 10, 1))), '2026-11');
  assert.equal(sandbox.normalizeMigrationPeriod_('2026-11'), '2026-11');
  assert.equal(sandbox.normalizeMigrationPeriod_('2026/11'), '2026-11');
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


test('v6.1 agreement model preserves the original 2-page structure and eight clauses', () => {
  const model = sandbox.buildV61AgreementModel_({
    roomNo: 'B2', tenantName: 'Aifaz', mobile: '9999999999', meterNo: 'J0044',
    email: 'tenant@example.com', baseRent: 3200, electricityRate: 13.5,
    deposit: 5000, rentDeposit: 3500, electricityDeposit: 1500,
    depositMode: 'UPI', depositDate: new Date(2026, 5, 1)
  }, {
    startDateText: '01-06-2026', endDateText: '30-04-2027',
    depositDateText: '01-06-2026', creationDate: '02 November 2026',
    months: 11, upiId: '9405908605@ybi', ownerMobile: '9405908605'
  });
  assert.equal(model.roomNo, 'B2');
  assert.equal(model.tenantName, 'Aifaz');
  assert.equal(model.termsList.length, 8);
  assert.match(model.partiesData[1][1], /Room No. B2/);
  assert.match(model.propertyData[3][1], /Rs. 3200.00/);
  assert.match(model.periodData[1][1], /Rent Deposit: Rs. 3500.00/);
  assert.match(model.periodData[1][1], /Electricity Bill Deposit: Rs. 1500.00/);
  assert.match(model.witnessText, /02 November 2026/);
  assert.match(model.signatureData[1][1], /Aifaz/);
});

test('v6.1 agreement model uses explicit fallback when deposit split is unavailable', () => {
  const model = sandbox.buildV61AgreementModel_({
    roomNo: 'C2', tenantName: 'Tenant C2', baseRent: 5000, electricityRate: 13.5,
    deposit: 10000, rentDeposit: '', electricityDeposit: '', mobile: '', meterNo: ''
  }, { startDateText: '01-11-2026', endDateText: '30-09-2027', creationDate: '02 November 2026', months: 11 });
  assert.equal(model.depositBreakdown, 'Deposit breakdown not separately recorded');
  assert.match(model.periodData[1][1], /Deposit breakdown not separately recorded/);
  assert.equal(model.termsList.length, 8);
});
