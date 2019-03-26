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
		let type, a, ch, event, disabledCount, enabledCount, log, j;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		
		if(typeof message.gConfig.logging === "undefined") this.db.updateGuild(message.guild.id, this.config.logging.def);
	
		if(["enable","en","e","disable","dis","d"].indexOf(message.args[0]) !== -1) {
			type = [...message.args];
			type.shift();
			switch(message.args[0]) {
			case "enable":
			case "en":
			case "e":
				// enable
				a = type.join(" ").toLowerCase();
				if(message.mentions.channels.first()) {
					a = a.replace(`<#${message.mentions.channels.first().id}>`,"");
					ch = message.mentions.channels.first();
				}
				event = a.replace(" ","");
				if(!this.config.logTypes.includes(event)) return new Error("ERR_INVALID_USAGE");
				if([undefined,null,"",[],{}].includes(message.gConfig.logging[event])) {
					this.logger.log(`Updated logging for ${message.guild.name} (${message.guild.id}), missing logging config`);
					await this.db.updateGuild(message.guild.id,{logging:{[event]:{enabled:false,channel:null}}});
					message.gConfig = await this.db.getGuild(message.guild.id);
				}
				if(!message.gConfig.logging[event].enabled === true) {
					if(!ch) ch = message.channel;
					this.db.updateGuild(message.guild.id,{logging:{[event]:{channel:ch.id,enabled:true}}});
					return message.reply(`Now logging **${event}** in <#${ch.id}>!`);
				} else {
					return message.reply(`The event **${event}** is already being logged in <#${message.gConfig.logging[event].channel}>.`);
				}
				break; // eslint-disable-line no-unreachable
					
			case "disable":
			case "dis":
			case "d":
				// disable
				a = type.join(" ").toLowerCase();
				if(message.mentions.channels.first()) {
					a = a.replace(`<#${message.mentions.channels.first().id}>`,"");
					ch = message.mentions.channels.first();
				}
				event = a.replace(" ","");
				if(!this.config.logTypes.includes(event)) return new Error("ERR_INVALID_USAGE");
				if([undefined,null,"",[],{}].includes(message.gConfig.logging[event])) {
					this.logger.log(`Updated logging for ${message.guild.name} (${message.guild.id}), missing logging config`);
					await this.db.updateGuild(message.guild.id,{logging:{[event]:{enabled:false,channel:null}}});
					message.gConfig = await this.db.getGuild(message.guild.id);
				}
				if(message.gConfig.logging[event].enabled === true) {
					this.db.updateGuild(message.guild.id,{logging:{[event]:{channel:null,enabled:false}}});
					return message.reply(`Stopped logging **${event}**!`);
				} else {
					return message.reply(`The event **${event}** is not currently being logged.`);
				}
				break; // eslint-disable-line no-unreachable
			}
		} else {
			a = message.args.join(" ").toLowerCase();
			if(message.mentions.channels.first()) {
				a = a.replace(`<#${message.mentions.channels.first().id}>`,"");
				ch = message.mentions.channels.first();
			}
			event = a.replace(" ","");
			if(event === "all") {
				enabledCount = 0,
				disabledCount = 0;
				for(let ev in message.gConfig.logging) {
					log = message.gConfig.logging[ev];
					if(log.enabled) enabledCount++;
					if(!log.enabled) disabledCount++;
				}
				if(enabledCount > disabledCount) {
					// enable all
					if(!ch) ch = message.channel;
					for(let ev in message.gConfig.logging) {
						log = message.gConfig.logging[ev];
						try {
							j = await this.db.updateGuild(message.guild.id,{logging:{[ev]:{enabled:true,channel:ch}}});
						}catch(error){
							message.reply("There was an internal error while doing this.. My owner(s) have been notified!");
							return this.logger.error(error);
						}
					}
				} else if (enabledCount < disabledCount) {
					// disable all
				} else {
					// tell user to specify
				}
				return;
			}
			if(!this.config.logTypes.includes(event)) return new Error("ERR_INVALID_USAGE");
			if([undefined,null,"",[],{}].includes(message.gConfig.logging[event])) {
				this.logger.log(`Updated logging for ${message.guild.name} (${message.guild.id}), missing logging config`);
				await this.db.updateGuild(message.guild.id,{logging:{[event]:{enabled:false,channel:null}}});
				message.gConfig = await this.db.getGuild(message.guild.id);
			}
			if(message.gConfig.logging[event].enabled === true && !ch) {
				this.db.updateGuild(message.guild.id,{logging:{[event]:{channel:null,enabled:false}}});
				return message.reply(`Stopped logging **${event}**!`);
			} else {
				if(!ch) ch = message.channel;
				this.db.updateGuild(message.guild.id,{logging:{[event]:{channel:ch.id,enabled:true}}});
				return message.reply(`Now logging **${event}** in <#${ch.id}>!`);
			}
		}
	})
};