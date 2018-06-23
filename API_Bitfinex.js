// API_Bitfinex.js
// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B26 and the secret in cell B27
    
function Bitfinex () {
    function bytesToHex(data) {
        return data.map(function(e) {
            var v = (e < 0 ? e + 256 : e).toString(16);
            return v.length == 1 ? "0" + v : v;
        }).join("");
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    const apiKey = sheet.getRange("B26").getValue();
    const apiSecret = sheet.getRange("B27").getValue();
    const apiPath = "v2/auth/r/wallets";
    const nonce = Date.now().toString();
    const body = { "type": "price" };
    const rawBody = JSON.stringify(body);
    var signature = "/api/" + apiPath + nonce + rawBody;
    signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_384, signature, apiSecret);
    signature = bytesToHex(signature);
    const url = "https://api.bitfinex.com/" + apiPath;
    const options = {
      method: 'POST',
      contentType: "application/json",
      headers: {
        'bfx-nonce': nonce,
        'bfx-apikey': apiKey,
        'bfx-signature': signature
      },
      payload: rawBody
    };
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());  
  var array = [];
  for(var x in data){ balance=parseFloat(data[x][2]);
    if (balance > 0) {
      asset=data[x][1]
      if (asset=="IOT") {asset="MIOTA"}
      if (asset=="QSH") {asset="QASH"}
      if (asset=="DAT") {asset="DATA"}
      if (asset=="SPK") {asset="SPANK"}
      if (asset=="MNA") {asset="MANA"}
      if (asset=="DSH") {asset="DASH"}        
      array.push({'currency': asset, 'balance': balance, 'market': "Bitfinex"})}
    } 
  
  return array;
}
