// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B18 and the secret in cell B19

function Cryptopia () {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  var key = sheet.getRange("B18").getValue()
  var secret = sheet.getRange("B19").getValue();
  var digest = "{}";

var rawHash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,digest));
Logger.log(rawHash+"  "+rawHash);

url="https://www.cryptopia.co.nz/Api/GetBalance"
var url_encoded = encodeURIComponent(url).toLowerCase()
Logger.log(url_encoded);

var nonce = Math.floor(new Date().getTime()/1000);

signature=key+"POST"+url_encoded+nonce+rawHash
Logger.log("signature "+signature);
  
var shaObj = new jsSHA("SHA-256", "TEXT");
shaObj.setHMACKey(secret, "B64");
shaObj.update(signature);
var hmac = shaObj.getHMAC("B64");

Logger.log("signed: "+hmac);

header_value="amx "+key+":"+hmac+":"+nonce
Logger.log("header_value: "+header_value);
var options = {
method: 'POST',
headers: {
         'Content-Type': 'application/json; charset=utf-8',
         'Authorization': header_value },
payload: '{}'
         }

var response = UrlFetchApp.fetch (url, options);
var data = JSON.parse(response.getContentText());
Logger.log(data)  


  var array = [];
 
  //{Error=null, Data=[{Status=OK, Address=null, HeldForTrades=0, Symbol=1337, Unconfirmed=0, PendingWithdraw=0, Total=0, Available=0, BaseAddress=null, CurrencyId=331, StatusMessage=null}, {Status=OK, Address=null, HeldForTrades=0, Symbol=21M, Unconfirmed=0, PendingWithdraw=0, Total=0, Available=0, BaseAddress=, CurrencyId=573, StatusMessage=null}
  for(var x in data.Data){ balance=parseFloat(data.Data[x].Total);
                               if (balance > 0) {
                                 asset=data.Data[x].Symbol
                                 array.push({'currency': asset, 'balance': balance, 'market': "Cryptopia"})
                               } 
                             }
  Logger.log(array);
  return array;
}
