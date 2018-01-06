// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B6 and the secret in cell B7

function Bittrex(command,payload){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  var key = sheet.getRange("B6").getValue()
  var secret = sheet.getRange("B7").getValue();

  var baseUrl = 'https://bittrex.com/api/v1.1/';
  var nonce = Math.floor(new Date().getTime()/1000);
  
  if (payload) {
    var payloadEncoded = Object.keys(payload).map(function(param) {
      return encodeURIComponent(param) + '=' + encodeURIComponent(payload[param]);
    }).join('&');
  }
  
  uri = baseUrl.concat(command + "?apikey=" + key + "&nonce=" + nonce + "&" + payloadEncoded)
   
  var signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_512, uri, secret);
 
 // Signature copied from comments:
 var apisign = signature.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
 
  var headers = {
    "apisign": apisign
  }
  var params = {
    "method": "get",
    "headers": headers,
    "payload": payload
  }
  var response = UrlFetchApp.fetch(uri, params);
  var data = JSON.parse(response.getContentText());
  return data
}
