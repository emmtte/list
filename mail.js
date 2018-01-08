//https://developers.google.com/gmail/markup/

function convertSpreadsheetToPdf() {
  
  var email = Session.getActiveUser().getEmail();
  var sheetName = "Market"
  var pdfName = "Market"
  var spreadsheetId = null
  var spreadsheet = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
  spreadsheetId = spreadsheetId ? spreadsheetId : spreadsheet.getId()  
  var sheetId = sheetName ? spreadsheet.getSheetByName(sheetName).getSheetId() : null;  
  var pdfName = pdfName ? pdfName : spreadsheet.getName();
  var parents = DriveApp.getFileById(spreadsheetId).getParents();
  var folder = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  var url_base = spreadsheet.getUrl().replace(/edit$/,'');

  var url_ext = 'export?exportFormat=pdf&format=pdf'   //export as pdf

      // Print either the entire Spreadsheet or the specified sheet if optSheetId is provided
      + (sheetId ? ('&gid=' + sheetId) : ('&id=' + spreadsheetId)) 
      // following parameters are optional...
      + '&size=A4'      // paper size
      + '&portrait=false'    // orientation, false for landscape
      + '&fitw=true'        // fit to width, false for actual size
      + '&sheetnames=false&printtitle=false&pagenumbers=false'  //hide optional headers and footers
      + '&gridlines=false'  // hide gridlines
      + '&fzr=false';       // do not repeat row headers (frozen rows) on each page

  var options = {
    headers: {
      'Authorization': 'Bearer ' +  ScriptApp.getOAuthToken(),
    }
  }
  
  var response = UrlFetchApp.fetch(url_base + url_ext, options);
  var blob = response.getBlob().setName(pdfName + '.pdf');
  folder.createFile(blob);
   
  // Send reservation email to user's address
  var price = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Market").getRange("G5").getValue()
  price=Math.round(price*100)/100
  
  var d = new Date();
  var date = d.toISOString();
  Logger.log (date)
  Logger.log (date.slice(0, -5))
  
  var htmlBody = '<html><body>'+
  '<script type="application/ld+json">'+
'{'+
 ' "@context": "http://schema.org",'+
 ' "@type": "Invoice",'+
 ' "paymentDue": "'+date.slice(0, -5)+'",'+
 ' "provider": {'+
'    "@type": "Organization",'+
 '   "name": "Cryptos Currencies Portfolio"'+
 ' },'+
 ' "totalPaymentDue": {'+
 '   "@type": "PriceSpecification",'+
 '   "price": "€ '+price+'"'+
'  }'+
'}'+
'</script>'+
'</body></html>'



var useraddress = Session.getActiveUser().getEmail();
var subject = 'Portfolio : '+price+' €'

MailApp.sendEmail({
    to: useraddress,
    subject: subject,
    htmlBody: htmlBody,
    attachments: blob
  });
 
  
} 
