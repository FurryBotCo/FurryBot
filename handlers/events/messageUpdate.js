module.exports = (async(client,oldMessage,newMessage)=>{
    if(oldMessage.equals(newMessage)) return;
    return require(`${client.config.rootDir}/handlers/events/message.js`)(client,newMessage);
})