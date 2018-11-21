module.exports = (async(self,oldMessage,newMessage)=>{
    if(oldMessage.equals(newMessage)) return;
    return require(`${self.config.rootDir}/handlers/events/message.js`)(self,newMessage);
})