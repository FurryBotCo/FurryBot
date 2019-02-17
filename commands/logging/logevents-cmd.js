module.exports = {
	triggers: [
		"logevents"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: 1e3,
	description: "List the loggable events, and their current state",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let l, updateFields, log, s, c, data, embed;
		l = "";
		updateFields = {logging:{}};
		for(let key in message.gConfig.logging) {
			log = message.gConfig.logging[key];
			if(log.enabled) {
				s = message.guild.channels.get(log.channel);
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
		data = {
			title: "Server Logging Settings",
			description: `You can change these with \`${message.gConfig.prefix}log <enable/disable> <event>\`\n${l}`
		};
		Object.assign(data,message.embed_defaults());
		embed = new message.client.Discord.MessageEmbed(data);
		return message.channel.send(embed);
	})
};