function HtmlParser() {
  
    // Use https://regex101.com/ to test the regular expressions
    // you don't understand on a downloaded crunchbase email alert.
    const localVariables = {
      "REGEX": {
        "aTag": /<a(.|\s)*?<\/a>/g,
        "url": /(?<=(href=("|')))[\w\d:\/\.\?=-]*/g,
        "textContent": />[\w\s\d-]*</g,
        "unwantedChars": /<|>|\n*/g
      }
    };
  
    function _extractATagsData(message){
      const regex = localVariables["REGEX"];
  
      // We extract every <a> tag and its content.
      const aTags = message.match(regex["aTag"]);
  
      // For each tag, we extract the url it's pointing to and the associated text
      return aTags.map(aTag => {
        try {
          const url = aTag.match(regex["url"])[0];
          const associatedText = aTag.match(regex["textContent"]);
          if (associatedText){
            const joinedText = associatedText.join(" ");
            // We test if there are words or digits in the text
            if (joinedText.match(/\w|\d/)){
              // If so, we remove any other unwanted characters like "<", ">", newlines, ...
              return [url, joinedText.replace(regex["unwantedChars"],"").replace(/\s{2,}/g, " ").trim()];
            }
          };
        } catch(e) {
          Logger.log(e);
          return None;
        }
      }).filter(elem => elem); // Some <a> did not have urls or text. They need to be removed.
    };
  
    function _findCrunchSearchIndexes(aTagsData){
      let result = [];
      aTagsData.forEach((aTagData, index) => {
        const associatedText = aTagData[1];
        if(associatedText.match("GO TO MY SEARCHES")) result.push(index);
      });
      return result;
    };
  
    function _assignCrunchSearchOrigin(aTagsData){
      const crunchSearchIndexes = _findCrunchSearchIndexes(aTagsData);
      let result = [];
  
      for (let i = 0; i < crunchSearchIndexes.length; i++){
        const crunchSearchUrl = aTagsData[crunchSearchIndexes[i]][0];
        let temp;
        if(i === 0){
          temp = aTagsData.slice(0, crunchSearchIndexes[i]);
        } else {
          temp = aTagsData.slice(crunchSearchIndexes[i-1] + 1, crunchSearchIndexes[i]);
        }
        temp.forEach(aTagData => {
          result.push([crunchSearchUrl].concat(aTagData));
        });
      };
      return result;
    };
  
    function extractBusinessData(idsAndMessages){
      return idsAndMessages.map(message => {
        for ([messageId, text] of Object.entries(message)){
          let temp = {};
          temp[messageId] = _assignCrunchSearchOrigin(_extractATagsData(text));
          return temp;
        }
      });
    };
    
    return Object.freeze({
      extractBusinessData
    });
};  