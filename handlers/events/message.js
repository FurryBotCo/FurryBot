module.exports = (async(self,message)=>{
	const event = __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0].split(".")[0] : __filename.split("\\").reverse()[0].split(".")[0],
		  filename = __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0];
	if(!message || !message.guild) return;

	self.mixpanel.track(`bot.events.message`,{
		distinct_id: message.author.id,
		message: message.content,
		authorId: message.author.id,
		authorUsername: message.author.username,
		discriminator: message.author.discriminator,
		tag: message.author.tag,
		filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
	});

	if(message.author.bot) return;

	self.mixpanel.people.set(message.author.id, {
			timestamp: new Date().toISOString(),
			guilds: self.guilds.filter(g=>g.members.has(message.author.id)).map(g=>g.id)
	});
	
	if(message.channel.type === "dm") {
		await message.author.send(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <https://www.furrybot.me> to see our website, <https://docs.furrybot.me> to see my documentation, and join <${self.config.discordSupportInvite}> if you need more help!`);
		return console.log(`[${event}Event][User: ${message.author.id}]:Direct message recieved from ${message.author.tag}: ${message.content}`);
		self.mixpanel.track(`bot.directMessage`,{
			distinct_id: message.author.id,
			timestamp: new Date().toISOString(),
			user: message.author.id,
			messageId: message.id,
			message: message.content,
			filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
		});
	}
	
	const local = {
		message,
		author: message.author,
		member: message.member,
		guild: message.guild,
		channel: message.channel
	};
	
	// temporary - during beta
	if(local.guild.id !== "329498711338123268") return;
	try {
		self.messageCount++;
		self.localMessageCount++;
		local.embed_defaults = {"footer": {text: `Shard ${self.shard !== null?self.shard.id+"/"+self.shard.count+0:"1/1"} - Bot Version ${self.config.bot.version}`}, "author": {"name": self.author.tag,"icon_url": self.author.avatarURL()}, "color": self.randomColor(), "timestamp": self.getCurrentTimestamp()};
		try {
			local.gConfig = await self.db.getGuild(message.guild.id) ||  self.config.guildDefaultConfig;
			localf.uConfig = await self.db.getUser(self.message.member.id) || self.config.userDefaultConfig;
			if(self.config.beta) local.gConfig.prefix = "fb!";
		}catch(e){
			console.error(e);
			return;
		}
		local.prefix = local.message.content.startsWith(`<@${self.user.id}>`)?`<@${self.user.id}>`:local.message.content.startsWith(`<@!${self.user.id}>`)?`<@!${self.user.id}>`:local.gConfig.prefix;
		local.args = local.message.content.slice(local.prefix.length).trim().split(/\s+/g);
		local.command = local.args.shift().toLowerCase();
			
		
		if(local.guild.id == "400284026885373962") {
			if(self.config.customCommands.includes(local.command)) {
				console.commandlog(`[${event}Event][Guild: ${local.guild.id}]: Command  "${local.command}" ran with arguments "${local.args.join(" ")}" by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
			
			switch(local.command) {
				case "updates":
					if(local.member.roles.has("449444946269700096")) {
						local.member.roles.remove("449444946269700096");
						return local.message.reply("You will no longer get notified when announcements happen\n(you're missing out! run this command again to start getting notified again)");
					} else {
						local.member.roles.add("449444946269700096");
						return local.message.reply("You will be notified when announcements happen\n(run the command again to not be notified)");
					}
					break;
			}
			return;
			}
		}
		if(local.message.content.toLowerCase() == "whatismyprefix") {
			if(self.commandTimeout.whatismyprefix.has(local.author.id) && !self.config.developers.includes(local.author.id)) {
				console.log(`[${event}Event][Guild: ${local.guild.id}]: Command timeout encountered by user ${message.author.tag} (${message.author.id}) on response "whatismyprefix" in guild ${message.guild.name} (${message.guild.id})`);
				return message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(self.config.commandList.response.whatismyprefix.cooldown)} before using this again!`);
			}
				self.commandTimeout.whatismyprefix.add(local.author.id);
				setTimeout(() => {self.commandTimeout.whatismyprefix.delete(local.author.id);}, self.config.commandList.response.whatismyprefix.cooldown);
			// whatismyprefix autoresponse stats
			console.commandlog(`[${event}Event][Guild: ${local.guild.id}]: Response of "whatismyprefix" triggered by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
			return local.message.reply(`this guilds prefix is **${local.gConfig.prefix}**`);
		}
		if(["f","rip"].includes(local.message.content.toLowerCase()) && local.gConfig.fResponseEnabled) {
			//if(self.gConfig.fResponseEnabled) {
				if(self.commandTimeout.f.has(local.author.id) && !self.config.developers.includes(local.author.id)) {
					console.log(`[${event}Event][Guild: ${local.guild.id}]: Command timeout encountered by user ${local.author.tag} (${local.author.id}) on response "f" in guild ${local.guild.name} (${local.guild.id})`);
					return message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(self.config.commandList.response.f.cooldown)} before using this again!`);
				}
				self.commandTimeout.f.add(message.author.id);
				setTimeout(() => {self.commandTimeout.f.delete(message.author.id);}, self.config.commandList.response.f.cooldown);
				// f autoresponse stats
				var f = await self.r.table("stats").get("fCount");
				self.r.table("stats").get("fCount").update({count:parseInt(f.count)+1}).run();
				console.commandlog(`[${event}Event][Guild: ${local.guild.id}]: Response of "f" triggered by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
				return local.channel.send(`<@!${local.author.id}> has paid respects.\n\nRespects paid total: ${parseInt(f.count)+1}`);
			//}
		}
		try {
			if(local.message.content === `<@${self.user.id}>` || self.message.content === `<@!${self.user.id}>`) {
				var c = await require(`${process.cwd()}/commands/${self.config.commandList.fullList["help"].category}/help-cmd.js`)(self,local);
				if(c instanceof Error) throw c;
			}
		}catch(e){
			local.message.reply(`Error while running command: ${e}`);
			return console.error(`[${event}Event][Guild: ${local.guild.id}]: Command error:\n\tCommand: ${self.command}\n\tSupplied arguments: ${self.args.join(' ')}\n\tServer ID: ${self.guild.id}\n\t${e.stack}`);
		}
		if(!local.message.content.startsWith(local.prefix)) return;
		if(!self.config.commandList.all.includes(local.command)) return;
		if(local.gConfig.deleteCmds) local.message.delete().catch(error=>local.channel.send(`Unable to delete command invocation: **${error}**\n\nCheck my permissions.`));
		if(self.config.commandList.fullList[local.command].userPermissions.length > 0) {
			if(self.config.commandList.fullList[self.command].userPermissions.some(perm => !self.channel.permissionsFor(self.member).has(perm,null,true,true))) {
				var neededPerms = self.config.commandList.fullList[self.command].userPermissions.filter(perm => !self.channel.permissionsFor(self.member).has(perm,null,true,true));
				self.mixpanel.track(`commands.${local.command}.missingUserPermissions`, {
					distinct_id: local.author.id,
					timestamp: new Date().toISOString(),
					args: local.args.join(" "),
					command: local.command,
					message: local.message.id,
					guild: local.guild.id,
					userId: local.author.id,
					username: local.author.username,
					discriminator: local.author.discriminator,
					tag: local.author.tag,
					displayName: local.member.displayName,
					missingPermissions: neededPerms
					filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
				});
				neededPerms = neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms;
				var data={
						"title": "You Don't have permission to do this!",
						"description": `You require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(data, self.embed_defaults);
				var embed = new self.MessageEmbed(data);
				console.debug(`[DiscordBot:${__filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]}]: User ${local.author.tag} (${local.author.id}) is missing the permission(s) ${neededPerms} to run the command ${local.command} in guild ${local.guild.name} (${local.guild.id})`);
				return local.channel.send(embed);
			}
		}
		if(self.config.commandList.fullList[self.command].botPermissions.length > 0) {
			if(self.config.commandList.fullList[self.command].botPermissions.some(perm => !self.channel.permissionsFor(self.guild.me).has(perm,null,true,true))) {
				var neededPerms = config.commandList.fullList[command].botPermissions.filter(perm => !self.channel.permissionsFor(self.guild.me).has(perm,null,true,true));
				self.mixpanel.track(`commands.${local.command}.missingBotPermissions`, {
					distinct_id: local.author.id,
					timestamp: new Date().toISOString(),
					args: local.args.join(" "),
					command: local.command,
					message: local.message.id,
					guild: local.guild.id,
					userId: local.author.id,
					username: local.author.username,
					discriminator: local.author.discriminator,
					tag: local.author.tag,
					displayName: local.member.displayName,
					missingPermissions: neededPerms,
					filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
				});
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
		if(self.config.commandList.fullList[local.command].nsfw === true && !self.channel.nsfw) {
			self.mixpanel.track(`commands.${local.command}.nonNSFW`, {
				distinct_id: local.author.id,
				timestamp: new Date().toISOString(),
				args: local.args.join(" "),
				command: local.command,
				message: local.message.id,
				guild: local.guild.id,
				userId: local.author.id,
				username: local.author.username,
				discriminator: local.author.discriminator,
				tag: local.author.tag,
				displayName: local.member.displayName,
				missingPermissions: neededPerms,
				filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
			});
			var data={
				"title": "NSFW commands are not allowed here",
				"description": "NSFW commands must be ran in channels marked as NSFW"
			};
			Object.assign(data, local.embed_defaults);
			var embed = new self.Discord.MessageEmbed(data);
			return local.channel.send(embed);
		}
		var isAlias = self.config.commandList.fullList[local.command].alias == "true";

		if(Object.keys(self.lang[local.gConfig.locale]).includes(local.command)) {
			local.cmd = self.lang[local.gConfig.locale][local.command];
			local.c = local.cmd[Math.floor(Math.random()*local.cmd.length)];
		}
		try {
		switch(isAlias) {
			case true:
				//alias
				
				var command = self.config.commandList.fullList[local.command];
				if(self.commandTimeout[command.aliasof].has(local.author.id) && !self.config.developers.includes(local.author.id)) {
					console.log(`[DiscordBot:${__filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]}]: Command timeout encountered by user ${self.author.tag} (${self.author.id}) on command alias "${self.command}" (aliasof: ${command.aliasof}) in guild ${self.guild.name} (${self.guild.id})`);
					return self.message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(command.cooldown)} before using this command again!`);
					}
				self.commandTimeout[command.aliasof].add(local.author.id);
				self.setTimeout(() => {self.commandTimeout[self.config.commandList.fullList[local.command].aliasof].delete(self.author.id);}, command.cooldown);
				self.mixpanel.track(`commands.${command.aliasof}.used`, {
					distinct_id: local.author.id,
					timestamp: new Date().toISOString(),
					args: local.args.join(" "),
					command: local.command,
					alias: true,
					message: local.message.id,
					guild: local.guild.id,
					userId: local.author.id,
					username: local.author.username,
					discriminator: local.author.discriminator,
					tag: local.author.tag,
					displayName: local.member.displayName,
					filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
				});
				
				console.commandlog(`[DiscordBot:${__filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]}]: Command Alias "${local.command}" (aliasof: ${command.aliasof}) ran with arguments "${local.args.join(" ")}" by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
				var c = await require(`${process.cwd()}/commands/${command.category}/${command.aliasof}-cmd.js`)(self,local);
				if(c instanceof Error) throw c;
				break;
				
			default:
				var command = self.config.commandList.fullList[self.command];
				if(self.commandTimeout[local.command].has(self.author.id) && !self.config.developers.includes(self.author.id)) {
					console.log(`Command timeout encountered by user ${local.author.tag} (${local.author.id}) on command "${local.command}" in guild ${local.guild.name} (${local.guild.id})`);
					return local.message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(command.cooldown)} before using this command again!`);
				}
				self.commandTimeout[local.command].add(local.author.id);
				setTimeout(() => {self.commandTimeout[local.command].delete(local.author.id);}, command.cooldown);
				self.mixpanel.track(`commands.${local.command}.used`, {
					distinct_id: local.author.id,
					timestamp: new Date().toISOString(),
					args: local.args.join(" "),
					command: local.command,
					message: local.message.id,
					guild: local.guild.id,
					userId: local.author.id,
					username: local.author.username,
					discriminator: local.author.discriminator,
					tag: local.author.tag,
					displayName: local.member.displayName,
					filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
				});
				console.commandlog(`Command  "${local.command}" ran with arguments "${local.args.join(" ")}" by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
				var c=await require(`${process.cwd()}/commands/${command.category}/${local.command}-cmd.js`)(self,local);
				if(c instanceof Error) throw c;
		}
	}catch(e){
		if(e.message === "ERR_INVALID_USAGE") {
			var isAlias = (self.config.commandList[local.command].alias == "true");
			var cmd = isAlias?self.config.commandList[local.command].aliasof:local.command;
			var usage = self.config.commandList[local.command].usage;
			self.mixpanel.track(`commands.${local.command}.invalidUsage`, {
				distinct_id: local.author.id,
				timestamp: new Date().toISOString(),
				args: local.args.join(" "),
				message: local.message.id,
				guild: local.guild.id,
				userId:local.author.id,
				username: local.author.username,
				discriminator: local.author.discriminator,
				tag: local.author.tag,
				displayName: local.member.displayName,
				filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
			});
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
						value: local.args.join(" ")||"NONE",
						inline: false
					}
				]
			};
			Object.assign(data, local.embed_defaults);
			var embed = new self.Discord.MessageEmbed(data);
			return local.channel.send(embed);
		} else {
			self.mixpanel.track(`bot.error`,{
				distinct_id: local.author.id,
				timestamp: new Date().toISOString(),
				command: local.commands,
				messageId: local.message.id,
				message: local.message.content,
				error: e,
				errorMessage: e.message,
				errorStack: e.stack,
				level: "e1",
				filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
			});
			console.error(`[DiscordBot:${__filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]}][CommandHandler] e1: ${e.stack}`);
		}
	}
	}catch(e){
		self.mixpanel.track(`bot.error`,{
			distinct_id: local.author.id,
			timestamp: new Date().toISOString(),
			command: local.commands,
			messageContent: local.message.id,
			message: local.message.content,
			error: e,
			errorMessage: e.message,
			errorStack: e.stack,
			level: "e2",
			filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
		});
		console.error(`[DiscordBot:${__filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]}][CommandHandler] e2: ${e.stack}`);
		//message.reply(`Error while running command: ${e}`);
		//return self.error(`[messageEvent][Guild: ${message.guild.id}]: Command error:\n\tCommand: ${command}\n\tSupplied arguments: ${args.length==0?"none":args.join(" ")}\n\tServer ID: ${message.guild.id}\n\t${e.stack}`);
    }
});
