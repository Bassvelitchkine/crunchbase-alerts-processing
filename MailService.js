function MailService() {
    function getUnreadMessages(labelName){
        const label = GmailApp.getUserLabelByName(labelName);
        const threads = label.getThreads().filter(thread => thread.isUnread());
        return threads.map(thread => thread.getMessages()).flat().map(message => {
        let temp = {};
        temp[message.getId()] = message.getBody();
        return temp;
        });
    }

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