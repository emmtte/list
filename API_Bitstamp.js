// I assume that key and secret API are in the "Config" spreadsheet. The key is in cell B30, the secret in cell B31 and customer_id in B32 cell

function Bitstamp() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    var key = sheet.getRange("B30").getValue()
    var secret = sheet.getRange("B31").getValue();
    var customer_id = sheet.getRange("B32").getValue();

    var nonce = new Date().getTime().toString();

    message = nonce + customer_id + key

    var shaObj = new jsSHA("SHA-256", "BYTES");
    shaObj.setHMACKey(secret, "BYTES");
    shaObj.update(message);
    var signature = shaObj.getHMAC("HEX").toString().toUpperCase();
    Logger.log(signature)

    var url = "https://www.bitstamp.net/api/v2/balance/"
    cb = "key=" + key + "&signature=" + signature + "&nonce=" + nonce;

    var formData = {
        "key": key,
        "signature": signature,
        "nonce": nonce
    };

    var options = {
        "method": "post",
        "muteHttpExceptions": true,
        "payload": formData
    };

    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    var array = [];
    for (var x in data) {
        substring = "_balance";
        if (x.indexOf(substring) !== -1) {
            var balance = parseFloat(data[x]);
            if (balance > 0) {
                data[x].replace(substring, "")
                var asset = x
                if (asset == "bch" + substring) {
                    asset = "BCH"
                }
                if (asset == "btc" + substring) {
                    asset = "BTC"
                }
                if (asset == "xrp" + substring) {
                    asset = "XRP"
                }
                if (asset == "ltc" + substring) {
                    asset = "LTC"
                }
                if (asset == "usd" + substring) {
                    asset = "USD"
                }
                if (asset == "eth" + substring) {
                    asset = "ETH"
                }
                array.push({'currency': asset, 'balance': balance, 'market': "Bitstamp"});
            }
        }
    }
    // Logger.log(array);
    return array
}
