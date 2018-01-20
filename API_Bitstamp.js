//Need beta users
//Work in progress

// BETA V0.3
// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B30, the secret in cell B31 and customer_id in B32 cell

function Bitstamp() {
 var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
 var key = sheet.getRange("B30").getValue()
 var secret = sheet.getRange("B31").getValue();
 var customer_id = sheet.getRange("B32").getValue();
  
 var nonce = new Date().getTime().toString();

 message = nonce + customer_id + key

 var shaObj = new jsSHA("SHA-256", "BYTES");
 shaObj.setHMACKey(secret, "BYTES");
 shaObj.update(message);
 var hmac = shaObj.getHMAC("HEX").toString().toUpperCase();;

var url = "http://www.bitstamp.net/api/v2/balance/"
cb = "key=" + key + "&signature=" + signature + "&nonce=" + nonce;

//var options = { method: 'post' };

var options = {
  "method" : "post",
  "payload": cb,
  "muteHttpExceptions" : true
 };

var response = UrlFetchApp.fetch (url, options);
var data = JSON.parse(response.getContentText());   

Logger.log(data);
  
//please give me result (data from log)

}
