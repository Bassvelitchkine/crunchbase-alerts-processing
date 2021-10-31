/**
 * Stricto Sensu it's a function but conceptually, we use it like a class. This class contains a few variables but most importantly methods to compute our signals and write them to the spreadsheet.
 * @returns {Object} the frozen object with all the methods related to signal computation.
 */
function Signals() {
    const localVariables = {
      "eventDescriptionColumn": 3,
      "eventUrlColumn": 2
    };
  
    /**
     * A function that classify events extracted from the email either as fund raisings or acquisitions, the only to events we're interested in.
     * @param {Array} eventsList the list of events to classify
     * @returns {Object} an object that contains events classified either as fund raisings or as acquisitions.
     * 
     * _classifyEvents([["30/10/2021", "https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of a Series C fundraising"], ["11/10/2021", "https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of company A acquired by company B"], ...])
     * // => {"fundRaisings": [["30/10/2021", "https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of a Series C fundraising"], ...], "acquisitions": [["11/10/2021", "https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of company A acquired by company B"], ...]};
     */
    function _classifyEvents(eventsList){
      let acquisitions = [];
      let fundRaisings = [];
      
      eventsList.forEach(event => {
        if(event[localVariables["eventDescriptionColumn"]].match(/acquired/g)){
          acquisitions.push(event);
        } else if (event[localVariables["eventDescriptionColumn"]].match(/[sS](eries|eed)/g)) {
          fundRaisings.push(event);
        }
      });
  
      return {
        acquisitions,
        fundRaisings
      }
    };
  
    /**
     * A function that adds the date in the first column of all events passed as input.
     * @param {Array} events the array of all events extracted from the emails
     * @returns {Array} the same array as passed as input but with the current date upserted in the first column
     * 
     * _addDate([["https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of a Series C fundraising"], ["https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of company A acquired by company B"], ...])
     * // => [["30/10/2021", "https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of a Series C fundraising"], ["30/10/2021", "https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of company A acquired by company B"], ...]
     */
    function _addDate(events){
      const date = new Date(Date.now());
      return events.map(event => [date].concat(event));
    }
  
    /**
     * A function that actually computes the signals (almost) ready to be written to the spreasheet. From a list of all events in bulk, it returns every event with its date and cassified either as a fund raising or as an acquisition.
     * @param {Array} processedEmails an array of objects where each object represents an email with its id as key and it's list of extracted business data as value.
     * @returns {Object} an object that contains dated fund raising events on the one hand and dated acquisition events on the other. See example.
     * 
     * _computeSignals([["https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of a Series C fundraising"], ["https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of company A acquired by company B"], ...])
     * // => {"fundRaisings": [["30/10/2021", "https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of a Series C fundraising"], ...], "acquisitions": [["11/10/2021", "https://crunchbase.search.url", "https://crunchbase.event.url", "Event Description of company A acquired by company B"], ...]};
     */
    function _computeSignals(processedEmails){
      var temp = [];
      processedEmails.forEach(mail => {
        for([_, extractedBusinessData] of Object.entries(mail)){
          temp = temp.concat(_addDate(extractedBusinessData));
        }
      });
      return _classifyEvents(temp);
    };
  
    /**
     * A function that takes all events in bulk as value, and writes them down as signals to the proper sheets in the spreadsheet.
     * @param {Array} processedEmails an array of objects where each object represents an email with its id as key and it's list of extracted business data as value.
     */
    function sendSignals(processedEmails){
      const {acquisitions, fundRaisings} = _computeSignals(processedEmails);
      const {eventDescriptionColumn, eventUrlColumn} = localVariables;
      const acquisitionData = computeRichText(acquisitions, eventDescriptionColumn, eventUrlColumn);
      const funRaisingData = computeRichText(fundRaisings, eventDescriptionColumn, eventUrlColumn);
  
      const spreadsheetVar = globalVariables()["SPREADSHEET"];
      writeAfter(spreadsheetVar["acquisitionsSheet"], acquisitionData, richText = true);
      writeAfter(spreadsheetVar["fundRaisingsSheet"], funRaisingData, richText = true);
    }
    
    return Object.freeze({
      sendSignals
    });
};