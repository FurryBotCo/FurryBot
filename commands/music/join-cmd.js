module.exports = {
	triggers: [
        "join"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "Make the bot join your current voice channel",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
    
        if(!message.member.voice.channel) return message.reply("You must be in a voice channel to use this.");
        var c = client.voiceConnections.filter(g=>g.channel.guild.id===message.guild.id);
        
        if(c.size !== 0 && c.first().members.filter(m=>m.id!==client.user.id).size !== 0) {
            if(!message.gConfig.djRole)  {
                if(!message.member.permissions.has("MANAGE_SERVER")) return message.reply(":x: Missing permissions or DJ role.");
            } else {
                try {
                    if(!message.member.roles.has(message.gConfig.djRole) && !message.member.permissions.has("MANAGE_SERVER")) return message.reply(":x: Missing permissions or DJ role.");
                }catch(e){
                    message.reply("DJ role is configured incorrectly.");
                    if(!message.member.permissions.has("MANAGE_SERVER")) {
                        message.reply(":x: Missing permissions.");
                    }
                }
            }
        }
    
        //if(c.size === 0) return message.reply("I'm not currently playing anything here.");
        if(c.size !== 0 && c.first().speaking.has("SPEAKING")) {
            //c.first().disconnect();
            //return message.reply("Ended playback and left the channel.");
            return message.reply("Please end the current playback.");
        } else {
            message.member.voice.channel.join();
            return message.reply("Joined the voice channel.");
        }
    })
};