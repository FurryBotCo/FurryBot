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
		"leave"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Make the bot leave the current voice channel",
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

		if (me.voiceState.channelID !== message.member.voiceState.channelID) return message.channel.createMessage(`<@!${message.author.id}, You must be in the same voice channel as me to use this.`);


		let ch;
		try {
			ch = await vc.leave();

			return message.channel.createMessage(`<@!${message.author.id}>, left **${vc.name}**.`);
		} catch (e) {
			let c = message.channel.guild.members.get(this.bot.user.id).voiceState.channelID;
			if (c) message.guild.leaveVoiceChannel(c);
			return message.channel.createMessage("I failed to leave the channel, you may have to manually disconnect me.").catch(err => {
				return message.author.getDMChannel().then(dm => dm.send("I couldn't send messages to the channel you ran this command in, so I direct messaged you.\n\nI failed to leave the channel, you may have to manually disconnect me.\n\n(responding to this will not aide you, you will just get a default help message, you cannot run commands here)"));
			});
		}
	})
};