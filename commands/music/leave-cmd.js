module.exports = (async(self,local)=>{
    
    if(!local.member.voice.channel) return local.message.reply("You must be in a voice channel to use this.");
    if(local.member.voice.channel.members.filter(m=>m.id!==self.user.id).size !== 1) {
        if(!local.gConfig.djRole)  {
            if(!local.member.permissions.has("MANAGE_SERVER")) return local.message.reply(":x: Missing permissions or DJ role.");
        } else {
            try {
                if(!local.member.roles.has(local.gConfig.djRole) && !local.member.permissions.has("MANAGE_SERVER")) return local.message.reply(":x: Missing permissions or DJ role.");
            }catch(e){
                local.message.reply("DJ role is configured incorrectly.");
                if(!local.member.permissions.has("MANAGE_SERVER")) {
                    local.message.reply(":x: Missing permissions.");
                }
            }
        }
    }

    var c = self.voiceConnections.filter(g=>g.channel.guild.id===local.message.guild.id);
    if(c.size === 0) return local.message.reply("I'm not currently playing anything here.");
    if(c.first().speaking.has("SPEAKING")) {
        c.first().disconnect();
        return local.message.reply("Ended playback and left the channel.");
    } else {
        c.first().channel.leave();
        return local.message.reply("Left the voice channel.");
    }
})