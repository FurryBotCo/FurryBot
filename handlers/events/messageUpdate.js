module.exports = (async(client,oldMessage,newMessage)=>{
    if(!oldMessage || !newMessage || oldMessage.content === newMessage.content) return;
    try{
        require(`${client.config.rootDir}/handlers/events/message.js`)(client,newMessage);
    }catch(e){}
    if(!newMessage.channel.guild || !["text","voice","category"].includes(newMessage.channel.type)) return;
    var ev = "messageupdated";
    var gConfig = await client.db.getGuild(newMessage.guild.id).catch(err=>client.config.defaultGuildSettings);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newChannel.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(newMessage.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
})