/**
 * Stricto Sensu it's a function but conceptually, we use it like a class. This class contains a few variables but most importantly methods to parse the html content of our crunchbase alert emails.
 * @returns {Object} the frozen object with all the methods related to crunchbase emails' html parsing.
 */
function HtmlParser() {
  
    // Use https://regex101.com/ to test the regular expressions you
    // don't understand on a downloaded crunchbase email alert.
    const localVariables = {
      "REGEX": {
        "aTag": /<a(.|\s)*?<\/a>/g,
        "url": /(?<=(href=("|')))[\w\d:\/\.\?=-]*/g,
        "textContent": />[\w\s\d-]*</g,
        "unwantedChars": /<|>|\n*/g
      }
    };
  
    /**
     * A function that extracts all the relevant data from <a> tags in an email html content in a structured way.
     * @param {String} message a single email's html content
     * @returns {Array} a 2D-Array where each line is data on an <a>...</a> tag extracted from the email. The first element is the url of the a tag, the second one is the associated text.
     * 
     * _extractATagsData("<html>some html content with a bunch of a tags inside</html>")
     * // => [["https://first.extracted.url", "Text associated to the first url"], ["https://second.extracted.url", "Text associated to the second url"], ["https://crunchabse.search.url", "GO TO MY SEARCHES"], ["https://fourth.extracted.url", "Text associated to the fourth url"], ...];
     */
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
  
    /**
     * Some of the a tags extracted from the emails correspond to the Crunchbase Search the events originate from. Explanation: The user designed searches in Crunchbase with a few criteria and set up email alerts fr those searches. The user receives daily email alerts whenever there's a change in his crunchbase search. In those emails, there's always a link to the actual crunchbase search that triggered the email alert.
     * @param {Array} aTagsData the 2D-Array as returned by '_extractATagsData'
     * @returns {Array} the array of indexes of elements in the input that correspond to a link to a crunchbase search url.
     * 
     * _findCrunchSearchIndexes([["https://first.extracted.url", "Text associated to the first url"], ["https://second.extracted.url", "Text associated to the second url"], ["https://crunchabse.search.url", "GO TO MY SEARCHES"], ["https://fourth.extracted.url", "Text associated to the fourth url"], ..., ["https://crunchabse.second.search.url", "GO TO MY SEARCHES"], ...])
     * // => [2, 5, ...];
     */
    function _findCrunchSearchIndexes(aTagsData){
      let result = [];
      aTagsData.forEach((aTagData, index) => {
        const associatedText = aTagData[1];
        if(associatedText.match("GO TO MY SEARCHES")) result.push(index);
      });
      return result;
    };
  
    /**
     * A function that appends the crunchbase search origin to every event extracted from an email. Note that each event necessarily appears before the link to the search it originates from, like so: [event from the first search, other event from the first search, link to the first crunchbase search, events from the second search, link to the second crunchbase search, ..., link to the last crunchbase search mentioned in the email, a bunch of other useless links].
     * @param {Array} aTagsData the 2D-Array as returned by '_extractATagsData'
     * @returns {Array} events from the input array whith their corresponding crunchbase search url (see example below).
     * 
     * _assignCrunchSearchOrigin([["https://first.extracted.url", "Text associated to the first url"], ["https://second.extracted.url", "Text associated to the second url"], ["https://crunchabse.first.search.url", "GO TO MY SEARCHES"], ["https://fourth.extracted.url", "Text associated to the fourth url"], ..., ["https://crunchabse.second.search.url", "GO TO MY SEARCHES"], ...])
     * // => [["https://crunchabse.first.search.url", "https://first.extracted.url", "Text associated to the first url"], ["https://crunchabse.first.search.url", "https://second.extracted.url", "Text associated to the second url"], ["https://crunchabse.second.search.url", "https://fourth.extracted.url", "Text associated to the fourth url"], ... ["https://crunchabse.last.search.url", "https://last.event.url", "Text associated to the last evetnt"]];
     */
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
  
    /**
     * A function that extract every events mentioned in all unread messages in a structured way. See example below.
     * @param {Array} idsAndMessages an array of objects, each one corresponding to a single email. It has the email id as key and its html content as value.
     * @returns {Array} the same array as in the input but instead of the html content as objects' values, it has the extracted <a> tags' data as returned by '_assignCrunchSearchOrigin' applied to '_extractATagsData'
     * 
     * extractBusinessData([{"56386589": "<html>...email content</html>"}, {"6098732": "<html> Some other html content</html>"}, ...]);
     * // => [{"56386589": [["https://crunchbase.first.search.url.from.first.email", "https://crunchabse.first.event.url.from.first.mail", "First event description from first email"]]}, {"6098732": [["https://crunchbase.first.search.url.from.second.email", "https://crunchabse.first.event.url.from.second.mail", "First event description from second email"]]}, ...];
     */
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