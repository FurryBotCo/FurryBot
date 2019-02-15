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
	run: (async function(message) {
	
		var botInvite = await this.generateInvite([
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
		var data = {
			"title": "Invites",
			"fields": [
				{
					name: "Discord Bot",
					value: botInvite,
					inline: false
				},
				{
					name: "Discord Server",
					value: this.config.bot.supportInvite,
					inline: false
				}
			]
		};
		
		Object.assign(data, message.embed_defaults());
		
		var embed = new this.Discord.MessageEmbed(data);
		return message.channel.send(embed);
	})
};