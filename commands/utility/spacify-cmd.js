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
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		const ch = await message.getChannelFromArgs();
		if(!ch) return message.errorEmbed("INVALID_CHANNEL");
		if(ch.name.indexOf("-") === -1) return message.reply("Channel name contains no dashes (-) to replace.");
		await ch.edit({
			name: ch.name.replace(/-/g,"\u2009\u2009")
		},`${message.author.tag}: Spacify ${ch.name}`);
		return message.reply(`Spacified <#${ch.id}>!`);
	})
};