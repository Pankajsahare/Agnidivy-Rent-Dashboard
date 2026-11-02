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
