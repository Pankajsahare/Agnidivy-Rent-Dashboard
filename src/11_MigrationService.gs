/**
 * Append-only migration. Dry run writes only Migration Preview; apply is blocked unless
 * MIGRATION_APPROVED=YES and the administrator confirms the dialog.
 */
function runMigrationDryRun() {
  return withSystemErrorHandling_('runMigrationDryRun', {}, function () {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var runId = makeId_('MIG');
    var preview = ss.getSheetByName(V7.SHEETS.MIGRATION);
    if (!preview) throw new Error('Migration Preview sheet missing. Run setupV7Structure first.');
    var plan = buildMigrationPlan_(ss, runId);
    if (!plan.length) throw new Error('No legacy records were found to preview.');
    var rows = plan.map(function (item) {
      return [runId, item.entityType, item.targetSheet, item.recordId, item.sourceSheet, item.sourceRow, item.period || '', 'READY', item.warnings || '', JSON.stringify(item.payload), new Date(), ''];
    });
    preview.getRange(preview.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    setConfigValue_('LAST_MIGRATION_RUN_ID', runId);
    logAudit_('MIGRATION_DRY_RUN_CREATED', 'MIGRATION', runId, { plannedRows: rows.length, entityCounts: countBy_(plan, 'entityType') });
    SpreadsheetApp.getUi().alert('Migration dry run तयार झाला.\nRun ID: ' + runId + '\nPreview rows: ' + rows.length + '\n\nMigration Preview sheet तपासा. या टप्प्यावर जुन्या किंवा नवीन Ledger मधील कोणताही आर्थिक डेटा बदललेला नाही.');
    return { runId: runId, plannedRows: rows.length, counts: countBy_(plan, 'entityType') };
  });
}

function buildMigrationPlan_(ss, runId) {
  var plan = [];
  var seenReceiptRefs = {};
  var adjustmentIdsByRoomPeriod = {};
  var formSheet = ss.getSheetByName('Form Responses');
  var overrides = getMigrationOverrides_();
  var tenantSheet = ss.getSheetByName('Tenant Master');
  if (tenantSheet && tenantSheet.getLastRow() >= 2) {
    var tenantData = tenantSheet.getDataRange().getValues();
    var tenantCols = getColumnMap(tenantData[0]);
    tenantData.slice(1).forEach(function (row, index) {
      var sourceRow = index + 2;
      var room = normalizeRoom_(valueByAliases_(row, tenantCols, ['Room No', 'Room Number']));
      var name = String(valueByAliases_(row, tenantCols, ['Tenant Name', 'Name']) || '').trim();
      var tenantNameOverride = overrides['CURRENT_TENANT_NAME|' + room + '|2026-11'];
      if (tenantNameOverride && tenantNameOverride.active) name = String(tenantNameOverride.value).trim();
      if (!room || room === 'TOTAL' || !name) return;
      var mobile = String(valueByAliases_(row, tenantCols, ['Mobile Number', 'Mobile']) || '').replace(/\D/g, '');
      var tenantId = 'TEN-' + room + '-' + (mobile.slice(-4) || '0000');
      var startDate = toDateSafe_(valueByAliases_(row, tenantCols, ['Agreement Start Date', 'Start Date']));
      var endDate = toDateSafe_(valueByAliases_(row, tenantCols, ['Agreement End Date (11 Months)', 'Agreement End Date', 'End Date']));
      var status = String(valueByAliases_(row, tenantCols, ['Renewal Status / Alert', 'Status']) || 'ACTIVE').toUpperCase();
      var meter = String(valueByAliases_(row, tenantCols, ['Meter Number', 'Meter No']) || '').trim();
      var roomPayload = {
        RoomNo: room, MeterNo: meter,
        BaseRent: roundMoney_(valueByAliases_(row, tenantCols, ['Base Monthly Rent', 'Base Rent', 'Rent'])),
        ElectricityRate: roundMoney_(valueByAliases_(row, tenantCols, ['Electricity Rate']) || getConfigValue_('DEFAULT_ELECTRICITY_RATE', '13.50')),
        OccupancyStatus: /ACTIVE|OCCUPIED/i.test(status) ? 'ACTIVE' : status,
        CurrentTenantID: tenantId, CurrentTenantName: name, CurrentTenantMobile: mobile,
        CurrentTenantEmail: String(valueByAliases_(row, tenantCols, ['Tenant Email', 'Email']) || '').trim(),
        UpdatedAt: new Date(),
        SecurityDeposit: roundMoney_(valueByAliases_(row, tenantCols, ['Total Deposit', 'Security Deposit'])),
        DepositMode: String(valueByAliases_(row, tenantCols, ['Deposit Payment Mode', 'Deposit Mode']) || ''),
        DepositDate: valueByAliases_(row, tenantCols, ['Deposit Date']) || '',
        AgreementStartDate: startDate || '', AgreementEndDate: endDate || '',
        Notes: String(valueByAliases_(row, tenantCols, ['Remarks / Shifting History', 'Remarks', 'Notes']) || '')
      };
      plan.push(makePlanItem_('ROOM_MASTER', V7.SHEETS.ROOM_MASTER, room, 'Tenant Master', sourceRow, '', roomPayload, 'Current occupancy snapshot; legacy row is retained.'));
      var historyPayload = {
        TenantID: tenantId, TenantName: name, Mobile: mobile,
        Email: roomPayload.CurrentTenantEmail, RoomNo: room,
        MoveInDate: startDate || '', MoveOutDate: '', Status: 'CURRENT',
        Source: 'Tenant Master legacy snapshot', Notes: roomPayload.Notes, CreatedAt: new Date()
      };
      plan.push(makePlanItem_('TENANT_HISTORY', V7.SHEETS.TENANT_HISTORY, tenantId, 'Tenant Master', sourceRow, '', historyPayload, 'One current-state snapshot only; prior movements are not inferred.'));
    });
  }

  var roomMasterRows = plan.filter(function (item) { return item.entityType === 'ROOM_MASTER'; });
  var roomToTenant = {};
  roomMasterRows.forEach(function (item) { roomToTenant[item.payload.RoomNo] = item.payload; });
  Object.keys(roomToTenant).forEach(function (roomNo) {
    var roomSheet = ss.getSheetByName(roomNo);
    if (!roomSheet || roomSheet.getLastRow() < 2) return;
    var data = roomSheet.getDataRange().getValues();
    var cols = getColumnMap(data[0]);
    var headerYear = toNumber_(data[0][0], 0);
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var month = valueByAliases_(row, cols, ['Month']);
      if (!month) continue;
      var firstCellYear = toNumber_(row[0], 0);
      var year = firstCellYear >= 2000 && firstCellYear <= 2100 ? firstCellYear : (headerYear >= 2000 && headerYear <= 2100 ? headerYear : 0);
      if (!year) continue;
      var period = periodKey_(year, month);
      var baseRent = roundMoney_(valueByAliases_(row, cols, ['Rent', 'Base Rent']));
      var totalRaw = valueByAliases_(row, cols, ['Total Rent', 'Total Amount']);
      var total = totalRaw === '' || totalRaw === null ? '' : roundMoney_(totalRaw);
      var electricRaw = valueByAliases_(row, cols, ['Electric Bill', 'Electricity Amount']);
      var electric = electricRaw === '' || electricRaw === null ? '' : roundMoney_(electricRaw);
      var reading = valueByAliases_(row, cols, ['Reading', 'Current Reading']);
      var units = valueByAliases_(row, cols, ['Unit Consumed', 'Units Consumed']);
      var rate = toNumber_(valueByAliases_(row, cols, ['Elc. Rate', 'Electricity Rate']), toNumber_(roomToTenant[roomNo].ElectricityRate));
      var adjustmentRaw = valueByAliases_(row, cols, ['Amount Paid']);
      var adjustmentAmount = roundMoney_(adjustmentRaw);
      var adjustmentOverride = overrides['ADJUSTMENT_FINAL_VALUE|' + roomNo + '|' + period] || overrides['PAYMENT_FINAL_VALUE|' + roomNo + '|' + period];
      if (adjustmentOverride && adjustmentOverride.active) adjustmentAmount = roundMoney_(adjustmentOverride.value);
      var balanceRaw = valueByAliases_(row, cols, ['Balance Due']);
      var sourceRow = i + 1;
      var future = period > Utilities.formatDate(new Date(), V7.TIMEZONE, 'yyyy-MM');
      var billStatus = future ? 'PLANNED' : (total === '' ? 'LEGACY_INCOMPLETE' : 'LEGACY_IMPORTED');
      var billId = makeBillId_(roomNo, period);
      var billPayload = {
        BillID: billId, RoomNo: roomNo, TenantID: roomToTenant[roomNo].CurrentTenantID,
        BillingPeriod: period, BaseRent: baseRent,
        PreviousReading: '', CurrentReading: reading === '' ? '' : toNumber_(reading),
        UnitsConsumed: units === '' ? '' : roundMoney_(units), ElectricityRate: rate,
        ElectricityAmount: electric, TotalAmount: total,
        VerifiedPayments: 0, OutstandingAmount: calculateOutstanding_(total, 0, adjustmentAmount),
        DueDate: dueDateForPeriod_(period, toNumber_(getConfigValue_('BILLING_DUE_DAY', '5'))),
        BillStatus: billStatus, ReconciliationStatus: reconciliationStatus_(total, 0, adjustmentAmount),
        WhatsAppURL: '', UPIURL: '', UPIQRURL: '', CreatedAt: new Date(), Source: 'LEGACY_ROOM_TAB',
        SourceSheet: roomNo, SourceRow: sourceRow,
        Notes: String(valueByAliases_(row, cols, ['Remark', 'Remarks']) || '') +
          (balanceRaw !== '' ? ' | Legacy displayed balance: ' + balanceRaw : '') +
          (adjustmentAmount > 0 ? ' | User-confirmed rent waiver/credit adjustment: Rs. ' + adjustmentAmount.toFixed(2) : '')
      };
      if (total !== '' || baseRent > 0) {
        plan.push(makePlanItem_('BILLING_LEDGER', V7.SHEETS.BILLING, billId, roomNo, sourceRow, period, billPayload, total === '' ? 'No legacy Total Rent value; imported as incomplete, not billed.' : 'Historical bill imported; approved legacy waiver/credit adjustments reduce outstanding separately from cash payments.'));
      }
      if (reading !== '' && reading !== null && toNumber_(reading) >= 0) {
        var readingId = 'LEGACY-READ-' + roomNo + '-' + period;
        var meterPayload = {
          ReadingID: readingId, RoomNo: roomNo, MeterNo: roomToTenant[roomNo].MeterNo,
          BillingPeriod: period, ReadingValue: roundMoney_(reading), ReadingDate: '',
          PhotoReference: String(valueByAliases_(row, cols, ['Reading Photo']) || ''),
          IdempotencyKey: readingId, SourceType: 'LEGACY_ROOM_TAB', SourceSheet: roomNo,
          SourceRow: sourceRow, Notes: 'Canonical room-tab reading; individual Form Responses are not separately counted.', CreatedAt: new Date()
        };
        plan.push(makePlanItem_('METER_READING_LEDGER', V7.SHEETS.METERS, readingId, roomNo, sourceRow, period, meterPayload, 'Room tab selected as canonical reading source to prevent duplicate form submissions.'));
      }
      if (adjustmentAmount > 0) {
        var adjustmentId = 'LEGACY-ADJ-' + roomNo + '-' + period;
        adjustmentIdsByRoomPeriod[roomNo + '|' + period] = adjustmentId;
        var adjustmentPayload = {
          AdjustmentID: adjustmentId, BillID: billId, RoomNo: roomNo,
          TenantID: roomToTenant[roomNo].CurrentTenantID, BillingPeriod: period,
          AdjustmentType: 'RENT_WAIVER_CREDIT', Amount: adjustmentAmount,
          Reason: 'User-confirmed legacy Rent Waiver/Credit Adjustment.',
          ApprovalStatus: 'APPROVED', ApprovedBy: getActor_(), ApprovedAt: new Date(),
          IdempotencyKey: adjustmentId, SourceType: 'LEGACY_ROOM_TAB',
          SourceSheet: roomNo, SourceRow: sourceRow,
          Notes: 'Imported from legacy Amount Paid cell as a waiver/credit, not a cash receipt. User confirmed all 58 legacy records use this classification.'
        };
        plan.push(makePlanItem_('ADJUSTMENT_LEDGER', V7.SHEETS.ADJUSTMENTS, adjustmentId, roomNo, sourceRow, period, adjustmentPayload, 'User-confirmed rent waiver/credit; reduces bill outstanding, not payment receipts.'));
        var receiptRef = String(valueByAliases_(row, cols, ['Payment Receipt Photo']) || '');
        if (receiptRef) {
          var refs = receiptRef.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
          refs.forEach(function (ref, refIndex) {
            var receiptKey = roomNo + '|' + period + '|ADJUSTMENT_EVIDENCE|' + ref;
            if (seenReceiptRefs[receiptKey]) return;
            seenReceiptRefs[receiptKey] = true;
            var receiptId = 'LEGACY-ADJ-REC-' + roomNo + '-' + period + '-' + (refIndex + 1);
            var receiptPayload = {
              ReceiptID: receiptId, RoomNo: roomNo, TenantID: roomToTenant[roomNo].CurrentTenantID,
              BillingPeriod: period, PaymentID: '', ReceiptType: 'ADJUSTMENT_EVIDENCE',
              FileReference: ref, SourceSheet: roomNo, SourceRow: sourceRow,
              AccessStatus: 'LEGACY_PERMISSION_NOT_VERIFIED', IdempotencyKey: receiptId, CreatedAt: new Date(),
              Notes: 'Original file reference retained as adjustment evidence; no payment is represented.'
            };
            plan.push(makePlanItem_('RECEIPT_REGISTER', V7.SHEETS.RECEIPTS, receiptId, roomNo, sourceRow, period, receiptPayload, 'Adjustment evidence only; no cash payment is linked.'));
          });
        }
      }
    }
  });

  // Preserve Form-uploaded photo/receipt references without importing form amounts as separate payments.
  if (formSheet && formSheet.getLastRow() >= 2) {
    var formValues = formSheet.getDataRange().getValues();
    var formHeaders = getColumnMap(formValues[0]);
    for (var fr = 1; fr < formValues.length; fr++) {
      var formRow = formValues[fr];
      var formRoom = parseRoomChoice_(valueByAliases_(formRow, formHeaders, ['Select Room Number', 'Room Number']));
      var formMonth = valueByAliases_(formRow, formHeaders, ['Select Month', 'Month']);
      if (!formRoom || !formMonth || !roomToTenant[formRoom]) continue;
      var formTimestamp = toDateSafe_(valueByAliases_(formRow, formHeaders, ['Timestamp'])) || new Date();
      var formPeriod = resolveFormPeriod_(formMonth, formTimestamp);
      var meterPhoto = String(valueByAliases_(formRow, formHeaders, ['Meter Reading Photo', 'Reading Photo']) || '').trim();
      var payPhoto = String(valueByAliases_(formRow, formHeaders, ['Payment Receipt Photo / Screenshot', 'Payment Receipt Photo', 'Receipt Photo']) || '').trim();
      var legacyAdjustmentId = adjustmentIdsByRoomPeriod[formRoom + '|' + formPeriod] || '';
      if (meterPhoto) {
        var meterPhotoKey = formRoom + '|' + formPeriod + '|METER_PHOTO|' + meterPhoto;
        if (!seenReceiptRefs[meterPhotoKey]) {
          seenReceiptRefs[meterPhotoKey] = true;
          var meterReceiptId = 'LEGACY-FORM-METER-PHOTO-' + formRoom + '-' + formPeriod + '-' + (fr + 1);
          var meterReceiptPayload = {
            ReceiptID: meterReceiptId, RoomNo: formRoom, TenantID: roomToTenant[formRoom].CurrentTenantID,
            BillingPeriod: formPeriod, PaymentID: '', ReceiptType: 'METER_PHOTO',
            FileReference: meterPhoto, SourceSheet: formSheet.getName(), SourceRow: fr + 1,
            AccessStatus: 'LEGACY_PERMISSION_NOT_VERIFIED', IdempotencyKey: meterReceiptId,
            CreatedAt: formTimestamp, Notes: 'Form upload reference retained as evidence; canonical meter value comes from the room tab.'
          };
          plan.push(makePlanItem_('RECEIPT_REGISTER', V7.SHEETS.RECEIPTS, meterReceiptId, formSheet.getName(), fr + 1, formPeriod, meterReceiptPayload, 'Original Drive permissions were not changed.'));
        }
      }
      if (payPhoto) {
        var payPhotoKey = formRoom + '|' + formPeriod + '|' + (legacyAdjustmentId ? 'ADJUSTMENT_EVIDENCE' : 'LEGACY_REFERENCE_UNCLASSIFIED') + '|' + payPhoto;
        if (!seenReceiptRefs[payPhotoKey]) {
          seenReceiptRefs[payPhotoKey] = true;
          var payReceiptId = 'LEGACY-FORM-ADJUSTMENT-EVIDENCE-' + formRoom + '-' + formPeriod + '-' + (fr + 1);
          var payReceiptPayload = {
            ReceiptID: payReceiptId, RoomNo: formRoom, TenantID: roomToTenant[formRoom].CurrentTenantID,
            BillingPeriod: formPeriod, PaymentID: '', ReceiptType: legacyAdjustmentId ? 'ADJUSTMENT_EVIDENCE' : 'LEGACY_REFERENCE_UNCLASSIFIED',
            FileReference: payPhoto, SourceSheet: formSheet.getName(), SourceRow: fr + 1,
            AccessStatus: 'LEGACY_PERMISSION_NOT_VERIFIED', IdempotencyKey: payReceiptId,
            CreatedAt: formTimestamp,
            Notes: legacyAdjustmentId ? 'Form upload retained as supporting waiver/credit adjustment evidence; not a payment receipt.' : 'Legacy Form file reference retained without classifying it as a cash payment.'
          };
          plan.push(makePlanItem_('RECEIPT_REGISTER', V7.SHEETS.RECEIPTS, payReceiptId, formSheet.getName(), fr + 1, formPeriod, payReceiptPayload, 'Original Drive permissions were not changed.'));
        }
      }
    }
  }

  // Explicit audit note for the user-confirmed C2 November adjustment correction chain.
  var c2PaymentRows = [];
  if (formSheet && formSheet.getLastRow() >= 2) {
    var fdata = formSheet.getDataRange().getValues();
    var fcols = getColumnMap(fdata[0]);
    for (var f = 1; f < fdata.length; f++) {
      var froom = parseRoomChoice_(valueByAliases_(fdata[f], fcols, ['Select Room Number', 'Room Number']));
      var fmonth = valueByAliases_(fdata[f], fcols, ['Select Month', 'Month']);
      var ftime = toDateSafe_(valueByAliases_(fdata[f], fcols, ['Timestamp'])) || new Date();
      if (!froom || !fmonth) continue;
      var fperiod = resolveFormPeriod_(fmonth, ftime);
      var famount = toNumber_(valueByAliases_(fdata[f], fcols, ['Rent Amount Paid (Rs)', 'Amount Paid']));
      if (froom === 'C2' && fperiod === '2026-11' && famount > 0) c2PaymentRows.push({ row: f + 1, amount: roundMoney_(famount) });
    }
  }
  var c2Override = overrides['ADJUSTMENT_FINAL_VALUE|C2|2026-11'] || overrides['PAYMENT_FINAL_VALUE|C2|2026-11'];
  if (c2PaymentRows.length || c2Override) {
    var auditId = 'MIGRATION-NOTE-C2-2026-11';
    var finalValue = c2Override ? roundMoney_(c2Override.value) : 0;
    var relatedAmounts = c2Override && c2Override.relatedValues ? String(c2Override.relatedValues).split('|').map(function (x) { return roundMoney_(x); }) : c2PaymentRows.map(function (x) { return x.amount; });
    var details = {
      userConfirmed: true, correctionAmounts: relatedAmounts, formResponseRows: c2PaymentRows,
      finalAmount: finalValue, action: 'Import one approved Adjustment Ledger row from the canonical Room Tab value / override; do not treat Form Response revisions as separate cash payments.',
      supersededSourceRows: c2PaymentRows.filter(function (x) { return roundMoney_(x.amount) !== finalValue; }).map(function (x) { return x.row; })
    };
    var auditPayload = { LogID: auditId, Timestamp: new Date(), Actor: getActor_(), Action: 'C2_ADJUSTMENT_CORRECTION_RECONCILIATION', EntityType: 'ADJUSTMENT', EntityID: 'LEGACY-ADJ-C2-2026-11', DetailsJSON: JSON.stringify(details), Source: 'User-confirmed migration rule' };
    plan.push(makePlanItem_('AUDIT_LOG', V7.SHEETS.AUDIT, auditId, 'Form Responses', '', '2026-11', auditPayload, 'Captures superseded Form amount revisions without creating duplicate credit adjustments.'));
  }
  return plan;
}

function makePlanItem_(entityType, targetSheet, recordId, sourceSheet, sourceRow, period, payload, warnings) {
  return { entityType: entityType, targetSheet: targetSheet, recordId: recordId, sourceSheet: sourceSheet, sourceRow: sourceRow, period: period, payload: payload, warnings: warnings || '' };
}

function applyMigrationPreview() {
  return withSystemErrorHandling_('applyMigrationPreview', {}, function () {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Migration is already running.');
    try {
    if (String(getConfigValue_('MIGRATION_APPROVED', 'NO')).toUpperCase() !== 'YES') {
      throw new Error('Migration blocked. Review Migration Preview, then set System Config → MIGRATION_APPROVED to YES.');
    }
    var ui = SpreadsheetApp.getUi();
    var runId = String(getConfigValue_('LAST_MIGRATION_RUN_ID', '')).trim();
    if (!runId) throw new Error('LAST_MIGRATION_RUN_ID is blank. Run migration dry run first.');
    var answer = ui.alert('Apply append-only migration?', 'Run: ' + runId + '\nOnly READY rows from this preview run will be appended. Existing rows will not be overwritten or deleted. Continue?', ui.ButtonSet.YES_NO);
    if (answer !== ui.Button.YES) return { applied: 0, cancelled: true };
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var preview = ss.getSheetByName(V7.SHEETS.MIGRATION);
    var dataRange = preview.getDataRange();
    var data = dataRange.getValues();
    var cols = getColumnMap(data[0]);
    var byTarget = {};
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(valueByAliases_(row, cols, ['RunID'])) !== runId) continue;
      if (String(valueByAliases_(row, cols, ['PreviewStatus'])).toUpperCase() !== 'READY') continue;
      var target = String(valueByAliases_(row, cols, ['TargetSheet']));
      if (!V7.SCHEMAS[target]) throw new Error('Unrecognized migration target: ' + target);
      if (!byTarget[target]) byTarget[target] = [];
      byTarget[target].push({ recordId: String(valueByAliases_(row, cols, ['RecordID'])), payload: JSON.parse(String(valueByAliases_(row, cols, ['PayloadJSON']))), previewIndex: i });
    }
    var applied = 0;
    Object.keys(byTarget).forEach(function (target) {
      var sheet = ss.getSheetByName(target);
      if (!sheet) throw new Error('Target sheet missing: ' + target + '. Run setupV7Structure.');
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      getColumnMap(headers); // Validate destination headers before writing.
      var existingIds = {};
      if (sheet.getLastRow() >= 2) sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().forEach(function (r) { existingIds[String(r[0])] = true; });
      var toAppend = [];
      byTarget[target].forEach(function (item) {
        if (existingIds[item.recordId]) {
          data[item.previewIndex][cols[normalizeHeader_('PreviewStatus')] - 1] = 'ALREADY_PRESENT';
          return;
        }
        var payload = revivePayloadDates_(item.payload);
        var output = headers.map(function (header) {
          var key = header;
          return Object.prototype.hasOwnProperty.call(payload, key) ? payload[key] : '';
        });
        toAppend.push(output);
        existingIds[item.recordId] = true;
        data[item.previewIndex][cols[normalizeHeader_('PreviewStatus')] - 1] = 'APPLIED';
        data[item.previewIndex][cols[normalizeHeader_('AppliedAt')] - 1] = new Date();
        applied++;
      });
      if (toAppend.length) sheet.getRange(sheet.getLastRow() + 1, 1, toAppend.length, headers.length).setValues(toAppend);
    });
    // Write preview status updates in one batch; legacy sheets are untouched.
    dataRange.setValues(data);
    setConfigValue_('MIGRATION_APPROVED', 'NO');
    logAudit_('MIGRATION_APPLIED', 'MIGRATION', runId, { applied: applied, targets: Object.keys(byTarget) });
    refreshV7Dashboard();
    ui.alert('Migration completed.\nRows appended: ' + applied + '\nLegacy source sheets were not edited or deleted.\nNext: verify totals and manually reconcile LEGACY_UNVERIFIED payments.');
    return { applied: applied, targets: Object.keys(byTarget) };
    } finally {
      lock.releaseLock();
    }
  });
}

function countBy_(items, key) {
  var result = {};
  items.forEach(function (item) { result[item[key]] = (result[item[key]] || 0) + 1; });
  return result;
}

function revivePayloadDates_(payload) {
  var result = {};
  Object.keys(payload || {}).forEach(function (key) {
    var value = payload[key];
    if (typeof value === 'string' && /(?:Date|At)$/.test(key) && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      var date = new Date(value);
      result[key] = isNaN(date.getTime()) ? value : date;
    } else {
      result[key] = value;
    }
  });
  return result;
}

/**
 * Normalizes override billing periods. Sheets may return a month-formatted
 * cell as a Date object rather than the displayed YYYY-MM string.
 */
function normalizeMigrationPeriod_(value) {
  if (value === '' || value === null || value === undefined) return '';
  var raw = String(value).trim();
  var match = raw.match(/^(\\d{4})[-/](\\d{1,2})$/);
  if (match) return periodKey_(Number(match[1]), Number(match[2]));
  var date = toDateSafe_(value);
  if (date) return Utilities.formatDate(date, V7.TIMEZONE, 'yyyy-MM');
  return raw;
}

function getMigrationOverrides_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.OVERRIDES);
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  var result = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(valueByAliases_(row, cols, ['Active'])).toUpperCase() !== 'YES') continue;
    var type = String(valueByAliases_(row, cols, ['OverrideType'])).trim();
    var room = normalizeRoom_(valueByAliases_(row, cols, ['RoomNo']));
    var period = normalizeMigrationPeriod_(valueByAliases_(row, cols, ['BillingPeriod']));
    if (!type || !room || !period) continue;
    result[type + '|' + room + '|' + period] = {
      value: valueByAliases_(row, cols, ['OverrideValue']),
      relatedValues: valueByAliases_(row, cols, ['RelatedValues']),
      notes: valueByAliases_(row, cols, ['Notes']),
      active: true
    };
  }
  return result;
}
