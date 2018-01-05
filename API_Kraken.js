// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B2 and the secret in cell B3

function Kraken(path,payload){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  var key = sheet.getRange("B2").getValue()
  var secret = sheet.getRange("B3").getValue();
  
  
  var nonce = new Date () * 1000;
  var postdata = "nonce=" + nonce;

  var sha256obj = new jsSHA ("SHA-256", "BYTES");
  sha256obj.update (nonce + postdata);
  var hash_digest = sha256obj.getHash ("BYTES");
  var sha512obj = new jsSHA ("SHA-512", "BYTES");
  sha512obj.setHMACKey (secret, "B64");
  sha512obj.update (path);
  sha512obj.update (hash_digest);
  signature=sha512obj.getHMAC ("B64");
  
  var url = "https://api.kraken.com" + path;
  var options = {
    method: 'post',
    headers: {
        'API-Key': key,
        'API-Sign': signature
    },
    payload: postdata
    };

  var response = UrlFetchApp.fetch (url, options);
  var data = JSON.parse(response.getContentText());
  return data  
}
