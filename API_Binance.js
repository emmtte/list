// API_Binance.js V1.2

// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B14 and the secret in cell B15

function Binance(){
  var Full_Binance_Balance = [];
  Full_Binance_Balance=AddBalance(Full_Binance_Balance, BinanceSpot());
  Full_Binance_Balance=AddBalance(Full_Binance_Balance, BinanceEarn());
  Full_Binance_Balance=AddBalance(Full_Binance_Balance, BinanceCrossMargin());
  Full_Binance_Balance=AddBalance(Full_Binance_Balance, BinanceIsolatedMargin());
  Full_Binance_Balance=AddBalance(Full_Binance_Balance, BinanceFutures());
  Full_Binance_Balance=AddBalance(Full_Binance_Balance, BinanceCollateral());
  return Full_Binance_Balance;
}


function BinanceSpot() {
  var data = BinanceSetup("/sapi/v1/accountSnapshot", "type=SPOT&", "api");
  var balances = data.snapshotVos[data.snapshotVos.length-1].data.balances;
  //Logger.log(balances);
  var array = [];
  
  //{balances=[{asset=BTC, free=0.00, locked=0.00}, {asset=LTC, free=0.00, locked=0.00000000},
  for(var x in balances)
  {
    var balance = parseFloat(balances[x].free) + parseFloat(balances[x].locked);
    if (balance > 0) {
      asset=balances[x].asset;
      array.push({'currency': asset, 'balance': balance, 'market': "Binance Spot"});
    }
  }
  //Logger.log(array);
  return array;
}

function BinanceCrossMargin() {
  var data = BinanceSetup("/sapi/v1/margin/account", "", "api");
  var balances = data.userAssets;
  //Logger.log(balances);
  var array = [];
  
  //{"asset":"XRP","borrowed":"0.00000000","free":"1.00000000","interest":"0.00000000","locked":"0.00000000","netAsset":"1.00000000"}
  for(var x in balances)
  {
    var balance = parseFloat(balances[x].netAsset);
    if (balance != 0) {
      asset=balances[x].asset;
      array.push({'currency': asset, 'balance': balance, 'market': "Binance Cross Margin"});
    }
  }
  //Logger.log(array);
  return array;
}

function BinanceIsolatedMargin() {
  var data = BinanceSetup("/sapi/v1/margin/isolated/account", "", "api");
  var balances = data.assets;
  //Logger.log(balances);
  var array = [];
  
  //{"asset":"XRP","borrowed":"0.00000000","free":"1.00000000","interest":"0.00000000","locked":"0.00000000","netAsset":"1.00000000"}
  for(var x in balances)
  {
    var balance1 = parseFloat(balances[x].baseAsset.netAsset);
    var balance2 = parseFloat(balances[x].quoteAsset.netAsset);
    if (balance1 != 0 || balance2 != 0) {
      asset1=balances[x].baseAsset.asset;
      asset2=balances[x].quoteAsset.asset;
      array.push({'currency': asset1, 'balance': balance1, 'market': "Binance Isolated Margin"});
      array.push({'currency': asset2, 'balance': balance2, 'market': "Binance Isolated Margin"});
    }
  }
  //Logger.log(array);
  return array;
}

function BinanceCollateral() {
  var data = BinanceSetup("/sapi/v1/futures/loan/wallet", "", "api");
  var array = [];
  var collaterals = data.crossCollaterals;
  for(var x in collaterals)
  {
    var collateralAmount = parseFloat(collaterals[x].locked);
    if (collateralAmount != 0) {
      array.push({'currency': collaterals[x].collateralCoin, 'balance': collateralAmount, 'market': "Binance Collateral"});
      array.push({'currency': "USDT", 'balance': -1*parseFloat(collaterals[x].loanAmount), 'market': "Binance Collateral"});
    }
  }
  return array;
}

function BinanceFutures() {
  var data = BinanceSetup("/fapi/v2/account", "", "fapi");
  var array = [];
  array.push({'currency': "USDT", 'balance': parseFloat(data.totalMarginBalance), 'market': "Binance USDT-margined Futures"});

  data = BinanceSetup("/dapi/v1/balance", "", "dapi");
  for(var x in data)
  {
    var balance = parseFloat(data[x].availableBalance);
    if (balance != 0) {
      asset=data[x].asset;
      array.push({'currency': asset, 'balance': balance, 'market': "Binance Coin-Margined Futures"});
    }
  }
  
  //Logger.log(array);
  return array;
}

function BinanceEarn() {
  var data = BinanceSetup("/sapi/v1/lending/union/account", "", "api");
  var balances = data.positionAmountVos;
  //Logger.log(balances);
  var array = [];
  
  //{balances=[{asset=BTC, amount=0.00, amountInBTC=0.00, amountInUSDT}, {asset=BTC, amount=0.00, amountInBTC=0.00, amountInUSDT},
  for(var x in balances)
  {
    var balance = parseFloat(balances[x].amount);
    if (balance != 0) {
      asset=balances[x].asset;
      array.push({'currency': asset, 'balance': balance, 'market': "Binance Earn"});
    }
  }
  //Logger.log(array);
  return array;
}

function BinanceSetup(baseAPI, params, urlPrefix) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    var key = sheet.getRange("B14").getValue();
    var secret = sheet.getRange("B15").getValue();
    
    var timestamp = Number(new Date().getTime()).toFixed(0); 
    var postdata = params + "timestamp=" + timestamp;
    
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.setHMACKey(secret, "TEXT");
    shaObj.update(postdata);
    var signature = shaObj.getHMAC("HEX");
       
    var path = baseAPI + "?" + postdata + "&signature=" + signature;
    var url = "https://"+urlPrefix+".binance.com" + path;
    var options = {
      method: 'get',
      headers: {'X-MBX-APIKEY': key},
      muteHTTPExceptions: 'true'
    };

    var response = UrlFetchApp.fetch (url, options);
    return JSON.parse(response.getContentText());
}
