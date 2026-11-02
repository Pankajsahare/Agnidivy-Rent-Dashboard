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
