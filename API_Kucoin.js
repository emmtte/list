// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B14 and the secret in cell B15

function Kucoin () {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  var key = sheet.getRange("B14").getValue()
  var secret = sheet.getRange("B15").getValue();
     
  var nonce = Math.floor(new Date().getTime())    
  var postdata = "timestamp=" + nonce 
     
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.setHMACKey(secret, "TEXT");
  shaObj.update(postdata);
  var signature = shaObj.getHMAC("HEX");
     
  var path = api + "?" + postdata + "&signature=" + signature;
  var url = "https://www.binance.com" + path;
  var options = {
    method: 'get',
    headers: {'X-MBX-APIKEY': key}
    };

  var response = UrlFetchApp.fetch (url, options);
  var data = JSON.parse(response.getContentText());
  return data
}
