/** Central audit and exception logging. */
function logAudit_(action, entityType, entityId, details) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.AUDIT);
    if (!sheet) return;
    var row = [[makeId_('LOG'), new Date(), getActor_(), action, entityType, String(entityId || ''), JSON.stringify(details || {}), 'Apps Script v' + V7.VERSION]];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row[0].length).setValues(row);
  } catch (error) {
    Logger.log('Audit logging failed: ' + (error.stack || error.message));
  }
}

function logSystemError(functionName, error, context) {
  var message = error && error.message ? error.message : String(error);
  var stack = error && error.stack ? error.stack : '';
  Logger.log('[' + functionName + '] ' + message + '\n' + stack);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.ERRORS);
    if (!sheet) return;
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 7).setValues([[
      makeId_('ERR'), new Date(), functionName, message, stack,
      JSON.stringify(context || {}), 'OPEN'
    ]]);
  } catch (loggingError) {
    Logger.log('Error Log write failed: ' + (loggingError.stack || loggingError.message));
  }
}

function withSystemErrorHandling_(functionName, context, callback) {
  try {
    return callback();
  } catch (error) {
    logSystemError(functionName, error, context);
    throw error;
  }
}
