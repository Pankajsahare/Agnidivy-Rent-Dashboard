/** Approved rent waiver / credit adjustments. Adjustments are not cash payments. */
function getApprovedAdjustmentTotals_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.ADJUSTMENTS);
  var totals = {};
  if (!sheet || sheet.getLastRow() < 2) return totals;
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(valueByAliases_(row, cols, ['ApprovalStatus'])).toUpperCase() !== 'APPROVED') continue;
    var billId = String(valueByAliases_(row, cols, ['BillID']) || '').trim();
    var amount = roundMoney_(valueByAliases_(row, cols, ['Amount']));
    if (!billId || amount <= 0) continue;
    totals[billId] = roundMoney_((totals[billId] || 0) + amount);
  }
  return totals;
}

function getApprovedAdjustmentsForBill_(billId) {
  return roundMoney_(getApprovedAdjustmentTotals_()[String(billId)] || 0);
}
