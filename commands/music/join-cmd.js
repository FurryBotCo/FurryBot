const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

module.exports = {
	triggers: [
		"join"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "Make the bot join your current voice channel",
	usage: "",
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function (message) {
		const sub = await functions.processSub(module.exports, message, this);
		if (sub !== "NOSUB") return sub;

		if (!message.member.voiceState.channelID) return message.channel.createMessage(`<@!${message.author.id}>, you must be in a voice channel to use this.`);

		let me = message.channel.guild.members.get(this.bot.user.id);
		let vc = message.channel.guild.channels.get(message.member.voiceState.channelID);

		if (me.voiceState.channelID === message.member.voiceState.channelID) return message.channel.createMessage(`<@!${message.author.id}, I'm already in this voice channel.`);


		let ch;
		try {
			ch = await vc.join();

			await ch.updateVoiceState(false, true);

			return message.channel.createMessage(`<@!${message.author.id}>, joined **${vc.name}**.`);
		} catch (e) {
			let c;
			try {
				c = message.channel.guild.members.get(this.bot.user.id).voiceState.channelID;
				if (c) message.guild.leaveVoiceChannel(c);
				return message.channel.createMessage("I failed to join the channel, make sure I have permissions to join the channel, and that the channel isn't full, or that I have administrator so I can bypass any restrictions.").catch(err => {
					return message.author.getDMChannel().then(dm => dm.send("I couldn't send messages to the channel you ran this command in, so I direct messaged you.\n\nI failed to join the channel, make sure I have permissions to join the channel, and that the channel isn't full, or that I have administrator so I can bypass any restrictions.\n\n(responding to this will not aide you, you will just get a default help message, you cannot run commands here)")).catch(err => null);
				});
			} catch (e) {}
		}

		/*let c;
		if(!message.member.voice.channel) return message.channel.createMessage("You must be in a voice channel to use this.");
		c = this.voiceConnections.filter(g => g.channel.guild.id===message.channel.guild.id);
        
		if(c.size !== 0 && c.first().members.filter(m => m.id!==this.bot.user.id).size !== 0) {
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
    
		//if(c.size === 0) return message.channel.createMessage("I'm not currently playing anything here.");
		if(c.size !== 0 && c.first().speaking.has("SPEAKING")) {
			//c.first().disconnect();
			//return message.channel.createMessage("Ended playback and left the channel.");
			return message.channel.createMessage("Please end the current playback.");
		} else {
			message.member.voice.channel.join();
			return message.channel.createMessage("Joined the voice channel.");
		}*/
	})
};