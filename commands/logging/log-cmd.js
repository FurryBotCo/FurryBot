module.exports=(async (self,local) => {
	
	if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
	
	if(typeof local.gConfig.logging === "undefined") self.db.updateGuild(local.guild.id, self.config.logging.def);

	if(["enable","en","e","disable","dis","d"].indexOf(local.args[0]) !== -1) {
		var type = [...local.args];
		type.shift();
		switch(local.args[0]) {
			case "enable":
			case "en":
			case "e":
				// enable
				var a = type.join(" ").toLowerCase();
				if(local.message.mentions.channels.first()) {
					var a = a.replace(`<#${local.message.mentions.channels.first().id}>`,"");
					var ch = local.message.mentions.channels.first();
				}
				var event = a.replace(" ","");
				if(!self.config.logging.types.includes(event)) return new Error("ERR_INVALID_USAGE");

				if(!local.gConfig.logging[event].enabled === true) {
					if(!ch) ch = local.channel;
					self.db.updateGuild(local.guild.id,{logging:{[event]:{channel:ch.id,enabled:true}}});
					return local.message.reply(`Now logging **${event}** in <#${ch.id}>!`);
				} else {
					return local.message.reply(`The event **${event}** is already being logged in <#${local.gConfig.logging[event].channel}>.`);
				}
				break;
				
			case "disable":
			case "dis":
			case "d":
				// disable
				var a = type.join(" ").toLowerCase();
				if(local.message.mentions.channels.first()) {
					var a = a.replace(`<#${local.message.mentions.channels.first().id}>`,"");
					var ch = local.message.mentions.channels.first(); // lgtm [js/useless-assignment-to-local]
				}
				var event = a.replace(" ","");
				if(!self.config.logging.types.includes(event)) return new Error("ERR_INVALID_USAGE");

				if(local.gConfig.logging[event].enabled === true) {
					self.db.updateGuild(local.guild.id,{logging:{[event]:{channel:null,enabled:false}}});
					return local.message.reply(`Stopped logging **${event}**!`);
				} else {
					return local.message.reply(`The event **${event}** is not currently being logged.`);
				}
				break;
		}
	} else {
		var a = local.args.join(" ").toLowerCase();
		if(local.message.mentions.channels.first()) {
			var a = a.replace(`<#${local.message.mentions.channels.first().id}>`,"");
			var ch = local.message.mentions.channels.first();
		}
		var event = a.replace(" ","");
		if(event === "all") {
			var enabledCount = 0,
			disabledCount = 0;
			for(let ev in local.gConfig.logging) {
				var log = local.gConfig.logging[ev];
				if(log.enabled) enabledCount++;
				if(!log.enabled) disabledCount++;
			}
			if(enabledCount > disabledCount) {
				// enable all
				if(!ch) var ch = local.channel;
				for(let ev in local.gConfig.logging) {
					var log = local.gConfig.logging[ev]; # lgtm [js/useless-assignment-to-local]
					try {
						var j = await self.db.updateGuild(local.guild.id,{logging:{[ev]:{enabled:true,channel:ch}}}); # lgtm [js/unused-local-variable]
					}catch(e){
						local.message.reply("There was an internal error while doing this.. My owner(s) have been notified!");
						return self.logger.error(e);
					}
				}
			} else if (enabledCount < disabledCount) {
				// disable all
			} else {
				// tell user to specify
			}
			return;
		}
		if(!self.config.logging.types.includes(event)) return new Error("ERR_INVALID_USAGE");

		if(local.gConfig.logging[event].enabled === true && !ch) {
			self.db.updateGuild(local.guild.id,{logging:{[event]:{channel:null,enabled:false}}});
			return local.message.reply(`Stopped logging **${event}**!`);
		} else {
			if(!ch) var ch = local.channel;
			self.db.updateGuild(local.guild.id,{logging:{[event]:{channel:ch.id,enabled:true}}});
			return local.message.reply(`Now logging **${event}** in <#${ch.id}>!`);
		}
	}
});
