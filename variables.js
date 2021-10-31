/**
 * A function that returns every global variable of the project.
 * @returns {Object} the object that contains the global variables for this project
 */
function globalVariables() {
    return Object.freeze({
      "MAIL": {
        "label": "**Label/Sub Label/Crunchbase Events**"
        },
      "SPREADSHEET": {
        "spreadsheetId": "👉 Your Spreadsheet Id Here 👈 ",
        "acquisitionsSheet": "Acquisitions", // The name of the sheet in your spreadsheet that contains acquisitions' signals
        "fundRaisingsSheet": "Fund Raisings" // The name of the sheet in your spreadsheet that contains fund raisings' signals
      }
    });
  };