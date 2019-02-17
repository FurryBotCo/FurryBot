module.exports = {
	triggers: [
		"leave"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Make the bot leave the current voice channel",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let c;
		if(!message.member.voice.channel) return message.reply("You must be in a voice channel to use message.client.");
		if(message.member.voice.channel.members.filter(m=>m.id!==message.client.user.id).size !== 1) {
			if(!message.gConfig.djRole)  {
				if(!message.member.permissions.has("MANAGE_SERVER")) return message.reply(":x: Missing permissions or DJ role.");
			} else {
				try {
					if(!message.member.roles.has(message.gConfig.djRole) && !message.member.permissions.has("MANAGE_SERVER")) return message.reply(":x: Missing permissions or DJ role.");
				}catch(error){
					message.reply("DJ role is configured incorrectly.");
					if(!message.member.permissions.has("MANAGE_SERVER")) {
						message.reply(":x: Missing permissions.");
					}
				}
			}
		}
    
		c = message.client.voiceConnections.filter(g=>g.channel.guild.id===message.guild.id);
		if(c.size === 0) return message.reply("I'm not currently playing anything here.");
		if(c.first().speaking.has("SPEAKING")) {
			c.first().disconnect();
			return message.reply("Ended playback and left the channel.");
		} else {
			c.first().channel.leave();
			return message.reply("Left the voice channel.");
		}
	})
};