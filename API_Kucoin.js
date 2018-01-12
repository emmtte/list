//work in progress not yet available

function Kucoin () {Kucoin
   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
   var key = sheet.getRange("B22").getValue()
   var secret = sheet.getRange("B23").getValue();
   
   var host = 'https://api.kucoin.com';
   var endpoint ='/v1/account/balance';

   var nonce = '' + Date.parse(new Date());
   var strForSign = endpoint + '/' + nonce;
   
   var encoded = Utilities.base64Encode(strForSign, Utilities.Charset.UTF_8);
   var digest = Utilities.computeHmacSha256Signature(encoded, secret, Utilities.Charset.UTF_8);

   var hexstr = '';
   for (i = 0; i < digest.length; i++) {
     var val = (digest[i]+256) % 256;
     hexstr += ('0'+val.toString(16)).slice(-2);
   }

   var url = host + endpoint;
   var options = {
     'method' : 'post',
     'headers' : {
       'KC-API-KEY': key,
       'KC-API-NONCE': nonce,
       'KC-API-SIGNATURE': hexstr
     }
   }
     
   var response = UrlFetchApp.fetch (url, options);
   var data = JSON.parse(response.getContentText());
    
   //Logger.log(data);
   var array = [];
   for(var x in data.result){ array.push({'currency': data.result[x].Currency, 'balance': data.result[x].Balance, 'market': "Kucoin"})}
   //Logger.log(array);                         }
   return array;
}
