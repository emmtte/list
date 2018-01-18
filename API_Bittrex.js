//V1.0
// you need a bittrex API key and secret with read account option enabled
// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B6 and the secret in cell B7

function Bittrex(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  var key = sheet.getRange("B6").getValue()
  var secret = sheet.getRange("B7").getValue();

  var baseUrl = 'https://bittrex.com/api/v1.1/';
  var nonce = Math.floor(new Date().getTime()/1000);
  
  uri = baseUrl.concat("account/getbalances?apikey=" + key + "&nonce=" + nonce)
   
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
    "headers": headers
  }
  var response = UrlFetchApp.fetch(uri, params);
  var data = JSON.parse(response.getContentText());
  var array = [];
  //Logger.log(data);
  //{"success":true,"message":"","result":[{"Currency":"ADA","Balance":0.00000000,"Available":0.00000000,"Pending":0.00000000,"CryptoAddress":null},{"Currency":"ARDR",
 
  for(var x in data.result){ array.push({'currency': data.result[x].Currency, 'balance': data.result[x].Balance, 'market': "Bittrex"})
                            }
   
  //Logger.log(array);
  return array;
}

  
