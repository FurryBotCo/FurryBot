module.exports = (async(self,local)=>{
    Object.assign(self,local);
    if(!self.member.voice.channel) return self.message.reply("You must be in a voice channel to use this.");
    if(self.member.voice.channel.members.filter(m=>m.id!==self.user.id).size !== 1) {
        if(!self.gConfig.djRole)  {
            if(!self.member.permissions.has("MANAGE_SERVER")) return self.message.reply(":x: Missing permissions or DJ role.");
        } else {
            try {
                if(!self.member.roles.has(self.gConfig.djRole) && !self.member.permissions.has("MANAGE_SERVER")) return self.message.reply(":x: Missing permissions or DJ role.");
            }catch(e){
                self.message.reply("DJ role is configured incorrectly.");
                if(!self.member.permissions.has("MANAGE_SERVER")) {
                    self.message.reply(":x: Missing permissions.");
                }
            }
        }
    }

    var c = self.voiceConnections.filter(g=>g.channel.guild.id===self.message.guild.id);
    if(c.size === 0) return self.message.reply("Nothing is currently playing.");
    if(c.first().speaking.has("SPEAKING")) {
        c.first().disconnect()
        return self.message.reply("Ended playback and left the channel.");
    } else {
        c.first().channel.leave();
        return self.message.reply("Left the voice channel.");
    }
})