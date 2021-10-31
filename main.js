function main() {
    // Instantiate objects
    const labelName = globalVariables()["MAIL"]["label"];
    const myMailService = MailService();
    const myHtmlParser = HtmlParser();
    const mySignals = Signals();
  
    // Process the emails
    const unreadMessages = myMailService.getUnreadMessages(labelName);
    const extractedData = myHtmlParser.extractBusinessData(unreadMessages);
    mySignals.sendSignals(extractedData);
    myMailService.markAsRead(unreadMessages);
};