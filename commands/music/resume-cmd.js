module.exports = {
	triggers: [
		"resume"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Resume whatever was playing",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
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
		if(c.size === 0) return message.channel.createMessage("Please play something before using this!");
		if(c.first().speaking.has("SPEAKING")) return message.channel.createMessage("Player is not paused.");
		if(!c.first().dispatcher.paused) return message.channel.createMessage("Player is not paused.");
		c.first().dispatcher.resume();
		return message.channel.createMessage(":play_pause: **Resumed**");
	})
};