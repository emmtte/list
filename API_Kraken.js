// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B2 and the secret in cell B3

function Kraken () {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    var key = sheet.getRange("B2").getValue()
    var secret = sheet.getRange("B3").getValue();
    //var baseUrl = 'https://bittrex.com/api/v1.1/';
    //var nonce = Math.floor(new Date().getTime()/1000);  
  
    var path = "/0/private/Balance";
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
    json = response.getContentText ();
    
    //Logger.log(json)
    //return {"error":[],"result":{"ZEUR":"1981.6538","XXBT":"0.0670597660"}}
    var parsed = JSON.parse(json);
    var array = [];
  for(var x in parsed.result){
  y=x.substring(1,4);if (y == "ASH") {y="DASH"};if (y == "XBT") {y="BTC"};if (y == "NO") {y="GNO"};if (y == "OS") {y="EOS"};if (y == "CH") {y="BCH"}
  balance=parseFloat(parsed.result[x])
  if (balance!=0) {
  array.push({'currency': y, 'balance': balance, 'market': "Kraken"})}}
  
  return array
    
}
