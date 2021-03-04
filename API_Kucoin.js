// V1.2
// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B22, secret in cell B23 and passphrase in B24

function Kucoin () {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  var key = sheet.getRange("B22").getValue()
  var secret = sheet.getRange("B23").getValue();
  var passphrase = sheet.getRange("B24").getValue();
    
  var host = 'https://api.kucoin.com';
  var endpoint ='/api/v1/accounts';

  var timestamp = ''+ new Date().getTime();
  var strForSign = timestamp + 'GET' + endpoint;

  var signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, strForSign, secret);
  var encodedPass = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, passphrase, secret);

  var url = host + endpoint;
  var options = {
    'headers' : {
      'KC-API-KEY': key,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-SIGN': Utilities.base64Encode(signature),
      'KC-API-KEY-VERSION': '2',
      'KC-API-PASSPHRASE': Utilities.base64Encode(encodedPass)
    },
    muteHTTPExceptions: true
  }

  var jsondata = UrlFetchApp.fetch(url, options);
  var data   = JSON.parse(jsondata.getContentText());
  var array = [];
  // {msg=Operation succeeded., code=OK, data=[{coinType=KCS, balance=0, freezeBalanceStr=0.0, balanceStr=0.0, freezeBalance=0}, {coinType=XRB, balance=0, freezeBalanceStr=0.0, balanceStr=0.0, freezeBalance=0},
  for(var x in data.data){
  var balance = parseFloat(data.data[x].balance);
    if (balance > 0) {
      var asset = data.data[x].currency;
      array.push({'currency': asset, 'balance': balance, 'market': "Kucoin"});
    }
  }
  return array
}
