module.exports = (async(self,message)=>{
	if(!message) return;

	self.message = message;
	self.author = self.message.author;
	self.member = self.message.member;
	self.guild = self.message.guild;
	self.channel = self.message.channel;

	if(self.author.bot) return;
	if(self.channel.type === "dm") {
		await self.author.send(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <https://www.furrybot.me> to see our website, <https://docs.furrybot.me> to see my documentation, and join <${self.config.discordSupportInvite}> if you need more help!`);
		return self.log(`Direct message recieved from ${self.author.tag}: ${self.message.content}`);
	}
	if(self.guild.id !== "329498711338123268") return;
	try {
		self.messageCount++;
		self.localMessageCount++;
		self.embed_defaults = {"footer": {text: `Shard ${self.shard !== null?self.shard.id+"/"+self.shard.count+0:"1/1"} - Bot Version ${self.config.bot.version}`}, "author": {"name": self.author.tag,"icon_url": self.author.avatarURL()}, "color": self.randomColor(), "timestamp": self.getCurrentTimestamp()};
		try {
			self.gConfig = await self.db.getGuild(message.guild.id) ||  self.config.guildDefaultConfig;
			self.uConfig = await self.db.getUser(self.message.member.id) || self.config.userDefaultConfig;
			if(self.config.beta) self.gConfig.prefix = "fb!";
		}catch(e){
			self.error(e);
			return;
		}
		self.prefix = self.message.content.startsWith(`<@${self.user.id}>`)?`<@${self.user.id}>`:self.message.content.startsWith(`<@!${self.user.id}>`)?`<@!${self.user.id}>`:self.gConfig.prefix;
		self.args = self.message.content.slice(self.prefix.length).trim().split(/\s+/g);
		self.command = self.args.shift().toLowerCase();
			
		
		if(self.guild.id == "400284026885373962") {
			if(self.config.customCommands.includes(self.command)) {
				self.commandlog(`Command  "${self.command}" ran with arguments "${self.args.join(" ")}" by user ${self.author.tag} (${self.author.id}) in guild ${self.guild.name} (${self.guild.id})`);
			
			switch(self.command) {
				case "updates":
					if(self.member.roles.some(r=>["449444946269700096"].includes(r.id))) {
						self.member.removeRole("449444946269700096");
						return self.message.reply("You will no longer get notified when announcements happen\n(you're missing out! run this command again to start getting notified again)");
					} else {
						self.member.addRole("449444946269700096");
						return self.message.reply("You will be notified when announcements happen\n(run the command again to not be notified)");
					}
					break;
			}
			return;
			}
		}
		if(self.message.content.toLowerCase() == "whatismyprefix") {
			/*if(commandTimeout.whatismyprefix.has(message.author.id) && !config.developers.includes(message.author.id)) {
				self.log(`Command timeout encountered by user ${message.author.tag} (${message.author.id}) on response "whatismyprefix" in guild ${message.guild.name} (${message.guild.id})`);
				return message.reply(`${config.emojis.cooldown}\nPlease wait ${custom.ms(config.commandList.response.whatismyprefix.cooldown)} before using this again!`);
			}
				commandTimeout.whatismyprefix.add(message.author.id);
				setTimeout(() => {commandTimeout.whatismyprefix.delete(message.author.id);}, config.commandList.response.whatismyprefix.cooldown);*/
			var n = await self.r.table("stats").get("commandStats").run();
			var tbl = self.r.table("stats").get("commandStats");
			if(!n.total.whatismyprefix) {
					tbl.update({total:{whatismyprefix:1}}).run();
				} else {
					var l=n.total.whatismyprefix;
					tbl.update({total:{whatismyprefix:parseInt(l)+1}}).run();
				}
			self.commandlog(`Response of "whatismyprefix" triggered by user ${message.author.tag} (${message.author.id}) in guild ${message.guild.name} (${message.guild.id})`);
			return message.reply(`this guilds prefix is **${self.gConfig.prefix}**`);
		}
		if(self.message.content.toLowerCase() == "f" || self.message.content.toLowerCase() == "rip") {
			if(self.gConfig.fResponseEnabled) {
				/*if(commandTimeout.f.has(message.author.id) && !config.developers.includes(message.author.id)) {
					self.log(`Command timeout encountered by user ${message.author.tag} (${message.author.id}) on response "f" in guild ${message.guild.name} (${message.guild.id})`);
					return message.reply(`${config.emojis.cooldown}\nPlease wait ${custom.ms(config.commandList.response.f.cooldown)} before using this again!`);
				}
				commandTimeout.f.add(message.author.id);
				setTimeout(() => {commandTimeout.f.delete(message.author.id);}, config.commandList.response.f.cooldown);*/
				var n = await self.r.table("stats").get("commandStats").run();
				var tbl = self.r.table("stats").get("commandStats");
				if(!n.total.f) {
					tbl.update({total:{f:1}}).run();
				} else {
					var l=n.total.f;
					tbl.update({total:{f:parseInt(l)+1}}).run();
				}
				var f = await self.r.table("stats").get("fCount");
				self.r.table("stats").get("fCount").update({count:parseInt(f.count)+1}).run();
				self.commandlog(`Response of "f" triggered by user ${self.author.tag} (${self.author.id}) in guild ${self.guild.name} (${self.guild.id})`);
				return self.channel.send(`<@!${self.author.id}> has paid respects.\n\nRespects paid total: ${parseInt(f.count)+1}`);
			}
		}
		try {
			if(self.message.content === `<@${self.user.id}>` || self.message.content === `<@!${self.user.id}>`) {
				var c=await require(`${process.cwd()}/commands/${self.config.commandList.fullList["help"].category}/help-cmd.js`)(self);
				if(c instanceof Error) throw c;
			}
		}catch(e){
			self.message.reply(`Error while running command: ${e}`);
			return self.error(`[messageEvent][Guild: ${self.guild.id}]: Command error:\n\tCommand: ${self.command}\n\tSupplied arguments: ${self.args.join(' ')}\n\tServer ID: ${self.guild.id}\n\t${e.stack}`);
		}
		if(!self.message.content.startsWith(self.prefix)) return;
		if(!self.config.commandList.all.includes(self.command)) return;
		if(self.gConfig.deleteCmds) self.message.delete().catch(error=>{ self.channel.send(`Unable to delete command invocation: **${error}**\n\nCheck my permissions.`); });
		if(self.config.commandList.fullList[self.command].userPermissions.length > 0) {
			if(self.config.commandList.fullList[self.command].userPermissions.some(perm => !self.channel.permissionsFor(self.member).has(perm,null,true,true))) {
				var neededPerms = self.config.commandList.fullList[self.command].userPermissions.filter(perm => !self.channel.permissionsFor(self.member).has(perm,null,true,true));
				for(i=0;i<neededPerms.length;i++) {
					var n = await r.table("stats").get("missingPermissions").run();
					self.r.table("stats").get("missingPermissions").update({user:{[neededPerms[i]]:[parseInt(n.user[neededPerms[i]])+1]}}).run();
				}
				var neededPerms = neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms;
				var data={
						"title": "You Don't have permission to do this!",
						"description": `You require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(data, self.embed_defaults);
				var embed = new self.MessageEmbed(data);
				self.debug(`User ${self.author.tag} (${self.author.id}) is missing the permission(s) ${neededPerms} to run the command ${self.command} in guild ${self.guild.name} (${self.guild.id})`);
				return self.channel.send(embed);
			}
		}
		if(self.config.commandList.fullList[self.command].botPermissions.length > 0) {
			if(self.config.commandList.fullList[self.command].botPermissions.some(perm => !self.channel.permissionsFor(self.guild.me).has(perm,null,true,true))) {
				var neededPerms = config.commandList.fullList[command].botPermissions.filter(perm => !self.channel.permissionsFor(self.guild.me).has(perm,null,true,true));
				for(i=0;i<neededPerms.length;i++) {
					var n = await self.r.table("stats").get("missingPermissions").run();
					self.r.table("stats").get("missingPermissions").update({client:{[neededPerms[i]]:[parseInt(n.client[neededPerms[i]])+1]}}).run();
				}
				var neededPerms = neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms;
				var data={
					"title": "I don't have the required permissions!",
					"description": `I require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(data, self.embed_defaults);
				var embed = new self.MessageEmbed(data);
				self.debug(`I am missing the permission(s) ${neededPerms} to run the command ${self.command} in guild ${self.guild.name} (${self.guild.id})`);
				return self.channel.send(embed);
			}
		}
		if(self.config.commandList.fullList[self.command].nsfw === true && !self.channel.nsfw) {
			var data={
				"title": "NSFW commands are not allowed here",
				"description": "NSFW commands must be ran in channels marked as NSFW"
			};
			Object.assign(data, self.embed_defaults);
			var embed = new self.MessageEmbed(data);
			return self.channel.send(embed);
		}
		var isAlias = self.config.commandList.fullList[self.command].alias == "true";
		var n = await self.r.table("stats").get("commandStats").run();
		var tbl = self.r.table("stats").get("commandStats");

		if(Object.keys(self.lang[self.gConfig.locale]).indexOf(self.command) !== -1) {
			self.cmd = self.lang[self.gConfig.locale][self.command];
			self.c = self.cmd[Math.floor(Math.random()*self.cmd.length)];
		}
		try {
		switch(isAlias) {
			case true:
				//alias
				if(self.commandTimeout[self.config.commandList.fullList[self.command].aliasof].has(self.author.id) && !self.config.developers.includes(self.author.id)) {
					self.log(`Command timeout encountered by user ${self.author.tag} (${self.author.id}) on command alias "${self.command}" (aliasof: ${self.config.commandList.fullList[self.command].aliasof}) in guild ${self.guild.name} (${self.guild.id})`);
					return self.message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(self.config.commandList.fullList[self.command].cooldown)} before using this command again!`);
					}
				self.commandTimeout[self.config.commandList.fullList[self.command].aliasof].add(self.author.id);
				self.setTimeout(() => {self.commandTimeout[self.config.commandList.fullList[self.command].aliasof].delete(self.author.id);}, self.config.commandList.fullList[self.command].cooldown);
				if(!n.aliases[self.command]) {
					tbl.update({aliases:{[self.command]:1}}).run();
				} else {
					var l=n.aliases[self.command];
					tbl.update({aliases:{[self.command]:parseInt(l)+1}}).run();
				}
				
				if(!n.total[self.config.commandList.fullList[self.command].aliasof]) {
					tbl.update({total:{[self.config.commandList.fullList[self.command].aliasof]:1}}).run();
				} else {
					var l = n.total[self.config.commandList.fullList[self.command].aliasof];
					tbl.update({total:{[self.config.commandList.fullList[self.command].aliasof]:parseInt(l)+1}}).run();
				}
				self.commandlog(`Command Alias "${self.command}" (aliasof: ${self.config.commandList.fullList[self.command].aliasof}) ran with arguments "${self.args.join(" ")}" by user ${self.author.tag} (${self.author.id}) in guild ${self.guild.name} (${self.guild.id})`);
				var c = await require(`${process.cwd()}/commands/${self.config.commandList.fullList[self.command].category}/${self.config.commandList.fullList[self.command].aliasof}-cmd.js`)(self);
				if(c instanceof Error) throw c;
				break;
				
			default:
				if(self.commandTimeout[self.command].has(self.author.id) && !self.config.developers.includes(self.author.id)) {
					self.log(`Command timeout encountered by user ${self.author.tag} (${self.author.id}) on command "${self.command}" in guild ${self.guild.name} (${self.guild.id})`);
					return self.message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(self.config.commandList.fullList[self.command].cooldown)} before using this command again!`);
				}
				self.commandTimeout[self.command].add(self.author.id);
				setTimeout(() => {self.commandTimeout[self.command].delete(self.author.id);}, self.config.commandList.fullList[self.command].cooldown);
				if(!n.main[self.command]) {
				tbl.update({main:{[self.command]:1}}).run();
				} else {
					var l = n.main[self.command];
					tbl.update({main:{[self.command]:parseInt(l)+1}}).run();
				}
			
				if(!n.total[self.command]) {
					tbl.update({total:{[self.command]:1}}).run();
				} else {
					var l=n.total[self.command];
					tbl.update({total:{[self.command]:parseInt(l)+1}}).run();
				}
				self.commandlog(`Command  "${self.command}" ran with arguments "${self.args.join(" ")}" by user ${self.message.author.tag} (${self.message.author.id}) in guild ${self.message.guild.name} (${self.message.guild.id})`);
				var c=await require(`${process.cwd()}/commands/${self.config.commandList.fullList[self.command].category}/${self.command}-cmd.js`)(self);
				if(c instanceof Error) throw c;
		}
	}catch(e){
		self.error(`e1: ${e.stack}`);
		if(e.message === "INVALID_USAGE") {
			var isAlias = (self.config.commandList.fullList[command].alias == "true");
			var cmd = isAlias?self.config.commandList.fullList[command].aliasof:command;
			var usage = self.config.commandList.fullList[cmd].usage;
			var data = {
				title: ":x: Invalid Command Usage",
				fields: [
					{
						name: "Command",
						value: cmd,
						inline: false
					},{
						name: "Usage",
						value: usage,
						inline: false
					},{
						name: "Arguments Provided",
						value: self.args.join(" ")||"NONE",
						inline: false
					}
				]
			};
			Object.assign(data, self.embed_defaults);
			var embed = new self.MessageEmbed(data);
			return self.channel.send(embed);
		} else {
			//message.reply(`Error while running command: ${e}`);
			//return self.error(`[messageEvent][Guild: ${message.guild.id}]: Command error:\n\tCommand: ${command}\n\tSupplied arguments: ${args.length==0?"none":args.join(" ")}\n\tServer ID: ${message.guild.id}\n\t${e.stack}`);
		}
	}
	}catch(e){
		self.error(`e2: ${e.stack}`);
		//message.reply(`Error while running command: ${e}`);
		//return self.error(`[messageEvent][Guild: ${message.guild.id}]: Command error:\n\tCommand: ${command}\n\tSupplied arguments: ${args.length==0?"none":args.join(" ")}\n\tServer ID: ${message.guild.id}\n\t${e.stack}`);
    }
});