module.exports = (async(self,channel)=>{
    if(!channel || !channel.guild || !["text","voice","category"].includes(channel.type)) return;
    var ev = "channelcreated";
    var gConfig = await self.db.getGuild(channel.guild.id);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = channel.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return self.db.updateGuild({logging:{[ev]:{enabled:false,channel:null}}});
    var data = {
        title: `:new: ${typeText} Channel Created`
    }
})