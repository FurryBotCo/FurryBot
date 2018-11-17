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

    var c = self.voiceConnections.filter(g=>g.channel.guild.id===self.guild.id);
    if(c.size === 0) return self.message.reply("Please play something before using this!");
    if(c.first().speaking.has("SPEAKING")) return self.message.reply("Player is not paused.");
    if(!c.first().dispatcher.paused) return self.message.reply("Player is not paused.");
    c.first().dispatcher.resume();
    return self.message.reply(":play_pause: **Resumed**");
})