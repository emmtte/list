function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{ name : "Update Portfolio", functionName : "balnew" }];
  sheet.addMenu("Cryptos Tools", entries);
};
