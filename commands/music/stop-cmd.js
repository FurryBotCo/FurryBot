module.exports = {
	triggers: [
		"stop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Stop whatever is playing",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let c;
		if(!message.member.voice.channel) return message.reply("You must be in a voice channel to use this.");
		if(message.member.voice.channel.members.filter(m => m.id!==this.user.id).size !== 1 && !this.config.developers.includes(message.author.id)) {
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
    
		c = this.voiceConnections.filter(g => g.channel.guild.id===message.guild.id);
		if(c.size === 0) return message.reply("Nothing is currently playing.");
		if(c.first().speaking.has("SPEAKING")) {
			c.first().disconnect();
			return message.reply("Ended playback and left the channel.");
		} else {
			c.first().channel.leave();
			return message.reply("Left the voice channel.");
		}
	})
};