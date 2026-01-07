
/**
 * GOOGLE APPS SCRIPT BACKEND FOR E-LEARNING
 * Petunjuk: 
 * 1. Buka Google Sheets
 * 2. Menu Extensions -> Apps Script
 * 3. Hapus kode lama, tempel kode ini
 * 4. Klik Deploy -> New Deployment -> Web App
 * 5. Who has access: Anyone
 */

function doGet(e) {
  var key = e.parameter.key;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(key);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var json = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    json.push(obj);
  }
  
  // Khusus untuk site_settings yang bukan array
  if (key === 'elearning_site_settings' && json.length > 0) {
    return ContentService.createTextOutput(JSON.stringify(json[0])).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var postData = JSON.parse(e.postData.contents);
  var action = postData.action;
  var key = postData.key;
  var value = postData.value;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(key);
  
  if (!sheet) {
    sheet = ss.insertSheet(key);
  }
  
  if (action === 'SAVE_ALL') {
    sheet.clear();
    if (Array.isArray(value) && value.length > 0) {
      var headers = Object.keys(value[0]);
      sheet.appendRow(headers);
      var rows = value.map(function(item) {
        return headers.map(function(h) { return item[h]; });
      });
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    } else if (typeof value === 'object') {
      // Untuk site_settings
      var keys = Object.keys(value);
      sheet.appendRow(keys);
      sheet.appendRow(keys.map(function(k) { return value[k]; }));
    }
  } 
  else if (action === 'APPEND_ROW') {
    var data = sheet.getDataRange().getValues();
    if (data.length === 0 || data[0].length === 0) {
      var headers = Object.keys(value);
      sheet.appendRow(headers);
    }
    var headers = sheet.getDataRange().getValues()[0];
    var newRow = headers.map(function(h) { return value[h] || ""; });
    sheet.appendRow(newRow);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
}
