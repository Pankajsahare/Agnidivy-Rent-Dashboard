/** Tenant and room master services. Legacy Tenant Master is read-only for migration. */
function getRoomMasterMap_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V7.SHEETS.ROOM_MASTER);
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var columns = getColumnMap(data[0]);
  var result = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var room = normalizeRoom_(valueByAliases_(row, columns, ['RoomNo']));
    if (!room) continue;
    result[room] = {
      roomNo: room,
      meterNo: String(valueByAliases_(row, columns, ['MeterNo']) || '').trim(),
      baseRent: toNumber_(valueByAliases_(row, columns, ['BaseRent'])),
      electricityRate: toNumber_(valueByAliases_(row, columns, ['ElectricityRate']), toNumber_(getConfigValue_('DEFAULT_ELECTRICITY_RATE', '13.50'))),
      occupancyStatus: String(valueByAliases_(row, columns, ['OccupancyStatus']) || 'ACTIVE').toUpperCase(),
      tenantId: String(valueByAliases_(row, columns, ['CurrentTenantID']) || ''),
      tenantName: String(valueByAliases_(row, columns, ['CurrentTenantName']) || 'Tenant'),
      mobile: String(valueByAliases_(row, columns, ['CurrentTenantMobile']) || '').replace(/\D/g, ''),
      email: String(valueByAliases_(row, columns, ['CurrentTenantEmail']) || '').trim(),
      deposit: toNumber_(valueByAliases_(row, columns, ['SecurityDeposit'])),
      depositMode: String(valueByAliases_(row, columns, ['DepositMode']) || ''),
      depositDate: valueByAliases_(row, columns, ['DepositDate']),
      agreementStartDate: valueByAliases_(row, columns, ['AgreementStartDate']),
      agreementEndDate: valueByAliases_(row, columns, ['AgreementEndDate']),
      notes: String(valueByAliases_(row, columns, ['Notes']) || '')
    };
  }
  return result;
}

function getTenantForRoom_(roomNo) {
  var room = getRoomMasterMap_()[normalizeRoom_(roomNo)];
  if (!room) throw new Error('Room is not configured in Room Master: ' + roomNo);
  if (room.occupancyStatus !== 'ACTIVE' && room.occupancyStatus !== 'OCCUPIED') {
    throw new Error('Room is not currently occupied: ' + roomNo);
  }
  return room;
}

/** Read-only preview: describes records that would be seeded from Tenant Master. */
function previewRoomMasterSeed() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var source = ss.getSheetByName('Tenant Master');
  if (!source) throw new Error('Legacy Tenant Master sheet was not found.');
  var data = source.getDataRange().getValues();
  var cols = getColumnMap(data[0]);
  var existing = getRoomMasterMap_();
  var additions = [];
  data.slice(1).forEach(function (row, index) {
    var room = normalizeRoom_(valueByAliases_(row, cols, ['Room No', 'Room Number']));
    var tenantName = String(valueByAliases_(row, cols, ['Tenant Name', 'Name']) || '').trim();
    if (!room || room === 'TOTAL' || !tenantName) return;
    additions.push({ room: room, tenant: tenantName, action: existing[room] ? 'EXISTS — no change' : 'WOULD ADD', sourceRow: index + 2 });
  });
  var msg = additions.map(function (r) { return r.room + ' — ' + r.tenant + ' — ' + r.action; }).join('\n');
  SpreadsheetApp.getUi().alert('Room Master seed preview (read-only)', msg || 'No tenant rows found.', SpreadsheetApp.getUi().ButtonSet.OK);
  return additions;
}
