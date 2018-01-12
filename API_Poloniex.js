//V1.0

function Poloniex() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  var key = sheet.getRange("B10").getValue()
  var secret = sheet.getRange("B11").getValue();
  
  var nonce = new Date().getTime() * 1000
  
  var cb = "command=returnCompleteBalances&account=all&nonce="+nonce

  var signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_512, cb, secret);

  var stringSignature = signature.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')

  var headers = {
  "Key" : key,
  "Sign" : stringSignature
  };

  var options = {
   "method" : "post",
   "headers": headers,
   "payload": cb
  };

  var response = UrlFetchApp.fetch("https://poloniex.com/tradingApi", options);
  var data = JSON.parse(response.getContentText());
  var array = [];
//Logger.log(data);
//{KDC={onOrders=0.00000000, available=0.00000000, btcValue=0.00000000}, BBL={onOrders=0.00000000, available=0.00000000, btcValue=0.00000000}
  for(var x in data){ balance=parseFloat(data[x].available);
                               if (balance > 0) {
                                 asset=x
                                 array.push({'currency': asset, 'balance': balance, 'market': "Poloniex"})
                               } 
                             }
//Logger.log(array);
  return array;
}
