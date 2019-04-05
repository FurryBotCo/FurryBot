module.exports = {
	triggers: [
		"invite",
		"inv"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get some invite links for the bot",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let botPerms, perms, embed;
		perms = [
			"KICK_MEMBERS",          // 2
			"BAN_MEMBERS",           // 4
			"MANAGE_CHANNELS",       // 16
			"MANAGE_GUILD",         // 32
			"ADD_REACTIONS",         // 64
			"VIEW_AUDIT_LOG",        // 128
			"PRIORITY_SPEAKER",      // 256
			"READ_MESSAGES",         // 1024
			"SEND_MESSAGES",         // 2048
			"MANAGE_MESSAGES",       // 8192
			"EMBED_LINKS",           // 16384
			"ATTACH_FILES",          // 32768
			"READ_MESSAGE_HISTORY",  // 65536
			"USE_EXTERNAL_EMOJIS",   // 262144
			"CONNECT",               // 1048576
			"SPEAK",                 // 2097152
			"MUTE_MEMBERS",          // 4194304
			"DEAFEN_MEMBERS",        // 8388608
			"MOVE_MEMBERS",          // 16777216
			"USE_VAD",               // 33554432
			"CHANGE_NICKNAME",       // 67108864
			"MANAGE_NICKNAMES",      // 134217728
			"MANAGE_ROLES"          // 268435456
		];
		botPerms = perms.map(p => this.config.Permissions.constant[p]).reduce((a,b) => a + b);
		embed = {
			"title": "Invites",
			"fields": [
				{
					name: "Discord Bot",
					value: `https://discordapp.com/oauth2/authorize?client_id=${this.bot.user.id}&scope=bot&permissions=${botPerms}`,
					inline: false
				},
				{
					name: "Discord Server",
					value: this.config.bot.supportInvite,
					inline: false
				}
			]
		};
		
		Object.assign(embed, message.embed_defaults());
		return message.channel.createMessage({ embed });
	})
};