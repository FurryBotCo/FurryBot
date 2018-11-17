module.exports = (async(self,local)=>{
    Object.assign(self,local);
    if(!self.member.voice.channel) return self.message.reply("You must be in a voice channel to use this.");
    var c = self.voiceConnections.filter(g=>g.channel.guild.id===self.message.guild.id);
    
    if(c.size !== 0 && c.first().members.filter(m=>m.id!==self.user.id).size !== 0) {
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

    //if(c.size === 0) return self.message.reply("I'm not currently playing anything here.");
    if(c.size !== 0 && c.first().speaking.has("SPEAKING")) {
        //c.first().disconnect();
        //return self.message.reply("Ended playback and left the channel.");
        return self.message.reply("Please end the current playback.");
    } else {
        self.member.voice.channel.join();
        return self.message.reply("Joined the voice channel.");
    }
})