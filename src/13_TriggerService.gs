/** Trigger creation is opt-in and does not remove or modify existing v6.1 triggers. */
function installV7Triggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var existingHandlers = {};
  triggers.forEach(function (trigger) { existingHandlers[trigger.getHandlerFunction()] = true; });
  var created = [];
  if (!existingHandlers.v7_onFormSubmit) {
    ScriptApp.newTrigger('v7_onFormSubmit').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onFormSubmit().create();
    created.push('v7_onFormSubmit');
  }
  if (!existingHandlers.processNotificationQueue) {
    ScriptApp.newTrigger('processNotificationQueue').timeBased().everyMinutes(10).create();
    created.push('processNotificationQueue');
  }
  if (!existingHandlers.v7_dailyMaintenance) {
    ScriptApp.newTrigger('v7_dailyMaintenance').timeBased().everyDays(1).atHour(9).create();
    created.push('v7_dailyMaintenance');
  }
  logAudit_('V7_TRIGGERS_INSTALLED', 'SYSTEM', V7.VERSION, { created: created, note: 'Existing v6 triggers were not removed.' });
  SpreadsheetApp.getUi().alert('v7 triggers ready: ' + (created.length ? created.join(', ') : 'all already existed') + '\n\nGo-live पूर्वी जुन्या v6.1 onFormSubmit आणि monthly-report triggers निष्क्रिय करायचे आहेत. ते आपोआप हटवलेले नाहीत.');
}

function v7_dailyMaintenance() {
  return withSystemErrorHandling_('v7_dailyMaintenance', {}, function () {
    var summary = refreshV7Dashboard();
    var renewalSummary = enqueueAgreementRenewalReminders_();
    if (String(getConfigValue_('AUTO_CREATE_MONTHLY_BILLS', 'NO')).toUpperCase() === 'YES') {
      // Default is OFF; enabling this flag allows idempotent current-month bill creation after readings exist.
      var period = Utilities.formatDate(new Date(), V7.TIMEZONE, 'yyyy-MM');
      createMonthlyBills(period, { silent: true });
    }
    summary.renewalRemindersQueued = renewalSummary.queued;
    return summary;
  });
}

/** Queues one renewal reminder per room/tenant/expiry date within the configured window. */
function enqueueAgreementRenewalReminders_() {
  var rooms = getRoomMasterMap_();
  var windowDays = Math.max(1, Math.min(120, toNumber_(getConfigValue_('RENEWAL_REMINDER_DAYS', '30'), 30)));
  var today = new Date();
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var queued = 0;
  Object.keys(rooms).forEach(function (roomNo) {
    var room = rooms[roomNo];
    if (room.occupancyStatus !== 'ACTIVE' && room.occupancyStatus !== 'OCCUPIED') return;
    if (!room.email) return;
    var expiry = toDateSafe_(room.agreementEndDate);
    if (!expiry) return;
    var expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    var daysLeft = Math.floor((expiryDay.getTime() - today.getTime()) / 86400000);
    if (daysLeft < 0 || daysLeft > windowDays) return;
    var expiryText = Utilities.formatDate(expiryDay, V7.TIMEZONE, 'dd MMM yyyy');
    var referenceId = roomNo + '|' + room.tenantId + '|' + Utilities.formatDate(expiryDay, V7.TIMEZONE, 'yyyy-MM-dd') + '|' + windowDays;
    var subject = 'Rent Agreement Renewal Reminder — Room ' + roomNo;
    var message = 'Hello ' + room.tenantName + ',\n\nYour rent agreement for Room ' + roomNo + ' is scheduled to expire on ' + expiryText + '. Please contact Sahare Properties to discuss renewal.\n\nThank you,\nSahare Properties';
    if (findNotificationByReference_('AGREEMENT_RENEWAL', room.email, 'AGREEMENT_RENEWAL', referenceId)) return;
    enqueueEmail_('AGREEMENT_RENEWAL', room.email, subject, message, '<div style="font-family:Arial;white-space:pre-line">' + escapeHtml_(message) + '</div>', 'AGREEMENT_RENEWAL', referenceId, []);
    queued++;
  });
  if (queued) logAudit_('AGREEMENT_RENEWAL_REMINDERS_QUEUED', 'SYSTEM', new Date().toISOString(), { queued: queued, windowDays: windowDays });
  return { queued: queued, windowDays: windowDays };
}
