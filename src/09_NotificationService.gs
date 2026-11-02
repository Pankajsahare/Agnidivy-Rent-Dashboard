/** Email queue with bounded retries. WhatsApp is generated as a click-to-chat URL only. */
function enqueueEmail_(type, recipient, subject, plainBody, htmlBody, referenceType, referenceId, attachmentFileIds) {
  if (!recipient) return null;
  var existingId = findNotificationByReference_(type, recipient, referenceType, referenceId);
  if (existingId) return existingId;
  var row = buildNotificationRow_(type, recipient, subject, plainBody, htmlBody, referenceType, referenceId, attachmentFileIds);
  appendNotificationRows_([row]);
  return row[0];
}

function buildNotificationRow_(type, recipient, subject, plainBody, htmlBody, referenceType, referenceId, attachmentFileIds) {
  return [makeId_('NTF'), type, recipient, subject, plainBody, htmlBody, (attachmentFileIds || []).join(','), referenceType || '', referenceId || '', 'QUEUED', 0, '', new Date(), ''];
}

/** Prevents repeated daily triggers from enqueueing the same business notification. */
function findNotificationByReference_(type, recipient, referenceType, referenceId) {
  if (!referenceType || !referenceId) return '';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.NOTIFICATIONS);
  if (!sheet || sheet.getLastRow() < 2) return '';
  var data = sheet.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    if (String(valueByAliases_(row, cols, ['Type'])) !== String(type)) continue;
    if (String(valueByAliases_(row, cols, ['Recipient'])).toLowerCase() !== String(recipient).toLowerCase()) continue;
    if (String(valueByAliases_(row, cols, ['ReferenceType'])) !== String(referenceType)) continue;
    if (String(valueByAliases_(row, cols, ['ReferenceID'])) !== String(referenceId)) continue;
    return String(valueByAliases_(row, cols, ['NotificationID']) || 'EXISTING_NOTIFICATION');
  }
  return '';
}

function appendNotificationRows_(rows) {
  if (!rows || !rows.length) return;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.NOTIFICATIONS);
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function processNotificationQueue() {
  return withSystemErrorHandling_('processNotificationQueue', {}, function () {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Notification queue is already being processed.');
    try {
    if (String(getConfigValue_('MAIL_ENABLED', 'NO')).toUpperCase() !== 'YES') return { sent: 0, skipped: 'MAIL_ENABLED is not YES' };
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.NOTIFICATIONS);
    if (!sheet || sheet.getLastRow() < 2) return { sent: 0 };
    var range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
    var data = range.getValues();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    var cols = getColumnMap(headers);
    var maxBatch = Math.max(1, Math.min(100, toNumber_(getConfigValue_('NOTIFICATION_BATCH_SIZE', '20'), 20)));
    var adminEmail = String(getConfigValue_('ADMIN_EMAIL', '')).trim();
    var sent = 0;
    for (var i = 0; i < data.length && sent < maxBatch; i++) {
      var status = String(valueByAliases_(data[i], cols, ['Status'])).toUpperCase();
      if (status !== 'QUEUED' && status !== 'RETRY') continue;
      var attempts = toNumber_(valueByAliases_(data[i], cols, ['Attempts'])) + 1;
      try {
        var email = {
          to: String(valueByAliases_(data[i], cols, ['Recipient'])),
          subject: String(valueByAliases_(data[i], cols, ['Subject'])),
          body: String(valueByAliases_(data[i], cols, ['PlainBody'])),
          htmlBody: String(valueByAliases_(data[i], cols, ['HtmlBody'])),
          name: 'Sahare Properties'
        };
        var attachmentIds = String(valueByAliases_(data[i], cols, ['AttachmentFileIDs']) || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        if (attachmentIds.length) email.attachments = attachmentIds.map(function (id) { return DriveApp.getFileById(id).getBlob(); });
        if (adminEmail) email.bcc = adminEmail;
        MailApp.sendEmail(email);
        data[i][cols[normalizeHeader_('Status')] - 1] = 'SENT';
        data[i][cols[normalizeHeader_('Attempts')] - 1] = attempts;
        data[i][cols[normalizeHeader_('LastError')] - 1] = '';
        data[i][cols[normalizeHeader_('SentAt')] - 1] = new Date();
        sent++;
      } catch (error) {
        data[i][cols[normalizeHeader_('Attempts')] - 1] = attempts;
        data[i][cols[normalizeHeader_('LastError')] - 1] = error.message || String(error);
        data[i][cols[normalizeHeader_('Status')] - 1] = attempts >= 3 ? 'FAILED' : 'RETRY';
        logSystemError('processNotificationQueue', error, { notificationId: data[i][cols[normalizeHeader_('NotificationID')] - 1], attempt: attempts });
      }
    }
    range.setValues(data);
    return { sent: sent };
    } finally {
      lock.releaseLock();
    }
  });
}
