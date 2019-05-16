module.exports = {
	triggers: [
		"spacify"
	],
	userPermissions: [],
	botPermissions: [
		"MANAGE_CHANNELS"
	],
	cooldown: 3e3,
	description: "Replaces dashes with 'spaces' in channel names.",
	usage: "<channel>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		const ch = await message.getChannelFromArgs();
		if(!ch) return message.errorEmbed("INVALID_CHANNEL");
		if(ch.name.indexOf("-") === -1) return message.channel.createMessage("Channel name contains no dashes (-) to replace.");
		await ch.edit({
			name: ch.name.replace(/-/g,"\u2009\u2009")
		},`${message.author.username}#${message.author.discriminator}: Spacify ${ch.name}`);
		return message.channel.createMessage(`Spacified <#${ch.id}>!`);
	})
};