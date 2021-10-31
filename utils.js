/**
 * A function to write data in a sheet after all the data that's already been written in it.
 * @param {String} sheetName the name of the sheet where to write the data
 * @param {Array} data the 2D-Array of data to append to the sheet
 */
 function writeAfter(sheetName, data, richText = false){
    const spreadsheetId = globalVariables()["SPREADSHEET"]["spreadsheetId"];
    sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    const lastRow = sheet.getDataRange().getLastRow();
    sheet.insertRowAfter(lastRow);
    sheet.getRange(lastRow + 1, 1, data.length, data[0].length).setValues(data);

    if(richText){
      const lastColIndex = data[0].length - 1
      const richTextValues = data.map(line => [line[lastColIndex]]);
      sheet
      .getRange(lastRow + 1, data[0].length, data.length, 1)
      .setRichTextValues(richTextValues);
    }   
};

function computeRichText(data, textColumn, urlColumn){
  return data.map(line => {
    const richText = 
      SpreadsheetApp
      .newRichTextValue()
      .setText(line[textColumn])
      .setLinkUrl(line[urlColumn])
      .build();

    return line.filter((_, index) => index !== textColumn && index !== urlColumn).concat([richText]);
  });
};