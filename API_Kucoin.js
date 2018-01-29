// V1.1
// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B22 and the secret in cell B23

function Kucoin () {
 var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
 var key = sheet.getRange("B22").getValue()
 var secret = sheet.getRange("B23").getValue();
   
 var host = 'https://api.kucoin.com';
 var endpoint ='/v1/account/balance';
 var nonce = '' + Date.parse(new Date());
 var strForSign = endpoint + '/' + nonce + '/';
 var signatureStr = Utilities.base64Encode(strForSign, Utilities.Charset.UTF_8);
 var digest = Utilities.computeHmacSha256Signature(signatureStr, secret, Utilities.Charset.UTF_8);

 // https://pthree.org/2016/02/26/digest-algorithms-in-google-spreadsheets/
 var hexstr = '';
 for (i = 0; i < digest.length; i++) {
   var val = (digest[i]+256) % 256;
   hexstr += ('0'+val.toString(16)).slice(-2);
 }

 var url = host + endpoint;
 var options = {
   'headers' : {
     'KC-API-KEY': key,
     'KC-API-NONCE': nonce,
     'KC-API-SIGNATURE': hexstr
    }
 }

var jsondata = UrlFetchApp.fetch(url, options);
var data   = JSON.parse(jsondata.getContentText());
var array = [];
// {msg=Operation succeeded., code=OK, data=[{coinType=KCS, balance=0, freezeBalanceStr=0.0, balanceStr=0.0, freezeBalance=0}, {coinType=XRB, balance=0, freezeBalanceStr=0.0, balanceStr=0.0, freezeBalance=0},
for(var x in data.data){
var balance = parseFloat(data.data[x].balance);
  if (balance > 0) {
    var asset = data.data[x].coinType
    array.push({'currency': asset, 'balance': balance, 'market': "Kucoin"});
  }
}
return array
}
