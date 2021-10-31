/**
 * Stricto Sensu it's a function but conceptually, we use it like a class. This class contains a few variables but most importantly methods to interact witht the user's gmail mail box.
 * @returns {Object} the frozen object with all the methods related to gmail interactions.
 */
function MailService() {

    /**
     * A function to retrieve every unread crunchbase email alert from the user's mailbox (gmail only). 
     * @param {String} labelName the root to the label that contains all crunchbase email alerts, and only them.
     * @returns {Array} an array that contains objects that contain mail ids as keys and their associated html content as values
     * 
     * getUnreadMessages("Label/SubLabel/Crunchabse Alerts")
     * // => [{"56386589": "<html>...email content</html>"}, {"6098732": "<html> Some other html content</html>"}, ...];
     */
    function getUnreadMessages(labelName){
        const label = GmailApp.getUserLabelByName(labelName);
        const threads = label.getThreads().filter(thread => thread.isUnread());
        return threads.map(thread => thread.getMessages()).flat().map(message => {
        let temp = {};
        temp[message.getId()] = message.getBody();
        return temp;
        });
    }

    /**
     * A function that marks all the email to process as read (so that they will be processed one time, and one time only).
     * @param {Array} unreadMessages an array that contains objects that contain all the unread messages to process. Mail ids as keys and their html content as values. The object is as returned by the function 'getUnreadMessages'
     */
    function markAsRead(unreadMessages){
        unreadMessages.forEach(mail => {
        for([mailId, _] of Object.entries(mail)){
            GmailApp.getMessageById(mailId).markRead()
        }
        });
    };

    return Object.freeze({
        getUnreadMessages,
        markAsRead
    });
};