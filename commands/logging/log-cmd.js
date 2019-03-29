module.exports = {
	triggers: [
		"log"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: .5e3,
	description: "Enable or disable the logging of an event",
	usage: "[e/d] <event>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		const event = message.args[0].replace(/\s/g,"").toLowerCase();
		if(event === "list") return message.reply(`The valid logging types are:\n**${this.config.logTypes.join("**, **")}**.`);
		if(!this.config.logTypes.includes(event)) return message.reply(`Invalid log type, you can do \`${message.gConfig.prefix}log list\` to list all available types!`);
		let ch;
		if(message.args.length === 1) ch = message.channel;
		else {
			const t = await message.getChannelFromArgs(1);
			if(!t) return message.errorEmbed("INVALID_CHANNEL");
			else ch = t;
		}
		if(!message.gConfig.logging) {
			this.logger.warn(`Updating logging for ${message.guild.name} (${message.guild.id}), missing log config.`);
			this.trackEvent({
				group: "ERRORS",
				guildId: message.guild.id,
				userId: message.author.id,
				channelId: message.channel.id,
				messageId: message.id,
				event: "client.errors.missingLoggingConfig",
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					},
				}
			});
			await this.mdb.collection("guilds").findOneAndUpdate({
				id: message.guild.id
			},{
				$set: {
					logging: this.config.default.loggingConfig
				}
			});
			message.gConfig.logging = this.config.default.loggingConfig;
		}

		if(!message.gConfig.logging[event]) {
			this.logger.warn(`Updating logging for ${message.guild.name} (${message.guild.id}), missing log event.`);
			this.trackEvent({
				group: "ERRORS",
				guildId: message.guild.id,
				userId: message.author.id,
				channelId: message.channel.id,
				messageId: message.id,
				event: "client.errors.missingLoggingEvent",
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					},
					event
				}
			});
			await this.mdb.collection("guilds").findOneAndUpdate({
				id: message.guild.id
			},{
				$set: {
					[`logging.${event}`]: this.config.default.loggingConfig[event]
				}
			});
			message.gConfig.logging[event] = this.config.default.loggingConfig[event];
		}

		if(message.gConfig.logging[event].enabled) {
			const cl = message.guild.channels.get(message.gConfig.logging[event].channel);
			if(cl.id === ch.id) {
				await this.mdb.collection("guilds").findOneAndUpdate({
					id: message.guild.id
				},{
					$set: {
						[`logging.${event}`]: {
							enabled: false,
							channel: null
						}
					}
				});
				return message.reply(`Disabled logging of ${event} in <#${ch.id}>.`);
			} else {
				await this.mdb.collection("guilds").findOneAndUpdate({
					id: message.guild.id
				},{
					$set: {
						[`logging.${event}`]: {
							enabled: true,
							channel: ch.id
						}
					}
				});
				return message.reply(`Enabled logging of ${event} in <#${ch.id}>.`);
			}
		} else {
			await this.mdb.collection("guilds").findOneAndUpdate({
				id: message.guild.id
			},{
				$set: {
					[`logging.${event}`]: {
						enabled: true,
						channel: ch.id
					}
				}
			});
			return message.reply(`Enabled logging of ${event} in <#${ch.id}>.`);
		}

		return message.reply("Not sure how you got here.."); // eslint-disable no-unreachable
	})
};