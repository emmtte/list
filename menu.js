function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{ name : "Update Portfolio", functionName : "balance" }];
  sheet.addMenu("Cryptos Tools", entries);
};
