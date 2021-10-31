/**
 * A function to write data in a sheet after all the data that's already been written in it. It also writes the rich text if there's any in the array. And if there's rich text, it's necessarily in the last column of the 2D-Array.
 * @param {String} sheetName the name of the sheet where to write the data
 * @param {Array} data the 2D-Array of data to append to the sheet
 * @param {Boolean} richText a boolean that tells whether there's rich text (look at GAS' documentation to know more about rich text) to compute in the array. Default is false.
 * 
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


/**
 * A function that computes rich text from an array that contains anything but also text descriptions and associated urls to compute rich texts (look at GAS' documentation to know more about rich text) from.
 * @param {Array} data the 2D-Array to compute rich text values from
 * @param {Number} textColumn the column that contains text associated to urls to compute rich text values from
 * @param {Number} urlColumn the column that contains url to compute rich text values from
 * @returns {Array} the same array as the input array but where columns used to compute rich text values have been removed and a last column with rich text values has been added.
 * 
 * computeRichText([["stuff", ..., "text to compute rich text", ... "url to compute rich text", ...], ["other stuff", ..., "text to compute rich text", ... "url to compute rich text", ...], ...])
 * // => [["stuff", ..., computed rich text], ["other stuff",  ..., computed rich text], ...];
 */
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