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
		"logevents"
	],
	userPermissions: [
		"manageGuild" // 32
	],
	botPermissions: [],
	cooldown: 1e3,
	description: "List the loggable events, and their current state",
	usage: "",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let l, updateFields, log, s, c, embed;
		l = "";
		const events = Object.keys(config.default.loggingConfig);
		for(let key of events) {
			if(typeof message.gConfig.logging[key] === "undefined"){
				await mdb.collection("guilds").findOneAndUpdate({
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
				await mdb.collection("guilds").findOneAndUpdate({
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