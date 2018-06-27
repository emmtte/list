function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{ name : "Update Portfolio", functionName : "Balance" }];
  sheet.addMenu("Cryptos Tools", entries);
};

function coinmarketcap() {
var url = "https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=400";
var response = UrlFetchApp.fetch(url);
var text = response.getContentText();
var obj_array = JSON.parse(text);
return obj_array;
}

function searchcoin(symbol, myArray) {
  var err= {symbol: symbol, name: "???????", rank: "-", market_cap_eur: "0",price_btc: "0",price_eur: "0",price_usd: "0",percent_change_1h: "0",percent_change_24h: "0",percent_change_7d: "0"}
  if (symbol == "USD") {symbol="USDT"} // temorary fix issue #35
  if (symbol == "BQX") {symbol="ETHOS"}
  if (symbol == "CMT") {for (var i=0; i < myArray.length; i++) {if (myArray[i].id == "cybermiles") {return myArray[i];}}}
  for (var i=0; i < myArray.length; i++) {if (myArray[i].symbol == symbol) {return myArray[i];}}
  return err
}

function AddBalance(Full_Balance, Broker_Balance){
outerloop:
for (var i = 0; i < Broker_Balance.length; i++) {
  for (var j = 0; j < Full_Balance.length; j++) {
    if (Full_Balance[j].currency === Broker_Balance[i].currency){
      Full_Balance[j].balance=Full_Balance[j].balance+Broker_Balance[i].balance
      Full_Balance[j].market=Full_Balance[j].market+"\n"+Broker_Balance[i].market+" : "+Broker_Balance[i].balance
      continue outerloop;
    }
  }
  Full_Balance.push({'currency':Broker_Balance[i].currency, 'balance':Broker_Balance[i].balance, 'market':Broker_Balance[i].market}); 
   } 
return Full_Balance
}

function Balance(data){
     
  var Balance = [];
  
  var market = [];
  market = coinmarketcap()
  Bitcoin=searchcoin("BTC",market)
  Bitcoin_EUR=Bitcoin.price_eur
  Bitcoin_USD=Bitcoin.price_usd
  
  var all = []
  
  var Full_Balance = []
  var cfg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  if (!cfg.getRange("B2").isBlank()) {Full_Balance=AddBalance(Full_Balance, Kraken())}
  if (!cfg.getRange("B6").isBlank()) {Full_Balance=AddBalance(Full_Balance, Bittrex())}
  if (!cfg.getRange("B10").isBlank()) {Full_Balance=AddBalance(Full_Balance, Poloniex())}
  if (!cfg.getRange("B14").isBlank()) {Full_Balance=AddBalance(Full_Balance, Binance())}
  if (!cfg.getRange("B18").isBlank()) {Full_Balance=AddBalance(Full_Balance, Cryptopia())}
  if (!cfg.getRange("B22").isBlank()) {Full_Balance=AddBalance(Full_Balance, Kucoin())}
  if (!cfg.getRange("B26").isBlank()) {Full_Balance=AddBalance(Full_Balance, Bitfinex())}
  if (!cfg.getRange("B30").isBlank()) {Full_Balance=AddBalance(Full_Balance, Bitstamp())}
  var all = Full_Balance
  
  var coin = []
 
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Market");
  TotalAllEUR = 0; TotalCoinEUR = 0;
  ss.setFrozenRows(9);
  
  ss.getRange('A10:N100').clearContent();
  ss.getRange('A10:N100').clearNote();
  
  TotalCoin = 0
  for (var i = 0; i < all.length; i++) {
  var bal = all[i].balance
  coin=searchcoin(all[i].currency,market)
  TotalCoin = TotalCoin + parseFloat(bal)*parseFloat(coin.price_usd)
  }
  
  var a=9
  for (var i = 0; i < all.length; i++) {
   
    a++
    var bal = all[i].balance
      coin=searchcoin(all[i].currency,market)
      //B ==> Rank
      ss.getRange(a,2).setValue(coin.rank); // #
      //C ==> Symbol
      ss.getRange(a,3).setValue(coin.symbol); // Symbol
      //D ==> Name
      ss.getRange(a,4).setValue(coin.name); // Name
      //E ==> Price EUR
      ss.getRange(a,5).setValue(parseFloat(coin.price_usd)); // Price (USD)
      //F ==> Price BTC
      ss.getRange(a,6).setValue(parseFloat(coin.price_btc)); // Price (BTC)
      //G ==> % H
      ss.getRange(a,7).setValue(parseFloat(coin.percent_change_1h/100)); // % 1h
      //H ==> % D
      ss.getRange(a,8).setValue(parseFloat(coin.percent_change_24h/100)); // % 24h
      //I ==> % W
      ss.getRange(a,9).setValue(parseFloat(coin.percent_change_7d/100)); // % 7d
      //J ==> Balance
      if (bal === parseInt(bal)) {ss.getRange(a,10).setNumberFormat("0")} else {ss.getRange(a,10).setNumberFormat("0.##")}
      ss.getRange(a,10).setValue(bal); // Balance
      ss.getRange(a,10).setNotes([[all[i].market]])
      //L ==> Total EUR
      TotalCoinUSD = parseFloat(bal)*parseFloat(coin.price_usd)
      ss.getRange(a,12).setValue(TotalCoinUSD); // Total (USD) 
      //M ==> % coin
      TotalCoinEUR = parseFloat(bal)*parseFloat(coin.price_eur)
      ss.getRange(a,13).setValue(TotalCoinEUR); // Total (EUR)
      //K ==> % coin
      TotalCoinUSD / TotalCoin
      ss.getRange(a,11).setValue(TotalCoinUSD/TotalCoin); // % total
}

  
// Total
var Portfolio = [];

var solde = ss.getRange(10, 1, ss.getLastRow()-9, ss.getLastColumn()).getValues();
solde.forEach(function(result) {Portfolio.push({'position':result[1], 'symbol':result[2], 'balance':result[9], 'total_usd':result[11],'total_eur':result[12]})});
//Logger.log(Portfolio);
euros=0; total = 0;
total_EUR=0; total_USD=0
for (var i = 0; i < Portfolio.length; i++) {
  if (Portfolio[i].symbol == "EUR") {euros=parseFloat(Portfolio[i].balance)}
  total_EUR += parseFloat(Portfolio[i].total_eur)
  total_USD += parseFloat(Portfolio[i].total_usd)
  }

//ligne,colonne
//Deposit
if (ss.getRange("I3").getValue() == "€") {FIAT="EUR"}
if (ss.getRange("I3").getValue() == "$") {FIAT="USD"}

deposit=ss.getRange("G3").getValue();

//ss.getRange("G5").setValue(deposit_USD*Bitcoin_EUR/Bitcoin_USD)}
//if (!ss.getRange("G5").isBlank()) {
//deposit_USD=ss.getRange("G5").getValue();
//ss.getRange("G4").setValue(deposit_USD*Bitcoin_USD/Bitcoin_EUR)}

if (FIAT == "EUR") {ss.getRange("G4").setValue(deposit/Bitcoin_EUR)}
if (FIAT == "USD") {ss.getRange("G4").setValue(deposit/Bitcoin_USD)}

//Cryptos
if (FIAT=="EUR") {
ss.getRange("B3").setValue(total_EUR)
ss.getRange("D3").setValue(total_EUR/(total_EUR+deposit))
ss.getRange("B4").setValue(total_EUR/Bitcoin_EUR)
ss.getRange("B3").setNumberFormat("0€")
}
if (FIAT=="USD") {
ss.getRange("B3").setValue(total_USD)
ss.getRange("D3").setValue(total_USD/(total_USD+deposit))
ss.getRange("B4").setValue(total_USD/Bitcoin_USD)
ss.getRange("B3").setNumberFormat("0$")
}

//Euros
if (FIAT=="EUR") {
ss.getRange("E3").setValue(euros)
ss.getRange("F3").setValue(euros/(total_EUR+euros))
ss.getRange("E4").setValue(euros/Bitcoin_EUR)
ss.getRange("E3").setNumberFormat("0€")
}
if (FIAT=="USD") {
ss.getRange("E3").setValue(euros)
ss.getRange("F3").setValue(euros/(total_USD+euros))
ss.getRange("E4").setValue(euros/Bitcoin_USD)
ss.getRange("E3").setNumberFormat("0$")
}

//Gains
if (FIAT=="EUR") {
var earnings=euros+total_EUR-deposit
ss.getRange("J3").setValue(earnings)
ss.getRange("K3").setValue(earnings/deposit)
ss.getRange("J4").setValue(earnings/Bitcoin_EUR)
ss.getRange("J3").setNumberFormat("0€")
}
if (FIAT=="USD") {
var earnings=euros+total_USD-deposit
ss.getRange("J3").setValue(earnings)
ss.getRange("K3").setValue(earnings/deposit)
ss.getRange("J4").setValue(earnings/Bitcoin_USD)
ss.getRange("J3").setNumberFormat("0$")
}

//Total
if (FIAT=="EUR") {
ss.getRange("L3").setValue(deposit+earnings)
ss.getRange("M3").setValue(earnings/deposit)
ss.getRange("L4").setValue((earnings+deposit)/Bitcoin_EUR)
ss.getRange("L3").setNumberFormat("0€")
}
if (FIAT=="USD") {
ss.getRange("L3").setValue(deposit+earnings)
ss.getRange("M3").setValue(earnings/deposit)
ss.getRange("L4").setValue((earnings+deposit)/Bitcoin_USD)
ss.getRange("L3").setNumberFormat("0$")
}

}
