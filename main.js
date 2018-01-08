function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{ name : "Update Portfolio", functionName : "Balance" }];
  sheet.addMenu("Cryptos Tools", entries);
};



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
  
  var Full_Balance = Kraken()
  Full_Balance=AddBalance(Full_Balance, Bittrex())
  Full_Balance=AddBalance(Full_Balance, Binance())
  Full_Balance=AddBalance(Full_Balance, Cryptopia())
  //Logger.log(Full_Balance);
  //Logger.log(all)
  var all = Full_Balance
  
  Bitcoin=searchcoin("BTC",market).price_eur
  var coin = []
   
  var wallet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Wallet");
 
  

 //SpreadsheetApp.getActiveSpreadsheet().setSpreadsheetLocale('en_US');
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Market");
  TotalAllEUR = 0; TotalCoinEUR = 0; Top5 = 0; Top30 = 0; Top200 = 0
  ss.setFrozenRows(9);
  ss.clearContents();
  ss.clearNotes();
  ss.getRange('A10:T100').clearContent();
  ss.getRange('A10:T100').clearNote();
  
  //ss.getRange("B9:Q9").setValues([['#','Symbol','Name','Price (BTC)','Price (EUR)',
  //                                 '% 1h','% 24h','% 7d','Balance','Total (EUR)','Buying Quantity','Buying Price BTC','Buying Price EUR',
   //                               'Gain %', 'Gain BTC', 'Gain EUR']]);
  ss.getRange("E10:E").setNumberFormat("0.00€");
  ss.getRange("F10:F").setNumberFormat("0.00000000");
  ss.getRange("G10:G").setNumberFormat("0.00€");
  ss.getRange("H10:H").setNumberFormat("0.00000000");
  ss.getRange("I10:K").setNumberFormat("0.00%;0.00%");
  ss.getRange("L10:L").setNumberFormat("?.??");// à revoir
  ss.getRange("M10:M").setNumberFormat("0.00€");
  ss.getRange("N10:N").setNumberFormat("0.00€");
  ss.getRange("O10:O").setNumberFormat("0.00000000;0.00000000");
  ss.getRange("P10:P").setNumberFormat("0.00€");
  ss.getRange("Q10:Q").setNumberFormat("0.00000000;0.00000000");
  ss.getRange("R10:R").setNumberFormat("0.00%");
  ss.getRange("S10:S").setNumberFormat("0.00%;0.00%");
  //ss.getRange("T10:T").setNumberFormat("0.00 €");
  //ss.getRange("R10:R").setNumberFormat("0.00 %");
  
  
  var a=9
  for (var i = 0; i < all.length; i++) {
   
    a++
    var bal = all[i].balance
      // if (parseFloat(bal) != 0) {
      coin=searchcoin(all[i].currency,market)
      
      //B ==> Rank
      ss.getRange(a,2).setValue(coin.rank); // #
      //C ==> Symbol
      ss.getRange(a,3).setValue(coin.symbol); // Symbol
      //D ==> Name
      ss.getRange(a,4).setValue(coin.name); // Name
      //E ==> Price EUR
      //.getRange(a,5).setValue(parseFloat(coin.market_cap_eur)); // Market Cap
      ss.getRange(a,5).setValue(parseFloat(coin.price_eur)); // Price (EUR)
      //F ==> Price BTC
      ss.getRange(a,6).setValue(parseFloat(coin.price_btc)); // Price (BTC)
      
      //I ==> % H
      ss.getRange(a,9).setValue(parseFloat(coin.percent_change_1h/100)); // % 1h
      //J ==> % D
      ss.getRange(a,10).setValue(parseFloat(coin.percent_change_24h/100)); // % 24h
      //K ==> % W
      ss.getRange(a,11).setValue(parseFloat(coin.percent_change_7d/100)); // % 7d
      //L ==> Balance
      if (bal === parseInt(bal)) {ss.getRange(a,12).setNumberFormat("0")} else {ss.getRange(a,12).setNumberFormat("0.##")}
      ss.getRange(a,12).setValue(bal); // Balance
      ss.getRange(a,12).setNotes([[all[i].market]])
      //M ==> Total EUR
      TotalCoinEUR = parseFloat(bal)*parseFloat(coin.price_eur)
      ss.getRange(a,13).setValue(TotalCoinEUR); // Total (EUR) 
      
      
      if (coin.rank <= 5) {Top5+=TotalCoinEUR}
      if (coin.rank >= 6 && coin.rank <= 30) {Top30+=TotalCoinEUR}
      if (coin.rank >= 31) {Top200+=TotalCoinEUR}
      TotalAllEUR += TotalCoinEUR
}

  
// Do Strategy and Total
var Portfolio = [];
// var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Market"); 
// a revoir les deux lignes suivantes car les donnes sont connus plus haut
var solde = ss.getRange(10, 1, ss.getLastRow()-9, ss.getLastColumn()).getValues();
solde.forEach(function(result) {Portfolio.push({'position':result[1], 'symbol':result[2], 'balance':result[11], 'total':result[12]})});
Logger.log(Portfolio);
euros=0; total = 0; step_1 = 0; step_2 = 0; step_3 = 0; step_4 = 0

for (var i = 0; i < Portfolio.length; i++) {
  if (Portfolio[i].symbol == "EUR") {euros=parseFloat(Portfolio[i].balance)}
  if (Portfolio[i].position <= 5) {step_1+=parseFloat(Portfolio[i].total)}
  if (Portfolio[i].position >= 6 && Portfolio[i].position <= 30) {step_2+=parseFloat(Portfolio[i].total)}
  if (Portfolio[i].position >= 31) {step_3+=parseFloat(Portfolio[i].total)}
  total += parseFloat(Portfolio[i].total)}

//ligne,colonne
//Deposit
var deposit=ss.getRange(5,9).getValue()
ss.getRange(6,9).setValue(deposit/Bitcoin)

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
ss.getRange(5,7).setValue(earnings)
ss.getRange(5,8).setValue(earnings/(deposit+euros))
ss.getRange(6,7).setValue(earnings/Bitcoin)

//Total
ss.getRange(5,12).setValue(deposit+earnings)
ss.getRange(5,13).setValue(earnings/deposit)
ss.getRange(6,12).setValue((earnings+deposit)/Bitcoin)
//Top 5
ss.getRange(5,14).setValue(step_1)
ss.getRange(5,15).setValue(step_1 / total)
ss.getRange(6,14).setValue(step_1/Bitcoin)
//Top 30
ss.getRange(5,16).setValue(step_2)
ss.getRange(5,17).setValue(step_2 / total)
ss.getRange(6,16).setValue(step_2/Bitcoin)
//Top 200
ss.getRange(5,18).setValue(step_3)
ss.getRange(5,19).setValue(step_3 / total)
ss.getRange(6,18).setValue(step_3/Bitcoin)

}
