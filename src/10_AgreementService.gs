/**
 * Agreement generation using the original v6.1 native DocumentApp layout.
 * The configured Live Google Docs master is copied as the document source;
 * only the generated copy is cleared and rebuilt. The master itself is never edited.
 */
function promptGenerateAgreement() {
  var ui = SpreadsheetApp.getUi();
  var answer = ui.prompt('Generate Rent Agreement', 'Enter Room Number (for example B1 or C2).', ui.ButtonSet.OK_CANCEL);
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  var result = generateAgreementForRoom(answer.getResponseText());
  if (result && result.pdfUrl) {
    ui.alert('Agreement PDF तयार आहे.\n' + result.pdfUrl + (result.duplicate ? '\nExisting agreement returned; duplicate was not created.' : ''));
  }
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
      if (!register) throw new Error('Agreement Register sheet is missing. Run setupV7Structure first.');
      var existing = findAgreementByKey_(register, agreementKey);
      if (existing) return { duplicate: true, pdfUrl: existing.pdfUrl, agreementId: existing.agreementId };

      // Keep the user-designated live Google Docs file as the official master source.
      // It is copied first; only the generated copy is rebuilt in the v6.1 layout.
      DocumentApp.openById(templateId); // Access/type check for the configured live Google Docs master.
      var templateFile = DriveApp.getFileById(templateId);
      var folderId = String(getConfigValue_('AGREEMENT_FOLDER_ID', '')).trim();
      var targetFolder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
      var docName = 'Rent Agreement — Room ' + room.roomNo + ' — ' + safeFileName_(room.tenantName);
      docCopy = templateFile.makeCopy(docName, targetFolder);

      var creationDate = Utilities.formatDate(new Date(), V7.TIMEZONE, 'dd MMMM yyyy');
      var model = buildV61AgreementModel_(room, {
        startDate: startDate,
        endDate: endDate,
        creationDate: creationDate,
        startDateText: Utilities.formatDate(startDate, V7.TIMEZONE, 'dd-MM-yyyy'),
        endDateText: Utilities.formatDate(endDate, V7.TIMEZONE, 'dd-MM-yyyy'),
        depositDateText: room.depositDate ? formatDate_(room.depositDate, 'dd-MM-yyyy') : 'N/A',
        months: months,
        upiId: String(getConfigValue_('UPI_ID', '')).trim(),
        ownerMobile: String(getConfigValue_('OWNER_MOBILE', '9405908605')).trim()
      });

      var outputDoc = DocumentApp.openById(docCopy.getId());
      renderV61AgreementDocument_(outputDoc, model);
      outputDoc.saveAndClose();

      var pdfName = 'Rent_Agreement_Room_' + room.roomNo + '_' + safeFileName_(room.tenantName) + '.pdf';
      var pdfBlob = DriveApp.getFileById(docCopy.getId()).getAs(MimeType.PDF).setName(pdfName);
      pdfFile = targetFolder.createFile(pdfBlob);
      // Do not create public links. Inherit the destination folder's restricted permissions.

      var agreementId = makeId_('AGR');
      var registerRow = [[
        agreementId, room.roomNo, room.tenantId, room.tenantName, startDate, endDate,
        templateId, docCopy.getId(), pdfFile.getId(), pdfFile.getUrl(), 'GENERATED', new Date(), '',
        'Rendered with original v6.1 native DocumentApp layout from a copy of the configured Live Google Docs master. Master document was not modified.'
      ]];
      register.getRange(register.getLastRow() + 1, 1, 1, registerRow[0].length).setValues(registerRow);
      registered = true;

      if (room.email) {
        var message = 'Hello ' + room.tenantName + ',\n\n' +
          'Please find attached your official rent agreement for Room No. ' + room.roomNo + ' (Sub-Meter: ' + (room.meterNo || 'N/A') + ').\n\n' +
          'Date of Issue: ' + creationDate + '\n' +
          'Agreement Validity: ' + formatDate_(startDate, 'dd-MM-yyyy') + ' to ' + formatDate_(endDate, 'dd-MM-yyyy') + '\n' +
          'Monthly Base Rent: Rs. ' + roundMoney_(room.baseRent).toFixed(2) + '/- + Electricity @ Rs. ' + roundMoney_(room.electricityRate).toFixed(2) + '/unit\n' +
          'Security Deposit: Rs. ' + roundMoney_(room.deposit).toFixed(2) + '/-\n\n' +
          'Thank you,\nSahare Properties, Nagpur';
        enqueueEmail_(
          'RENT_AGREEMENT', room.email,
          'Official Rent Agreement — Room ' + room.roomNo + ' — Sahare Properties',
          message,
          '<div style="font-family:Arial,sans-serif;white-space:pre-line">' + escapeHtml_(message) + '</div>',
          'AGREEMENT', agreementId, [pdfFile.getId()]
        );
      }

      logAudit_('AGREEMENT_GENERATED', 'AGREEMENT', agreementId, {
        room: room.roomNo,
        tenant: room.tenantName,
        pdfFileId: pdfFile.getId(),
        templateId: templateId,
        layoutVersion: 'V6.1_NATIVE_DOCUMENTAPP'
      });
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

/** Pure agreement model preserving the text and structure introduced in v6.1. */
function buildV61AgreementModel_(room, options) {
  var opts = options || {};
  var tenantName = String(room.tenantName || 'Tenant').trim();
  var roomNo = normalizeRoom_(room.roomNo);
  var mobile = String(room.mobile || 'N/A').trim();
  var meterNo = String(room.meterNo || 'N/A').trim();
  var email = String(room.email || '').trim();
  var baseRent = roundMoney_(room.baseRent).toFixed(2);
  var electricityRate = roundMoney_(room.electricityRate).toFixed(2);
  var totalDeposit = roundMoney_(room.deposit).toFixed(2);
  var rentDeposit = room.rentDeposit === '' || room.rentDeposit === null || room.rentDeposit === undefined ? '' : roundMoney_(room.rentDeposit).toFixed(2);
  var electricityDeposit = room.electricityDeposit === '' || room.electricityDeposit === null || room.electricityDeposit === undefined ? '' : roundMoney_(room.electricityDeposit).toFixed(2);
  var depositBreakdown = rentDeposit !== '' || electricityDeposit !== ''
    ? 'Rent Deposit: Rs. ' + (rentDeposit === '' ? '0.00' : rentDeposit) + '/- + Electricity Bill Deposit: Rs. ' + (electricityDeposit === '' ? '0.00' : electricityDeposit) + '/-'
    : 'Deposit breakdown not separately recorded';
  var depositDate = opts.depositDateText || 'N/A';
  var depositMode = String(room.depositMode || 'Online / UPI').trim();
  var startDateText = opts.startDateText || '';
  var endDateText = opts.endDateText || '';
  var creationDate = String(opts.creationDate || '');
  var upiId = String(opts.upiId || '').trim();
  var ownerMobile = String(opts.ownerMobile || '9405908605').trim();
  var months = Number(opts.months || 11);

  var termsList = [
    ['1. Residential Use Only: ', 'The rented premises (Room No. ' + roomNo + ') shall be used strictly for residential purposes by the Tenant and shall not be used for any commercial or unlawful activity, nor sublet or assigned to any third party.'],
    ['2. Timely Payment of Rent & Electricity: ', 'Monthly base rent of Rs. ' + baseRent + '/- along with electricity charges (calculated at Rs. ' + electricityRate + '/unit as per Sub-Meter No. ' + meterNo + ') must be paid on or before the 5th day of every calendar month.'],
    ['3. Digital Reading & Receipt Submission: ', 'The Tenant shall upload the monthly sub-meter photo and payment receipt screenshot via the official Sahare Properties Google Form portal or WhatsApp upon payment.'],
    ['4. Upkeep & Minor Repairs: ', 'The Tenant shall maintain the room, electrical fittings, plumbing, and cleanliness in good condition. Any damage caused due to negligence of the Tenant shall be repaired at the Tenant\'s cost.'],
    ['5. Police Verification & KYC Compliance: ', 'Submission of valid Aadhaar Card, permanent address proof, and mandatory Police Verification documents is compulsory as per Nagpur Municipal & Police regulations.'],
    ['6. Inspection & House Rules: ', 'The Owner reserves the right to inspect the premises at reasonable hours. The Tenant shall maintain peace, hygiene, and cordial discipline in the building and common areas.'],
    ['7. Termination & Notice Period: ', 'Either party may terminate this Agreement by giving 1 (one) month\'s prior written notice. In case of breach of terms or non-payment of rent, the Owner reserves the right to terminate immediately.'],
    ['8. Refund of Security Deposit: ', 'The Security Deposit of Rs. ' + totalDeposit + '/- shall be refunded upon vacating the room and handing over peaceful possession & keys, after deducting any unpaid rent, pending electricity dues, or property damages.']
  ];

  return {
    roomNo: roomNo,
    tenantName: tenantName,
    tenantNameUpper: tenantName.toUpperCase(),
    mobile: mobile,
    meterNo: meterNo,
    email: email || 'N/A',
    baseRent: baseRent,
    electricityRate: electricityRate,
    totalDeposit: totalDeposit,
    rentDeposit: rentDeposit,
    electricityDeposit: electricityDeposit,
    depositBreakdown: depositBreakdown,
    depositDate: depositDate,
    depositMode: depositMode,
    startDate: startDateText,
    endDate: endDateText,
    creationDate: creationDate,
    months: months,
    upiId: upiId,
    ownerMobile: ownerMobile,
    partiesData: [
      ['THE OWNER / LESSOR', 'THE TENANT / LESSEE'],
      [
        'Sahare Properties\nOwner: Pankaj Digambar Sahare\nAddress: Bhande Plot, Umred Road, Nagpur, Maharashtra.\nMobile: +91 ' + ownerMobile + (upiId ? ' | UPI: ' + upiId : '') + '\n(Hereinafter referred to as the \'Owner\' / \'Lessor\')',
        'Name: ' + tenantName + '\nRented Unit: Room No. ' + roomNo + ' (Sub-Meter: ' + meterNo + ')\nMobile Number: +91 ' + mobile + '\nEmail: ' + (email || 'N/A') + '\n(Hereinafter referred to as the \'Tenant\' / \'Lessee\')'
      ]
    ],
    propertyData: [
      ['Parameter', 'Official Agreed Details'],
      ['Property Address', 'Sahare Properties Multi-Story Building, Bhande Plot, Umred Road, Nagpur, Maharashtra.'],
      ['Allotted Room & Sub-Meter No.', 'Room No. ' + roomNo + '  |  Dedicated Sub-Meter Serial No.: ' + meterNo],
      ['Monthly Base Rent', 'Rs. ' + baseRent + '/- per month (Payable in advance on or before the 5th day of every month).'],
      ['Electricity Charges', 'Rs. ' + electricityRate + ' per unit based on monthly sub-meter reading (Meter No: ' + meterNo + ').'],
      ['Official Payment Mode', 'UPI ID: ' + (upiId || 'As notified by Owner') + ' (Sahare Properties) / Online Transfer.']
    ],
    periodData: [
      ['Particulars', 'Details'],
      ['Total Security Deposit', 'Rs. ' + totalDeposit + '/- (' + depositBreakdown + ')'],
      ['Deposit Payment Details', 'Received via ' + depositMode + ' on ' + depositDate + ' (Interest-free refundable deposit).'],
      ['Agreement Start Date', startDateText],
      ['Agreement End Date', endDateText + ' (Standard ' + months + '-Month Leave & License Tenure)'],
      ['Renewal Clause', 'May be renewed mutually upon expiry with standard rent revision as applicable.']
    ],
    termsList: termsList,
    witnessText: 'IN WITNESS WHEREOF, both the Owner (Lessor) and the Tenant (Lessee) have read, understood, and signed this Rent Agreement on ' + creationDate + ' at Nagpur.',
    signatureData: [
      ['FOR SAHARE PROPERTIES (OWNER / LESSOR)', 'ACCEPTED BY TENANT (LESSEE)'],
      [
        '\n\n\n____________________________________\nPankaj Digambar Sahare\n(Owner — Sahare Properties, Nagpur)\nDate: ' + creationDate,
        '\n\n\n____________________________________\n' + tenantName + '\n(Tenant — Room No. ' + roomNo + ' | Mob: ' + mobile + ')\nDate: ' + creationDate
      ]
    ]
  };
}

/** Render the original v6.1 two-page layout into the generated Google Docs copy. */
function renderV61AgreementDocument_(doc, model) {
  var body = doc.getBody();
  body.clear();
  body.setMarginTop(36).setMarginBottom(36).setMarginLeft(45).setMarginRight(45);

  // v6.1 did not use page headers or footers; clear inherited copy-only content.
  var header = doc.getHeader();
  if (header) header.clear();
  var footer = doc.getFooter();
  if (footer) footer.clear();

  var titlePara = body.appendParagraph('RENT AGREEMENT');
  titlePara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  titlePara.editAsText().setFontFamily('Arial').setFontSize(18).setBold(true).setForegroundColor('#1b5e20');
  titlePara.setSpacingAfter(2);

  var subTitle = body.appendParagraph('SAHARE PROPERTIES — RESIDENTIAL LEASE DEED');
  subTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  subTitle.editAsText().setFontFamily('Arial').setFontSize(10).setBold(true).setForegroundColor('#555555');
  subTitle.setSpacingAfter(8);
  body.appendHorizontalRule();

  var introPrefix = 'This Rent Agreement is executed at Nagpur, Maharashtra on this ';
  var introPara = body.appendParagraph(introPrefix + model.creationDate + ', by and between:');
  introPara.setAlignment(DocumentApp.HorizontalAlignment.JUSTIFY);
  var introText = introPara.editAsText();
  introText.setFontFamily('Arial').setFontSize(10.5).setBold(false).setForegroundColor('#222222');
  if (model.creationDate) introText.setBold(introPrefix.length, introPrefix.length + model.creationDate.length - 1, true);
  introPara.setSpacingBefore(6).setSpacingAfter(8);

  var partiesTable = body.appendTable(model.partiesData);
  styleAgreementTable(partiesTable, '#1b5e20', '#ffffff', '#f9fbe7');

  var sec1Head = body.appendParagraph('1. PROPERTY DETAILS, SUB-METER & RENT TERMS');
  sec1Head.editAsText().setFontFamily('Arial').setFontSize(11.5).setBold(true).setForegroundColor('#1b5e20');
  sec1Head.setSpacingBefore(12).setSpacingAfter(4);
  var propTable = body.appendTable(model.propertyData);
  styleAgreementTable(propTable, '#2e7d32', '#ffffff', '#ffffff');
  propTable.setColumnWidth(0, 165);

  var sec2Head = body.appendParagraph('2. SECURITY DEPOSIT & AGREEMENT TENURE (' + model.months + ' MONTHS)');
  sec2Head.editAsText().setFontFamily('Arial').setFontSize(11.5).setBold(true).setForegroundColor('#1b5e20');
  sec2Head.setSpacingBefore(12).setSpacingAfter(4);
  var periodTable = body.appendTable(model.periodData);
  styleAgreementTable(periodTable, '#2e7d32', '#ffffff', '#ffffff');
  periodTable.setColumnWidth(0, 165);

  var p1Foot = body.appendParagraph('Note: Detailed Terms & Conditions and Party Signatures are continued on Page 2 of this Agreement.');
  p1Foot.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  p1Foot.editAsText().setFontFamily('Arial').setFontSize(9).setItalic(true).setForegroundColor('#666666');
  p1Foot.setSpacingBefore(10);

  body.appendPageBreak();

  var p2Banner = body.appendParagraph('RENT AGREEMENT — ROOM NO. ' + model.roomNo + ' (' + model.tenantNameUpper + ')');
  p2Banner.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  p2Banner.editAsText().setFontFamily('Arial').setFontSize(10).setBold(true).setForegroundColor('#555555');
  p2Banner.setSpacingAfter(4);
  body.appendHorizontalRule();

  var sec3Head = body.appendParagraph('3. TERMS AND CONDITIONS');
  sec3Head.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  sec3Head.editAsText().setFontFamily('Arial').setFontSize(13).setBold(true).setForegroundColor('#1b5e20');
  sec3Head.setSpacingBefore(8).setSpacingAfter(8);

  model.termsList.forEach(function (term) {
    var paragraph = body.appendParagraph(term[0] + term[1]);
    paragraph.setAlignment(DocumentApp.HorizontalAlignment.JUSTIFY);
    paragraph.setLineSpacing(1.15);
    paragraph.setSpacingAfter(6);
    var text = paragraph.editAsText();
    text.setFontFamily('Arial').setFontSize(10).setForegroundColor('#222222').setBold(false);
    text.setBold(0, term[0].length - 1, true);
  });

  var witness = body.appendParagraph(model.witnessText);
  witness.setAlignment(DocumentApp.HorizontalAlignment.JUSTIFY);
  witness.editAsText().setFontFamily('Arial').setFontSize(10).setBold(true).setForegroundColor('#1b5e20');
  witness.setSpacingBefore(14).setSpacingAfter(12);

  var signatureTable = body.appendTable(model.signatureData);
  styleAgreementTable(signatureTable, '#e8f5e9', '#1b5e20', '#ffffff');
}

function styleAgreementTable(table, headerBg, headerFg, bodyBg) {
  table.setBorderColor('#bdbdbd').setBorderWidth(1);
  for (var r = 0; r < table.getNumRows(); r++) {
    var row = table.getRow(r);
    for (var c = 0; c < row.getNumCells(); c++) {
      var cell = row.getCell(c);
      cell.setPaddingTop(5).setPaddingBottom(5).setPaddingLeft(7).setPaddingRight(7);
      var cellText = cell.editAsText();
      if (r === 0) {
        cell.setBackgroundColor(headerBg);
        cellText.setFontFamily('Arial').setFontSize(10).setBold(true).setForegroundColor(headerFg);
      } else {
        cell.setBackgroundColor(bodyBg);
        cellText.setFontFamily('Arial').setFontSize(9.5).setBold(false).setForegroundColor('#222222');
        if (row.getNumCells() === 2 && c === 0 && headerBg === '#2e7d32') {
          cellText.setBold(true);
          cell.setBackgroundColor('#f1f8e9');
        }
      }
    }
  }
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

function safeFileName_(value) {
  return String(value || 'Tenant').replace(/[\\/:*?"<>|#%{}]/g, '').replace(/\s+/g, '_').slice(0, 80);
}
