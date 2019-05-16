module.exports = {
	triggers: [
		"stop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Stop whatever is playing",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let c;
		if(!message.member.voice.channel) return message.channel.createMessage("You must be in a voice channel to use this.");
		if(message.member.voice.channel.members.filter(m => m.id!==this.bot.user.id).size !== 1 && !this.config.developers.includes(message.author.id)) {
			if(!message.gConfig.djRole)  {
				if(!message.member.permissions.has("manageServer")) return message.channel.createMessage(":x: Missing permissions or DJ role.");
			} else {
				try {
					if(!message.member.roles.has(message.gConfig.djRole) && !message.member.permissions.has("manageServer")) return message.channel.createMessage(":x: Missing permissions or DJ role.");
				}catch(error){
					message.channel.createMessage("DJ role is configured incorrectly.");
					if(!message.member.permissions.has("manageServer")) {
						message.channel.createMessage(":x: Missing permissions.");
					}
				}
			}
		}
    
		c = this.voiceConnections.filter(g => g.channel.guild.id===message.channel.guild.id);
		if(c.size === 0) return message.channel.createMessage("Nothing is currently playing.");
		if(c.first().speaking.has("SPEAKING")) {
			c.first().disconnect();
			return message.channel.createMessage("Ended playback and left the channel.");
		} else {
			c.first().channel.leave();
			return message.channel.createMessage("Left the voice channel.");
		}
	})
};