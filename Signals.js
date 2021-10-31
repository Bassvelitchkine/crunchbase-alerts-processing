function Signals() {
    const localVariables = {
      "eventDescriptionColumn": 3,
      "eventUrlColumn": 2
    };
  
    function _classifyEvents(linksList){
      let acquisitions = [];
      let fundRaisings = [];
      
      linksList.forEach(link => {
        if(link[localVariables["eventDescriptionColumn"]].match("acquired")){
          acquisitions.push(link);
        } else if (link[localVariables["eventDescriptionColumn"]].match(/[sS](eries|eed)/g)) {
          fundRaisings.push(link);
        }
      });
  
      return {
        acquisitions,
        fundRaisings
      }
    };
  
    function _addDate(messageLinks){
      const date = new Date(Date.now());
      return messageLinks.map(link => [date].concat(link));
    }
  
    function _computeSignals(processedEmails){
      var temp = [];
      processedEmails.forEach(mail => {
        for([_, extractedBusinessData] of Object.entries(mail)){
          temp = temp.concat(_addDate(extractedBusinessData));
        }
      });
      return _classifyEvents(temp);
    };
  
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