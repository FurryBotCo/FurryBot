module.exports=(async (self,local) => {
	Object.assign(self,local);
	if(self.args.length < 1) return new Error("ERR_INVALID_USAGE");
	
	if(typeof self.gConfig.logging === "undefined") self.db.updateGuild(self.guild.id, self.config.logging.def);

	if(["enable","en","e","disable","dis","d"].indexOf(self.args[0]) !== -1) {
		var type = [...self.args];
		type.shift();
		switch(self.args[0]) {
			case "enable":
			case "en":
			case "e":
				// enable
				var a = type.join(" ").toLowerCase();
				if(self.message.mentions.channels.first()) {
					var a = a.replace(`<#${self.message.mentions.channels.first().id}>`,"");
					var ch = self.message.mentions.channels.first();
				}
				var event = a.replace(" ","");
				if(!self.config.logging.types.includes(event)) return new Error("ERR_INVALID_USAGE");

				if(!self.gConfig.logging[event].enabled === true) {
					if(!ch) ch = self.channel;
					self.db.updateGuild(self.guild.id,{logging:{[event]:{channel:ch.id,enabled:true}}});
					return self.message.reply(`Now logging **${event}** in <#${ch.id}>!`);
				} else {
					return self.message.reply(`The event **${event}** is already being logged in <#${self.gConfig.logging[event].channel}>.`);
				}
				break;
				
			case "disable":
			case "dis":
			case "d":
				// disable
				var a = type.join(" ").toLowerCase();
				if(self.message.mentions.channels.first()) {
					var a = a.replace(`<#${self.message.mentions.channels.first().id}>`,"");
					var ch = self.message.mentions.channels.first();
				}
				var event = a.replace(" ","");
				if(!self.config.logging.types.includes(event)) return new Error("ERR_INVALID_USAGE");

				if(self.gConfig.logging[event].enabled === true) {
					self.db.updateGuild(self.guild.id,{logging:{[event]:{channel:null,enabled:false}}});
					return self.message.reply(`Stopped logging **${event}**!`);
				} else {
					return self.message.reply(`The event **${event}** is not currently being logged.`);
				}
				break;
		}
	} else {
		var a = self.args.join(" ").toLowerCase();
		if(self.message.mentions.channels.first()) {
			var a = a.replace(`<#${self.message.mentions.channels.first().id}>`,"");
			var ch = self.message.mentions.channels.first();
		}
		var event = a.replace(" ","");
		console.log(event);
		if(!self.config.logging.types.includes(event)) return new Error("ERR_INVALID_USAGE");

		if(self.gConfig.logging[event].enabled === true && !ch) {
			self.db.updateGuild(self.guild.id,{logging:{[event]:{channel:null,enabled:false}}});
			return self.message.reply(`Stopped logging **${event}**!`);
		} else {
			if(!ch) ch = self.channel;
			self.db.updateGuild(self.guild.id,{logging:{[event]:{channel:ch.id,enabled:true}}});
			return self.message.reply(`Now logging **${event}** in <#${ch.id}>!`);
		}
	}
});