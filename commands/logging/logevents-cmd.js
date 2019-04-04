module.exports = {
	triggers: [
		"logevents"
	],
	userPermissions: [
		"manageGuild" // 32
	],
	botPermissions: [],
	cooldown: 1e3,
	description: "List the loggable events, and their current state",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let l, updateFields, log, s, c, embed;
		l = "";
		updateFields = {logging:{}};
		for(let key in message.gConfig.logging) {
			log = message.gConfig.logging[key];
			if(log.enabled) {
				s = message.channel.guild.channels.get(log.channel);
				if(!s) {
					updateFields.logging[key] = {
						channel: null,
						enabled: false
					};
					c = "Disabled (Invalid Channel)";
				} else {
					c = `<#${s.id}>`;
				}
			} else {
				c = "Not Enabled";
			}
			l+=`**${key}** - ${c}\n`;
		}
		embed = {
			title: "Server Logging Settings",
			description: `You can change these with \`${message.gConfig.prefix}log <enable/disable> <event>\`\n${l}`
		};
		Object.assign(embed,message.embed_defaults());
		return message.channel.createMessage({ embed });
	})
};