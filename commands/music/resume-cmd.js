module.exports = {
	triggers: [
        "resume"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Resume whatever was playing",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
    
        if(!message.member.voice.channel) return message.reply("You must be in a voice channel to use this.");
        if(message.member.voice.channel.members.filter(m=>m.id!==client.user.id).size !== 1 && !client.config.developers.includes(message.author.id)) {
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
    
        var c = client.voiceConnections.filter(g=>g.channel.guild.id===message.guild.id);
        if(c.size === 0) return message.reply("Please play something before using this!");
        if(c.first().speaking.has("SPEAKING")) return message.reply("Player is not paused.");
        if(!c.first().dispatcher.paused) return message.reply("Player is not paused.");
        c.first().dispatcher.resume();
        return message.reply(":play_pause: **Resumed**");
    })
};