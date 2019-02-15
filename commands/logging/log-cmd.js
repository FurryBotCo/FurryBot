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
	usage: "log [e/d] <event>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
	
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		
		if(typeof message.gConfig.logging === "undefined") this.db.updateGuild(message.guild.id, this.config.logging.def);
	
		if(["enable","en","e","disable","dis","d"].indexOf(message.args[0]) !== -1) {
			var type = [...message.args];
			type.shift();
			switch(message.args[0]) {
				case "enable":
				case "en":
				case "e":
					// enable
					var a = type.join(" ").toLowerCase();
					if(message.mentions.channels.first()) {
						var a = a.replace(`<#${message.mentions.channels.first().id}>`,"");
						var ch = message.mentions.channels.first();
					}
					var event = a.replace(" ","");
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
					break;
					
				case "disable":
				case "dis":
				case "d":
					// disable
					var a = type.join(" ").toLowerCase();
					if(message.mentions.channels.first()) {
						var a = a.replace(`<#${message.mentions.channels.first().id}>`,"");
						var ch = message.mentions.channels.first(); // lgtm [js/useless-assignment-to-message]
					}
					var event = a.replace(" ","");
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
					break;
			}
		} else {
			var a = message.args.join(" ").toLowerCase();
			if(message.mentions.channels.first()) {
				var a = a.replace(`<#${message.mentions.channels.first().id}>`,"");
				var ch = message.mentions.channels.first();
			}
			var event = a.replace(" ","");
			if(event === "all") {
				var enabledCount = 0,
				disabledCount = 0;
				for(let ev in message.gConfig.logging) {
					var log = message.gConfig.logging[ev];
					if(log.enabled) enabledCount++;
					if(!log.enabled) disabledCount++;
				}
				if(enabledCount > disabledCount) {
					// enable all
					if(!ch) var ch = message.channel;
					for(let ev in message.gConfig.logging) {
						var log = message.gConfig.logging[ev];
						try {
							var j = await this.db.updateGuild(message.guild.id,{logging:{[ev]:{enabled:true,channel:ch}}});
						}catch(e){
							message.reply("There was an internal error while doing this.. My owner(s) have been notified!");
							return this.logger.error(e);
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
				if(!ch) var ch = message.channel;
				this.db.updateGuild(message.guild.id,{logging:{[event]:{channel:ch.id,enabled:true}}});
				return message.reply(`Now logging **${event}** in <#${ch.id}>!`);
			}
		}
	})
};