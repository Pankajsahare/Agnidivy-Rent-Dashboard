/** Agreement generation from the user-designated live Google Docs master template. */
function promptGenerateAgreement() {
  var ui = SpreadsheetApp.getUi();
  var answer = ui.prompt('Generate Rent Agreement', 'Enter Room Number (for example B1 or C2).', ui.ButtonSet.OK_CANCEL);
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  var result = generateAgreementForRoom(answer.getResponseText());
  if (result && result.pdfUrl) ui.alert('Agreement PDF तयार आहे.\n' + result.pdfUrl + (result.duplicate ? '\nExisting agreement returned; duplicate was not created.' : ''));
}

function generateAgreementForRoom(roomNo) {
  return withSystemErrorHandling_('generateAgreementForRoom', { roomNo: roomNo }, function () {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Agreement generation is already in progress.');
    var docCopy = null;
    var pdfFile = null;
    var registered = false;
    try {
      var room = getTenantForRoom_(roomNo);
      var templateId = String(getConfigValue_('AGREEMENT_TEMPLATE_ID', '')).trim();
      if (!templateId) throw new Error('AGREEMENT_TEMPLATE_ID is missing in System Config.');
      var startDate = toDateSafe_(room.agreementStartDate);
      if (!startDate) throw new Error('Agreement start date is missing for room ' + room.roomNo + '.');
      var months = Math.max(1, Math.min(24, toNumber_(getConfigValue_('AGREEMENT_DURATION_MONTHS', '11'), 11)));
      var endDate = addMonthsClamped_(startDate, months);
      endDate.setDate(endDate.getDate() - 1);
      var agreementKey = room.roomNo + '|' + room.tenantId + '|' + Utilities.formatDate(startDate, V7.TIMEZONE, 'yyyy-MM-dd');
      var register = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.AGREEMENTS);
      var existing = findAgreementByKey_(register, agreementKey);
      if (existing) return { duplicate: true, pdfUrl: existing.pdfUrl, agreementId: existing.agreementId };

      var replacements = {
        '{{TenantName}}': room.tenantName,
        '{{RoomNo}}': room.roomNo,
        '{{MobileNumber}}': room.mobile,
        '{{Rent}}': roundMoney_(room.baseRent).toFixed(2),
        '{{Deposit}}': roundMoney_(room.deposit).toFixed(2),
        '{{DepositMode}}': room.depositMode || 'Online / UPI',
        '{{DepositDate}}': formatDate_(room.depositDate, 'dd-MM-yyyy') || 'N/A',
        '{{StartDate}}': Utilities.formatDate(startDate, V7.TIMEZONE, 'dd-MM-yyyy'),
        '{{EndDate}}': Utilities.formatDate(endDate, V7.TIMEZONE, 'dd-MM-yyyy')
      };
      // Validate the live master before copying it, avoiding orphan copies when placeholders are absent.
      var templateDoc = DocumentApp.openById(templateId);
      var templateText = templateDoc.getBody().getText();
      var missingTokens = Object.keys(replacements).filter(function (token) { return templateText.indexOf(token) === -1; });
      if (missingTokens.length) throw new Error('Live Google Docs master is missing expected placeholders: ' + missingTokens.join(', '));

      var templateFile = DriveApp.getFileById(templateId);
      var docName = 'Rent Agreement — Room ' + room.roomNo + ' — ' + safeFileName_(room.tenantName);
      var folderId = String(getConfigValue_('AGREEMENT_FOLDER_ID', '')).trim();
      docCopy = folderId ? templateFile.makeCopy(docName, DriveApp.getFolderById(folderId)) : templateFile.makeCopy(docName);
      var doc = DocumentApp.openById(docCopy.getId());
      var body = doc.getBody();
      Object.keys(replacements).forEach(function (token) {
        body.replaceText(escapeRegex_(token), String(replacements[token]));
      });
      var unresolved = body.getText().match(/\{\{[^}]+\}\}/g);
      if (unresolved && unresolved.length) throw new Error('Unresolved agreement placeholders: ' + unresolved.join(', '));
      doc.saveAndClose();

      var pdfName = 'Rent_Agreement_Room_' + room.roomNo + '_' + safeFileName_(room.tenantName) + '.pdf';
      var pdfBlob = DriveApp.getFileById(docCopy.getId()).getAs(MimeType.PDF).setName(pdfName);
      pdfFile = folderId ? DriveApp.getFolderById(folderId).createFile(pdfBlob) : DriveApp.createFile(pdfBlob);
      // No public/anyone-with-link sharing is granted. Drive's inherited/private permissions remain in effect.

      var agreementId = makeId_('AGR');
      var row = [[agreementId, room.roomNo, room.tenantId, room.tenantName, startDate, endDate, templateId, docCopy.getId(), pdfFile.getId(), pdfFile.getUrl(), 'GENERATED', new Date(), '', 'Generated from live Google Docs master template.']];
      register.getRange(register.getLastRow() + 1, 1, 1, row[0].length).setValues(row);
      registered = true;

      if (room.email) {
        var message = 'Hello ' + room.tenantName + ',\n\nPlease find attached your rent agreement for Room ' + room.roomNo + '.\nValidity: ' + formatDate_(startDate) + ' to ' + formatDate_(endDate) + '.\n\nThank you,\nSahare Properties';
        enqueueEmail_('RENT_AGREEMENT', room.email, 'Rent Agreement — Room ' + room.roomNo + ' — Sahare Properties', message, '<div style="font-family:Arial;white-space:pre-line">' + escapeHtml_(message) + '</div>', 'AGREEMENT', agreementId, [pdfFile.getId()]);
      }
      logAudit_('AGREEMENT_GENERATED', 'AGREEMENT', agreementId, { room: room.roomNo, tenant: room.tenantName, pdfFileId: pdfFile.getId() });
      return { duplicate: false, agreementId: agreementId, pdfUrl: pdfFile.getUrl(), googleDocId: docCopy.getId() };
    } catch (error) {
      // Clean up only files created by this invocation, and only if no register row committed.
      if (!registered) {
        try { if (pdfFile) pdfFile.setTrashed(true); } catch (cleanupPdfError) { Logger.log('PDF cleanup failed: ' + cleanupPdfError.message); }
        try { if (docCopy) docCopy.setTrashed(true); } catch (cleanupDocError) { Logger.log('Google Doc cleanup failed: ' + cleanupDocError.message); }
      }
      throw error;
    } finally {
      lock.releaseLock();
    }
  });
}

function findAgreementByKey_(sheet, key) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  var values = sheet.getDataRange().getValues();
  var cols = getColumnMap(values[0]);
  for (var i = 1; i < values.length; i++) {
    var room = normalizeRoom_(valueByAliases_(values[i], cols, ['RoomNo']));
    var tenantId = String(valueByAliases_(values[i], cols, ['TenantID']) || '');
    var start = toDateSafe_(valueByAliases_(values[i], cols, ['StartDate']));
    if (!start) continue;
    var candidate = room + '|' + tenantId + '|' + Utilities.formatDate(start, V7.TIMEZONE, 'yyyy-MM-dd');
    if (candidate === key) return {
      agreementId: valueByAliases_(values[i], cols, ['AgreementID']),
      pdfUrl: valueByAliases_(values[i], cols, ['PdfURL'])
    };
  }
  return null;
}

function escapeRegex_(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function safeFileName_(value) { return String(value || 'Tenant').replace(/[\\/:*?"<>|#%{}]/g, '').replace(/\s+/g, '_').slice(0, 80); }
