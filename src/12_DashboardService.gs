/** Read-only V7 dashboard. Legacy Dashboard remains untouched. */
function refreshV7Dashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName(V7.SHEETS.DASHBOARD);
  if (!dash) throw new Error('V7 Dashboard sheet missing. Run setupV7Structure first.');
  var period = Utilities.formatDate(new Date(), V7.TIMEZONE, 'yyyy-MM');
  var billing = readSheetObjects_(V7.SHEETS.BILLING);
  var payments = readSheetObjects_(V7.SHEETS.PAYMENTS);
  var adjustments = readSheetObjects_(V7.SHEETS.ADJUSTMENTS);
  var rooms = getRoomMasterMap_();
  var currentBills = billing.filter(function (b) { return String(b.BillingPeriod) === period; });
  var currentBillIds = {};
  var adjustmentTotals = {};
  adjustments.forEach(function (a) {
    if (String(a.ApprovalStatus).toUpperCase() !== 'APPROVED') return;
    var billId = String(a.BillID || '');
    if (billId) adjustmentTotals[billId] = roundMoney_((adjustmentTotals[billId] || 0) + toNumber_(a.Amount));
  });
  var billed = 0;
  var verified = 0;
  var outstanding = 0;
  var approvedCredits = 0;
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
    var credits = roundMoney_(adjustmentTotals[String(b.BillID)] || 0);
    approvedCredits += credits;
    return [b.RoomNo, room.tenantName || '', b.BillingPeriod, b.TotalAmount, roundMoney_(confirmed), roundMoney_(pending), credits, b.OutstandingAmount, b.BillStatus];
  });
  dash.getRange('A4:B9').setValues([
    ['Current Period', period],
    ['Total Billed', roundMoney_(billed)],
    ['Verified Received', roundMoney_(verified)],
    ['Reported / Unverified Payments', roundMoney_(unverified)],
    ['Outstanding (after verified payments & credits)', roundMoney_(outstanding)],
    ['Rent Waiver / Credit Adjustments', roundMoney_(approvedCredits)]
  ]);
  var activeRooms = Object.keys(rooms).filter(function (key) { return rooms[key].occupancyStatus === 'ACTIVE' || rooms[key].occupancyStatus === 'OCCUPIED'; }).length;
  dash.getRange('D3:E5').setValues([
    ['Occupied Rooms', activeRooms],
    ['Room Records', Object.keys(rooms).length],
    ['Dashboard Refreshed', new Date()]
  ]);
  dash.getRange('A10:I10').setValues([['Room', 'Tenant', 'Billing Period', 'Billed', 'Verified Received', 'Unverified Payments', 'Waiver / Credits', 'Outstanding', 'Bill Status']]);
  var oldRows = Math.max(0, dash.getLastRow() - 10);
  if (oldRows) dash.getRange(11, 1, oldRows, 9).clearContent();
  if (detailRows.length) dash.getRange(11, 1, detailRows.length, 9).setValues(detailRows);
  dash.getRange('A3:B9').setFontWeight('bold');
  dash.getRange('A10:I10').setFontWeight('bold');
  dash.getRange('B5:B9').setNumberFormat('₹#,##0.00');
  dash.getRange('D5:E5').setNumberFormat('dd-mmm-yyyy hh:mm');
  dash.autoResizeColumns(1, 9);
  return { period: period, bills: currentBills.length, billed: roundMoney_(billed), verified: roundMoney_(verified), unverified: roundMoney_(unverified), credits: roundMoney_(approvedCredits), outstanding: roundMoney_(outstanding), occupiedRooms: activeRooms };
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
