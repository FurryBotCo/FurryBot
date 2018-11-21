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
					var ch = local.message.mentions.channels.first();
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
		console.log(event);
		if(!self.config.logging.types.includes(event)) return new Error("ERR_INVALID_USAGE");

		if(local.gConfig.logging[event].enabled === true && !ch) {
			self.db.updateGuild(local.guild.id,{logging:{[event]:{channel:null,enabled:false}}});
			return local.message.reply(`Stopped logging **${event}**!`);
		} else {
			if(!ch) ch = local.channel;
			self.db.updateGuild(local.guild.id,{logging:{[event]:{channel:ch.id,enabled:true}}});
			return local.message.reply(`Now logging **${event}** in <#${ch.id}>!`);
		}
	}
});