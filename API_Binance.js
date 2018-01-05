// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B14 and the secret in cell B15

function BinanceBalance () {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
     var key = sheet.getRange("B14").getValue()
     var secret = sheet.getRange("B15").getValue();
     
     //var nonce = Math.floor(new Date().getTime()/1000)    
    var nonce = new Date () * 1;
    var postdata = "timestamp=" + nonce 
    var signature = BinanceSignature (secret, postdata);
    
    var path = "/api/v3/account?" + postdata + "&signature=" + signature;
    var url = "https://www.binance.com" + path;
    var options = {
    method: 'get',
    headers: {'X-MBX-APIKEY': key}
    };

    var response = UrlFetchApp.fetch (url, options);
    var data = JSON.parse(response.getContentText());
  
  //Logger.log(data.balances);
  
  var array = [];
  
  //{balances=[{asset=BTC, free=0.00, locked=0.00}, {asset=LTC, free=0.00, locked=0.00000000},
  for(var x in data.balances){ balance=parseFloat(data.balances[x].free);
                               if (balance > 0) {
                                 asset=data.balances[x].asset
                                 if (asset=="IOTA") {asset="MIOTA"}
                                 if (asset=="YOYO") {asset="YOYOW"}
                                 if ((asset!="BCD") & (asset!="BCX") & (asset!="SBTC") & (asset!="BTG")) {
                                 array.push({'currency': asset, 'balance': balance, 'market': "Binance"})}
                               } 
                             }
  //Logger.log(array);
  return array;
}
