module.exports = (async(self,message) => {
	if(!self || !self.db) return;
	const event = __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0].split(".")[0] : __filename.split("\\").reverse()[0].split(".")[0],
		  filename = __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0];
	if(!message || !message.guild) return;
	self.stats.messagesSinceStart++;
	self.stats.messagesSinceLastPost++;

	self.mixpanel.people.set(message.author.id, {
		timestamp: new Date().toISOString(),
		guilds: self.guilds.filter(g=>g.members.has(message.author.id)).map(g=>g.id)
});

	self.mixpanel.track(`bot.events.message`,{
		distinct_id: message.author.id,
		message: message.content,
		authorId: message.author.id,
		authorUsername: message.author.username,
		discriminator: message.author.discriminator,
		tag: message.author.tag,
		filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
	});
	if(message.author.bot || (self.config.devOnly && !self.config.developers.includes(message.author.id))) return;
	if(message.channel.type === "dm") {
		await message.author.send(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <https://www.furrybot.me> to see our website, <https://docs.furrybot.me> to see my documentation, and join <${self.config.discordSupportInvite}> if you need more help!`);
		self.logger.log(`[${event}Event][User: ${message.author.id}]:Direct message recieved from ${message.author.tag}: ${message.content}`);
		self.mixpanel.track(`bot.directMessage`,{
			distinct_id: message.author.id,
			timestamp: new Date().toISOString(),
			user: message.author.id,
			messageId: message.id,
			message: message.content,
			filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
		});
		self.stats.dmMessagesSinceStart++;
		self.stats.dmMessagesSinceLastPost++;
		var webhookData = {
			title: `Direct Message from ${self.author.tag} (${self.author.id})`,
			description: message.content,
			timestamp: self.getCurrentTimestamp()
		};
		var webhookEmbed = new self.Discord.MessageEmbed(webhookData);
		return self.webhooks.directMessage.send(webhookEmbed);
	}
	
	const local = {
		message,
		author: message.author,
		member: message.member,
		guild: message.guild,
		channel: message.channel,
		user: await self.resolveUser(message.member),
		embed_defaults: ((without=[],ext)=>{
		    if(![undefined,null,""].includes(ext)) {
		        local = ext;
		    }
			var def = {
				footer: {
					text: `Shard ${![undefined,null].includes(local.guild.shard) ? `${+local.guild.shard.id+1}/${self.options.shardCount}`: "1/1"} | Bot Version ${self.config.bot.version}`
				},
				author: {
					name: local.author.tag,
					icon_url: local.author.avatarURL()
				},
				color: self.randomColor(),
				timestamp: self.getCurrentTimestamp()
			};
			if(typeof without === "string") without = [without];
			without.forEach((wth)=>{
				if(typeof def[wth] !== "undefined") delete def[wth];
			});
			return def;
		}),
		embed_defaults_na: ((without=[],ext)=>{
		    if(![undefined,null,""].includes(ext)) {
		        local = ext;
		    }
			var def = {
				footer: {
					text: `Shard ${![undefined,null].includes(local.guild.shard) ? `${+local.guild.shard.id+1}/${self.options.shardCount}`: "1/1"} | Bot Version ${self.config.bot.version}`
				},
				color: self.randomColor(),
				timestamp: self.getCurrentTimestamp()
			};
			if(typeof without === "string") without = [without];
			without.forEach((wth)=>{
				if(typeof def[wth] !== "undefined") delete def[wth];
			});
			return def;
		})
	};
	
	// temporary - during beta
	//if(!self.config.betaGuilds.includes(local.guild.id)) return;
	
	try {
		self.messageCount++;
		self.localMessageCount++;
		try {
			local.gConfig = await self.db.getGuild(local.guild.id).catch(err=>self.config.guildDefaultSettings) ||  self.config.guildDefaultSettings;
			local.uConfig = await self.db.getUser(local.author.id).catch(err=>self.config.userDefaultConfig) || self.config.userDefaultConfig;
			if(self.config.beta) local.gConfig.prefix = "fb!";
		}catch(e){
			self.logger.error(e);
			return;
		}
		local.prefix = local.message.content.startsWith(`<@${self.user.id}>`)?`<@${self.user.id}>`:local.message.content.startsWith(`<@!${self.user.id}>`)?`<@!${self.user.id}>`:local.gConfig.prefix.toLowerCase();
		local.args = local.message.content.slice(local.prefix.length).trim().split(/\s+/g);
		local.command = local.args.shift().toLowerCase();
			
		
		if(local.guild.id === "400284026885373962") {
			if(self.config.customCommands.includes(local.command)) {
				self.stats.commandTotalsSinceStart++;
				self.stats.commandTotalsSinceLastPost++;
				self.logger.commandlog(`[${event}Event][Guild: ${local.guild.id}]: Command  "${local.command}" ran with arguments "${local.args.join(" ")}" by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
			
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

		var command = self.config.commandList.fullList[local.command];

		if(local.message.content.toLowerCase() === "whatismyprefix") {
			if(self.commandTimeout.whatismyprefix.has(local.author.id) && !self.config.developers.includes(local.author.id)) {
				self.logger.log(`[${event}Event][Guild: ${local.guild.id}]: Command timeout encountered by user ${message.author.tag} (${message.author.id}) on response "whatismyprefix" in guild ${message.guild.name} (${message.guild.id})`);
				return message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(self.config.commandList.response.whatismyprefix.cooldown)} before using this again!`);
			}
				self.commandTimeout.whatismyprefix.add(local.author.id);
				setTimeout(() => {self.commandTimeout.whatismyprefix.delete(local.author.id);}, self.config.commandList.response.whatismyprefix.cooldown);
			// whatismyprefix autoresponse stats
			self.logger.commandlog(`[${event}Event][Guild: ${local.guild.id}]: Response of "whatismyprefix" triggered by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
			self.stats.commandTotalsSinceStart++;
			self.stats.commandTotalsSinceLastPost++;
			return local.message.reply(`this guilds prefix is **${local.gConfig.prefix}**`);
		}
		if(["f","rip"].includes(local.message.content.toLowerCase()) && local.gConfig.fResponseEnabled) {
			//if(self.gConfig.fResponseEnabled) {
				if(self.commandTimeout.f.has(local.author.id) && !self.config.developers.includes(local.author.id)) {
					self.logger.log(`[${event}Event][Guild: ${local.guild.id}]: Command timeout encountered by user ${local.author.tag} (${local.author.id}) on response "f" in guild ${local.guild.name} (${local.guild.id})`);
					return message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(self.config.commandList.response.f.cooldown)} before using this again!`);
				}
				self.commandTimeout.f.add(message.author.id);
				setTimeout(() => {self.commandTimeout.f.delete(message.author.id);}, self.config.commandList.response.f.cooldown);
				// f autoresponse stats
				var f = await self.r.table("stats").get("fCount");
				self.r.table("stats").get("fCount").update({count:parseInt(f.count)+1}).run();
				self.logger.commandlog(`[${event}Event][Guild: ${local.guild.id}]: Response of "f" triggered by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
				self.stats.commandTotalsSinceStart++;
				self.stats.commandTotalsSinceLastPost++;
				return local.channel.send(`<@!${local.author.id}> has paid respects.\n\nRespects paid total: ${parseInt(f.count)+1}`);
			//}
		}
		try {
			if(local.message.content === `<@${self.user.id}>` || local.message.content === `<@!${self.user.id}>`) {
				/*var c = await require(`${process.cwd()}/commands/${self.config.commandList.fullList["help"].category}/help-cmd.js`)(self,local);
				if(c instanceof Error) throw c;*/
				var data = {
					title: "Hewwo!",
					description: `You can find out how to use me on my [docs page](https://docs.furrybot.me), my current prefix here is: **${local.gConfig.prefix}**\n(this can be chanegd via \`${local.gConfig.prefix}prefix <newprefix>\`)`
				}
				Object.assign(data,local.embed_defaults());
				var embed = new self.Discord.MessageEmbed(data);
				if(!local.channel.permissionsFor(self.user).has("SEND_MESSAGES")) {
					local.author.send("I couldn't send messages in the channel where I was mentioned, so I sent this directly to you!",embed).catch(noerr=>null);
				} else if(!local.channel.permissionsFor(self.user).has("EMBED_LINKS")) {
					return local.channel.send(`${embed.title}\n${embed.description}\n(If you give me permission to embed links this would look a lot nicer)`);
				} else {
					return local.channel.send(embed);
				}
			}
		}catch(e){
			local.message.reply(`Error while running command: ${e}`);
			return self.logger.error(`[${event}Event][Guild: ${local.guild.id}]: Command error:\n\tCommand: ${local.command}\n\tSupplied arguments: ${self.args.join(' ')}\n\tServer ID: ${local.guild.id}\n\t${e.stack}`);
		}
		if(!local.message.content.toLowerCase().startsWith(local.prefix)) return;
		if(!self.config.commandList.all.includes(local.command)) return;
		if(local.gConfig.deleteCommands) local.message.delete().catch(error=>local.channel.send(`Unable to delete command invocation: **${error}**\n\nCheck my permissions.`));
		if(command.userPermissions.length > 0 && !local.user.isDeveloper) {
			if(command.userPermissions.some(perm => !local.channel.permissionsFor(local.member).has(perm,true))) {
				var neededPerms = command.userPermissions.filter(perm => !local.channel.permissionsFor(local.member).has(perm,true));
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
					missingPermissions: neededPerms,
					filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
				});
				neededPerms = neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms;
				var data={
						"title": "You Don't have permission to do this!",
						"description": `You require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(data, local.embed_defaults());
				var embed = new self.Discord.MessageEmbed(data);
				self.logger.debug(`[DiscordBot:${__filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]}]: User ${local.author.tag} (${local.author.id}) is missing the permission(s) ${neededPerms} to run the command ${local.command} in guild ${local.guild.name} (${local.guild.id})`);
				return local.channel.send(embed);
			}
		}
		if(command.botPermissions.length > 0) {
			if(command.botPermissions.some(perm => !local.channel.permissionsFor(local.guild.me).has(perm,true))) {
				var neededPerms = config.commandList.fullList[command].botPermissions.filter(perm => !local.channel.permissionsFor(local.guild.me).has(perm,true));
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
				Object.assign(data, local.embed_defaults());
				var embed = new self.Discord.MessageEmbed(data);
				self.debug(`I am missing the permission(s) ${neededPerms} to run the command ${local.command} in guild ${local.guild.name} (${local.guild.id})`);
				return local.channel.send(embed);
			}
		}

		if(command.nsfw === true) {
			if(!local.channel.nsfw) {
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
				Object.assign(data, local.embed_defaults());
				var embed = new self.Discord.MessageEmbed(data);
				return local.channel.send(embed);
			}

			if(!local.gConfig.nsfwModuleEnabled) {
				var data = {
					"title": "NSFW commands are not enabled",
					"description": `NSFW commands are not enabled in this server, ask a staff member to run the command \`${local.gConfig.prefix}togglensfw\` to enable NSFW commands!`
				};
				
				Object.assign(data, local.embed_defaults());
				var embed = new self.Discord.MessageEmbed(data);
				return local.channel.send(embed);
			}
			if(self.config.yiff.disableStatements.some(t=>local.channel.topic.indexOf(t) !== -1)) {
					for(let key of self.config.yiff.disableStatements) {
						if(local.channel.topic.indexOf(key) !== -1) var st = key;
					}
				var data = {
					"title": "Yiff commands are explicitly disabled in this channel.",
					"description": `Ask a staff member to re-enabled them by removing \`${st}\` from the channel topic`
				};
				
				Object.assign(data, local.embed_defaults());
				var embed = new self.Discord.MessageEmbed(data);
				return local.channel.send(embed);
			}
		}

		if(command.guildOwnerOnly === true && local.author.id !== local.guild.owner.id) {
			var data = {
				"title": "Only the owner of this guild (server) can use this!",
				"description": `Only the owner of this guild, **${local.guild.owner.user.tag}** can run this.`
			};
			
			Object.assign(data, local.embed_defaults());
			var embed = new self.Discord.MessageEmbed(data);
			return local.channel.send(embed);
		}

		var isAlias = command.alias;
		if(Object.keys(self.lang[local.gConfig.locale]).includes(local.command)) {
			local.cmd = self.lang[local.gConfig.locale][local.command];
			local.c = local.cmd[Math.floor(Math.random()*local.cmd.length)];
		}
		try {
		self.stats.commandTotalsSinceStart++;
		self.stats.commandTotalsSinceLastPost++;
		switch(isAlias) {
			case true:
				//alias
				if(self.commandTimeout[command.aliasof].has(local.author.id) && !self.config.developers.includes(local.author.id)) {
					self.logger.log(`[DiscordBot:${__filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]}]: Command timeout encountered by user ${local.author.tag} (${local.author.id}) on command alias "${local.command}" (aliasof: ${command.aliasof}) in guild ${local.guild.name} (${local.guild.id})`);
					return local.message.reply(`${self.config.emojis.cooldown}\nPlease wait ${self.ms(command.cooldown)} before using this command again!`);
					}
				self.commandTimeout[command.aliasof].add(local.author.id);
				self.setTimeout(() => {self.commandTimeout[command.aliasof].delete(local.author.id);}, command.cooldown);
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
				
				self.logger.commandlog(`Command Alias "${local.command}" (aliasof: ${command.aliasof}) ran with arguments "${local.args.join(" ")}" by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
				var c = await require(`${process.cwd()}/commands/${command.category}/${command.aliasof}-cmd.js`)(self,local);
				if(c instanceof Error) throw c;
				break;
				
			default:
				if(self.commandTimeout[local.command].has(local.author.id) && !self.config.developers.includes(local.author.id)) {
					self.logger.log(`Command timeout encountered by user ${local.author.tag} (${local.author.id}) on command "${local.command}" in guild ${local.guild.name} (${local.guild.id})`);
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
				self.logger.commandlog(`Command  "${local.command}" ran with arguments "${local.args.join(" ")}" by user ${local.author.tag} (${local.author.id}) in guild ${local.guild.name} (${local.guild.id})`);
				var c=await require(`${process.cwd()}/commands/${command.category}/${local.command}-cmd.js`)(self,local);
				if(c instanceof Error) throw c;
		}
	}catch(e){
		if(e.message === "ERR_INVALID_USAGE") {
			var isAlias = self.config.commandList.fullList[local.command].alias;
			var cmd = isAlias?self.config.commandList.fullList[local.command].aliasof:local.command;
			var command = self.config.commandList.fullList[local.command];
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
				color: 15601937,
				fields: [
					{
						name: "Command",
						value: `${local.command} ${isAlias?`(aliasof: ${cmd})`:""}`,
						inline: false
					},{
						name: "Usage",
						value: `${local.gConfig.prefix}${command.usage}`,
						inline: false
					},{
						name: "Description",
						value: command.description,
						inline: false
					},{
						name: "Arguments Provided",
						value: local.args.join(" ")||"NONE",
						inline: false
					},{
						name: "Documentation Link",
						value: `https://docs.furrybot.me/#command/${cmd}`,
						inline: false
					}
				]
			};
			Object.assign(data, local.embed_defaults("color"));
			var embed = new self.Discord.MessageEmbed(data);
			return local.channel.send(embed);
		} else {
			self.mixpanel.track(`bot.error`,{
				distinct_id: local.author.id,
				timestamp: new Date().toISOString(),
				command: local.command,
				messageId: local.message.id,
				message: local.message.content,
				error: e,
				errorMessage: e.message,
				errorStack: e.stack,
				level: "e1",
				filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
			});
			self.logger.error(`[CommandHandler] e1: ${e.name}: ${e.message}\n${e.stack}`);
		}
	}
	}catch(e){
		self.mixpanel.track(`bot.error`,{
			distinct_id: local.author.id,
			timestamp: new Date().toISOString(),
			command: local.command,
			messageContent: local.message.id,
			message: local.message.content,
			error: e,
			errorMessage: e.message,
			errorStack: e.stack,
			level: "e2",
			filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
		});
		self.logger.error(`[CommandHandler] e2: ${e.name}: ${e.message}\n${e.stack}`);
		//message.reply(`Error while running command: ${e}`);
		//return self.error(`[messageEvent][Guild: ${message.guild.id}]: Command error:\n\tCommand: ${command}\n\tSupplied arguments: ${args.length==0?"none":args.join(" ")}\n\tServer ID: ${message.guild.id}\n\t${e.stack}`);
    }
});
