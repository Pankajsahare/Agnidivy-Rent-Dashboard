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
