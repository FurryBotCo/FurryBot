module.exports = (async(client,channel,user) => {
    if(user.id !== client.user.id) return;
    setTimeout((ch)=>{
        if(ch.typing) {
            ch.stopTyping(ch.typingCount);
            client.logger.debug(`Manually stopped typing in ${ch.name} (${ch.id}) of ${ch.guild.name} (${ch.guild.id})`);
        }
    },7e3,channel)
})