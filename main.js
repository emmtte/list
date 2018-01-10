//version 0.23

function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{ name : "Update Portfolio", functionName : "Balance" }];
  sheet.addMenu("Cryptos Tools", entries);
};

function coinmarketcap() {
var url = "https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=300";
//var url = "https://api.coinmarketcap.com/v1/ticker/?convert=EUR";
var response = UrlFetchApp.fetch(url);
var text = response.getContentText();
var obj_array = JSON.parse(text);
return obj_array;
}

function searchcoin(symbol, myArray) {
  var err= {symbol: symbol, name: "???????", rank: "-", market_cap_eur: "0",price_btc: "0",price_eur: "0",percent_change_1h: "0",percent_change_24h: "0",percent_change_7d: "0"}
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
      //Logger.log(Full_Balance[j].currency+" double");
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
  var all = Full_Balance
  
  Bitcoin=searchcoin("BTC",market).price_eur
  var coin = []
   
  var wallet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Wallet");
 
  

 //SpreadsheetApp.getActiveSpreadsheet().setSpreadsheetLocale('en_US');
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Market");
  TotalAllEUR = 0; TotalCoinEUR = 0;
  ss.setFrozenRows(9);
  
  ss.getRange('A10:T100').clearContent();
  ss.getRange('A10:T100').clearNote();
  
  ss.getRange("B9:L9").setValues([['#','Symbol','Name','€','BTC','H','D','W','Balance','Total','%']]);
  ss.getRange("E10:E").setNumberFormat("0.00€");
  ss.getRange("F10:F").setNumberFormat("0.00000000");
  ss.getRange("G10:I").setNumberFormat("0.00%;0.00%");
  //ss.getRange("J10:J").setNumberFormat("?.??");
  ss.getRange("K10:K").setNumberFormat("0.00€");
  ss.getRange("L10:L").setNumberFormat("0.00%;0.00%");
  
   
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
      ss.getRange(a,5).setValue(parseFloat(coin.price_eur)); // Price (EUR)
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
      //K ==> Total EUR
      TotalCoinEUR = parseFloat(bal)*parseFloat(coin.price_eur)
      ss.getRange(a,11).setValue(TotalCoinEUR); // Total (EUR) 
      //L ==> % coin
      TotalAllEUR += TotalCoinEUR
      //.getRange("J5").getValue()
}

  
// Do Strategy and Total
var Portfolio = [];
// var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Market"); 
// a revoir les deux lignes suivantes car les donnes sont connus plus haut
var solde = ss.getRange(10, 1, ss.getLastRow()-9, ss.getLastColumn()).getValues();
solde.forEach(function(result) {Portfolio.push({'position':result[1], 'symbol':result[2], 'balance':result[9], 'total':result[10]})});
//Logger.log(Portfolio);
euros=0; total = 0; step_1 = 0; step_2 = 0; step_3 = 0; step_4 = 0

for (var i = 0; i < Portfolio.length; i++) {
  if (Portfolio[i].symbol == "EUR") {euros=parseFloat(Portfolio[i].balance)}
  if (Portfolio[i].position <= 5) {step_1+=parseFloat(Portfolio[i].total)}
  if (Portfolio[i].position >= 6 && Portfolio[i].position <= 30) {step_2+=parseFloat(Portfolio[i].total)}
  if (Portfolio[i].position >= 31) {step_3+=parseFloat(Portfolio[i].total)}
  total += parseFloat(Portfolio[i].total)}

//ligne,colonne
//Deposit
var deposit=ss.getRange("G5").getValue()
ss.getRange("G6").setValue(deposit/Bitcoin)

//Cryptos
ss.getRange(5,2).setValue(total)
ss.getRange(5,4).setValue(total/(total+euros))
ss.getRange(6,2).setValue(total/Bitcoin)

//Euros
ss.getRange(5,5).setValue(euros)
ss.getRange(5,6).setValue(euros/(total+euros))
ss.getRange(6,5).setValue(euros/Bitcoin)

//Gains
var earnings=euros+total-deposit
ss.getRange(5,10).setValue(earnings)
ss.getRange(5,11).setValue(earnings/(deposit+euros))
ss.getRange(6,10).setValue(earnings/Bitcoin)

//Total
ss.getRange(5,12).setValue(deposit+earnings)
ss.getRange(5,13).setValue(earnings/deposit)
ss.getRange(6,12).setValue((earnings+deposit)/Bitcoin)
}
