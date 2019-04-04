module.exports = {
	triggers: [
		"modules"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "List the current statuses of modules in your server",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let embed;
		embed = {
			title: "Module Status",
			description: "Enabled/disabled modules on this server.",
			fields: [
				{
					name: "Fun Module",
					value: message.gConfig.funModuleEnabled ? "Enabled" : "Disabled",
					inline: true
				},{
					name: "Moderation Module",
					value: message.gConfig.moderationModuleEnabled ? "Enabled" : "Disabled",
					inline: true
				},{
					name: "Info Module",
					value: message.gConfig.infoModuleEnabled ? "Enabled" : "Disabled",
					inline: true
				},{
					name: "Miscellaneous Module",
					value: message.gConfig.miscModuleEnabled ? "Enabled" : "Disabled",
					inline: true
				},{
					name: "Utility Module",
					value: message.gConfig.utilityModuleEnabled ? "Enabled" : "Disabled",
					inline: true
				},{
					name: "NSFW Module",
					value: message.gConfig.nsfwModuleEnabled ? "Enabled" : "Disabled",
					inline: true
				},{
					name: "F Response",
					value: message.gConfig.fResponseEnabled ? "Enabled" : "Disabled",
					inline: true
				}
			]
		};
		Object.assign(embed,message.embed_defaults());
		return message.channel.createMessage({ embed });
	})
};