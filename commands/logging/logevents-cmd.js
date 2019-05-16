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
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let l, updateFields, log, s, c, embed;
		l = "";
		const events = Object.keys(this.config.default.loggingConfig);
		for(let key of events) {
			if(typeof message.gConfig.logging[key] === "undefined"){
				await this.mdb.collection("guilds").findOneAndUpdate({
					id: message.channel.guild.id
				},{
					$set: {
						[`logging.${key}`]: {
							enabled: false,
							channel: null
						}
					}
				});
				message.gConfig.logging[key] = {
					enabled: false,
					channel: null
				};
			}
		}
		updateFields = {logging:{}};
		for(let key in message.gConfig.logging) {
			if(events.indexOf(key) === -1) {
				await this.mdb.collection("guilds").findOneAndUpdate({
					id: message.channel.guild.id
				},{
					$unset: {
						[`logging.${key}`]: ""
					}
				});
				continue;
			}

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