module.exports = {
	triggers: [
		"invite",
		"inv"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get some invite links for the bot",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let botInvite, data, embed;
		botInvite = await message.client.generateInvite([
			"VIEW_AUDIT_LOG",
			"MANAGE_SERVER",
			"MANAGE_ROLES",
			"MANAGE_CHANNELS",
			"KICK_MEMBERS",
			"BAN_MEMBERS",
			"CHANGE_NICKNAME",
			"MANAGE_NICKNAMES",
			"EMBED_LINKS",
			"READ_MESSAGE_HISTORY",
			"USE_EXTERNAL_EMOJIS",
			"SEND_MESSAGES",
			"ATTACH_FILES",
			"ADD_REACTIONS",
			"VIEW_CHANNEL",
			"CONNECT",
			"MUTE_MEMBERS",
			"MOVE_MEMBERS",
			"SPEAK",
			"DEAFEN_MEMBERS",
			"USE_VAD",
			"PRIORITY_SPEAKER"
		]);
		data = {
			"title": "Invites",
			"fields": [
				{
					name: "Discord Bot",
					value: botInvite,
					inline: false
				},
				{
					name: "Discord Server",
					value: message.client.config.bot.supportInvite,
					inline: false
				}
			]
		};
		
		Object.assign(data, message.embed_defaults());
		
		embed = new message.client.Discord.MessageEmbed(data);
		return message.channel.send(embed);
	})
};