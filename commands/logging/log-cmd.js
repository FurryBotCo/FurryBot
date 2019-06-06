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
		"log"
	],
	userPermissions: [
		"manageGuild" // 32
	],
	botPermissions: [],
	cooldown: .5e3,
	description: "Enable or disable the logging of an event",
	usage: "[e/d] <event>",
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
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		const event = message.args[0].replace(/\s/g,"").toLowerCase();
		if(event === "list") return message.channel.createMessage(`<@!${message.author.id}>, The valid logging types are:\n**${config.logTypes.join("**, **")}**.`);
		if(!config.logTypes.includes(event)) return message.channel.createMessage(`<@!${message.author.id}>, Invalid log type, you can do \`${message.gConfig.prefix}log list\` to list all available types!`);
		let ch;
		if(message.args.length === 1) ch = message.channel;
		else {
			const t = await message.getChannelFromArgs(1);
			if(!t) return message.errorEmbed("INVALID_CHANNEL");
			else ch = t;
		}
		if(!message.gConfig.logging) {
			this.logger.warn(`Updating logging for ${message.channel.guild.name} (${message.channel.guild.id}), missing log config.`);
			this.trackEvent({
				group: "ERRORS",
				guildId: message.channel.guild.id,
				userId: message.author.id,
				channelId: message.channel.id,
				messageId: message.id,
				event: "client.errors.missingLoggingConfig",
				properties: {
					bot: {
						version: config.bot.version,
						beta: config.beta,
						alpha: config.alpha,
						server: this.os.hostname()
					},
				}
			});
			await mdb.collection("guilds").findOneAndUpdate({
				id: message.channel.guild.id
			},{
				$set: {
					logging: config.defaults.loggingConfig
				}
			});
			message.gConfig.logging = config.defaults.loggingConfig;
		}

		if(!message.gConfig.logging[event]) {
			this.logger.warn(`Updating logging for ${message.channel.guild.name} (${message.channel.guild.id}), missing log event.`);
			this.trackEvent({
				group: "ERRORS",
				guildId: message.channel.guild.id,
				userId: message.author.id,
				channelId: message.channel.id,
				messageId: message.id,
				event: "client.errors.missingLoggingEvent",
				properties: {
					bot: {
						version: config.bot.version,
						beta: config.beta,
						alpha: config.alpha,
						server: this.os.hostname()
					},
					event
				}
			});
			await mdb.collection("guilds").findOneAndUpdate({
				id: message.channel.guild.id
			},{
				$set: {
					[`logging.${event}`]: config.defaults.loggingConfig[event]
				}
			});
			message.gConfig.logging[event] = config.defaults.loggingConfig[event];
		}

		if(message.gConfig.logging[event].enabled) {
			const cl = message.channel.guild.channels.get(message.gConfig.logging[event].channel);
			if(cl.id === ch.id) {
				await mdb.collection("guilds").findOneAndUpdate({
					id: message.channel.guild.id
				},{
					$set: {
						[`logging.${event}`]: {
							enabled: false,
							channel: null
						}
					}
				});
				return message.channel.createMessage(`<@!${message.author.id}>, Disabled logging of ${event} in <#${ch.id}>.`);
			} else {
				await mdb.collection("guilds").findOneAndUpdate({
					id: message.channel.guild.id
				},{
					$set: {
						[`logging.${event}`]: {
							enabled: true,
							channel: ch.id
						}
					}
				});
				return message.channel.createMessage(`<@!${message.author.id}>, Enabled logging of ${event} in <#${ch.id}>.`);
			}
		} else {
			await mdb.collection("guilds").findOneAndUpdate({
				id: message.channel.guild.id
			},{
				$set: {
					[`logging.${event}`]: {
						enabled: true,
						channel: ch.id
					}
				}
			});
			return message.channel.createMessage(`<@!${message.author.id}>, Enabled logging of ${event} in <#${ch.id}>.`);
		}

		return message.channel.createMessage(`<@!${message.author.id}>, Not sure how you got here..`); // eslint-disable-line no-unreachable
	})
};