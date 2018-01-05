function coinmarketcap() {
var url = "https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=400";
//var url = "https://api.coinmarketcap.com/v1/ticker/?convert=EUR";
var response = UrlFetchApp.fetch(url);
var text = response.getContentText();
var obj_array = JSON.parse(text);
return obj_array;
}
