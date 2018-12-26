module.exports = (async(client,message)=>{
    if(!client || !client.db || !message) return;
    client.mixpanel.track(`bot.events.message`,{
		distinct_id: message.author.id,
		message: message.content,
		authorId: message.author.id,
		authorUsername: message.author.username,
		discriminator: message.author.discriminator,
		tag: message.author.tag
    });
    client.messageCount++;
	client.messageMessageCount++;
    if(message.author.bot || (client.config.devOnly && !client.config.developers.includes(message.author.id))) return;
    if(message.type === "dm") {
        await message.author.send(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <https://www.furrybot.me> to see our website, <https://docs.furrybot.me> to see my documentation, and join <${client.config.discordSupportInvite}> if you need more help!`);
		client.logger.log(`Direct message recieved from ${message.author.tag}: ${message.content}`);
		client.mixpanel.track(`bot.directMessage`,{
			distinct_id: message.author.id,
			timestamp: new Date().toISOString(),
			user: message.author.id,
			messageId: message.id,
			message: message.content
		});
		client.stats.dmMessagesSinceStart++;
		client.stats.dmMessagesSinceLastPost++;
    }
    try {
        Object.assign(message,{
            user: await client.resolveUser(message.member),
            embed_defaults: ((without=[],ext)=>{
                if(![undefined,null,""].includes(ext)) {
                    message = ext;
                }
                var def = {
                    footer: {
                        text: `Shard ${![undefined,null].includes(message.guild.shard) ? `${+message.guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
                    },
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.avatarURL()
                    },
                    color: client.randomColor(),
                    timestamp: client.getCurrentTimestamp()
                };
                if(typeof without === "string") without = [without];
                without.forEach((wth)=>{
                    if(typeof def[wth] !== "undefined") delete def[wth];
                });
                return def;
            }),
            embed_defaults_na: ((without=[],ext)=>{
                if(![undefined,null,""].includes(ext)) {
                    message = ext;
                }
                var def = {
                    footer: {
                        text: `Shard ${![undefined,null].includes(message.guild.shard) ? `${+message.guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
                    },
                    color: client.randomColor(),
                    timestamp: client.getCurrentTimestamp()
                };
                if(typeof without === "string") without = [without];
                without.forEach((wth)=>{
                    if(typeof def[wth] !== "undefined") delete def[wth];
                });
                return def;
            }),
            gConfig: await client.db.getGuild(message.guild.id).catch(err=>client.config.default.guildConfig),
            uConfig: await client.db.getUser(message.author.id).catch(err=>client.config.default.userConfig),
            get prefix() {
                return message.content.startsWith(`<@${client.user.id}>`) ? `<@${client.user.id}` : message.content.startsWith(`<@!${client.user.id}>`) ? `<@!${client.user.id}>` : client.config.beta ? "fb!" : message.gConfig.prefix.toLowerCase();
            },
            get args() {
                try {
                    return message.content.slice(message.prefix.length).trim().match(/\w+|('|")[^('|")]+('|")/g).map(s=>s.replace(/('|")/g,""));
                }catch(e){
                    return message.content.slice(message.prefix.length).trim().split(/\s+/);
                }
            },
            get command() {
                return message.args.shift().toLowerCase()
            },
        });
    }catch(e){
        client.logger.error(e);
        return;
    }
    
    if(!message.content.startsWith(message.prefix)) return;
    var command = client.getCommand(message.command);
    var category = client.getCategory(message.command);

    if(!command || !category) return;

    if(category.name.toLowerCase() === "custom" && message.guild.id !== client.config.bot.mainGuild) return;

    try {
        if(message.gConfig.deleteCommands) message.delete().catch(err=>message.channel.send(`Unable to delete command invocation:\n**${err}**`));

        // user permission check
        if(command.userPermissions.length > 0 && !message.user.isDeveloper) {
            if(command.userPermissions.some(perm => !message.channel.permissionsFor(message.member).has(perm,true))) {
				var neededPerms = command.userPermissions.filter(perm => !message.channel.permissionsFor(message.member).has(perm,true));
				client.mixpanel.track(`commands.${message.command}.missingUserPermissions`, {
					distinct_id: message.author.id,
					timestamp: new Date().toISOString(),
					args: message.args.join(" "),
					command: message.command,
					message: message.id,
					guild: message.guild.id,
					userId: message.author.id,
					username: message.author.username,
					discriminator: message.author.discriminator,
					tag: message.author.tag,
					missingPermissions: neededPerms
				});
				neededPerms = neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms;
				var data = {
						"title": "You Don't have permission to do this!",
						"description": `You require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(data, message.embed_defaults());
				var embed = new client.Discord.MessageEmbed(data);
				client.logger.debug(`User ${message.author.tag} (${message.author.id}) is missing the permission(s) ${neededPerms} to run the command ${message.command} in guild ${message.guild.name} (${message.guild.id})`);
				return message.channel.send(embed);
			}
        }

        if(command.botPermissions.length > 0) {
			if(command.botPermissions.some(perm => !message.channel.permissionsFor(message.guild.me).has(perm,true))) {
				var neededPerms = command.botPermissions.filter(perm => !message.channel.permissionsFor(message.guild.me).has(perm,true));
				client.mixpanel.track(`commands.${message.command}.missingBotPermissions`, {
					distinct_id: message.author.id,
					timestamp: new Date().toISOString(),
					args: message.args.join(" "),
					command: message.command,
					message: message.id,
					guild: message.guild.id,
					userId: message.author.id,
					username: message.author.username,
					discriminator: message.author.discriminator,
					tag: message.author.tag,
					missingPermissions: neededPerms
				});
				var neededPerms = neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms;
				var data={
					"title": "I don't have the required permissions!",
					"description": `I require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(data, message.embed_defaults());
				var embed = new client.Discord.MessageEmbed(data);
				client.logger.debug(`I am missing the permission(s) ${neededPerms} to run the command ${message.command} in guild ${message.guild.name} (${message.guild.id})`);
				return message.channel.send(embed);
			}
        }
        
        if(command.nsfw === true) {
			if(!message.channel.nsfw) {
				client.mixpanel.track(`commands.${message.command}.nonNSFW`, {
					distinct_id: message.author.id,
					timestamp: new Date().toISOString(),
					args: message.args.join(" "),
					command: message.command,
					message: message.message.id,
					guild: message.guild.id,
					userId: message.author.id,
					username: message.author.username,
					discriminator: message.author.discriminator,
					tag: message.author.tag
				});
				var data={
					title: "NSFW commands are not allowed here",
					description: "NSFW commands must be ran in channels marked as NSFW"
				};
				Object.assign(data, message.embed_defaults());
				var embed = new client.Discord.MessageEmbed(data);
				return message.channel.send(embed);
			}

			if(!message.gConfig.nsfwModuleEnabled) {
				var data = {
					title: "NSFW commands are not enabled",
					description: `NSFW commands are not enabled in this server, ask a staff member to run the command \`${message.gConfig.prefix}togglensfw\` to enable NSFW commands!`
				};
				
				Object.assign(data, message.embed_defaults());
				var embed = new client.Discord.MessageEmbed(data);
				return message.channel.send(embed);
			}
			if(client.config.yiff.disableStatements.some(t=>message.channel.topic.indexOf(t) !== -1)) {
                for(let key of client.config.yiff.disableStatements) {
                    if(message.channel.topic.indexOf(key) !== -1) var st = key;
                }
				var data = {
					title: "NSFW commands are explicitly disabled in this channel.",
					description: `Ask a staff member to re-enabled them by removing \`${st}\` from the channel topic`
				};
				
				Object.assign(data, message.embed_defaults());
				var embed = new client.Discord.MessageEmbed(data);
				return message.channel.send(embed);
			}
        }
        
        if(command.guildOwnerOnly === true && message.author.id !== message.guild.owner.id && !message.user.isDeveloper) {
			var data = {
				title: "Only the owner of this guild (server) can use this!",
				description: `Only the owner of this guild, **${message.guild.owner.user.tag}** can run this.`
			};
			
			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
        }
        
        client.stats.commandTotalsSinceStart++;
        client.stats.commandTotalsSinceLastPost++;
        if(client.commandTimeout[command.triggers[0]].has(message.author.id) && !message.user.isDeveloper) {
            client.logger.log(`Command timeout encountered by user ${message.author.tag} (${message.author.id}) on command "${message.command}" in guild ${message.guild.name} (${message.guild.id})`);
            return message.reply(`${client.config.emojis.cooldown}\nPlease wait ${client.ms(command.cooldown)} before using this command again!`);
        }
        client.commandTimeout[command.triggers[0]].add(message.author.id);
		client.setTimeout((cmd,user) => {client.commandTimeout[cmd].delete(user);}, command.cooldown,command.triggers[0],message.author.id);
		client.mixpanel.track(`commands.${command.triggers[0]}.used`, {
			distinct_id: message.author.id,
			timestamp: new Date().toISOString(),
			args: message.args.join(" "),
			command: message.command,
			message: message.id,
			guild: message.guild.id,
			userId: message.author.id,
			username: message.author.username,
			discriminator: message.author.discriminator,
			tag: message.author.tag
        });
        client.logger.commandlog(`Command  "${command.triggers[0]}" ran with arguments "${message.args.join(" ")}" by user ${message.author.tag} (${message.author.id}) in guild ${message.guild.name} (${message.guild.id})`);
		var start = client.performance.now();
		var c = await command.run(client,message);
		var end = client.performance.now();
		client.logger.debug(`Command handler for "${command.triggers[0]}" took ${(end-start).toFixed(3)}ms to execute.`);
		if(c instanceof Error) throw c;
    }catch(e){
        if(e.message === "ERR_INVALID_USAGE") {
			client.mixpanel.track(`commands.${command.triggers[0]}.invalidUsage`, {
				distinct_id: message.author.id,
				timestamp: new Date().toISOString(),
				args: message.args.join(" "),
				message: message.id,
				guild: message.guild.id,
				userId:message.author.id,
				username: message.author.username,
				discriminator: message.author.discriminator,
				tag: message.author.tag,
				displayName: message.member.displayName,
				filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
			});
			var data = {
				title: ":x: Invalid Command Usage",
				color: 15601937,
				fields: [
					{
						name: "Command",
						value: message.command,
						inline: false
					},{
						name: "Usage",
						value: `${message.gConfig.prefix}${message.command} ${command.usage}`,
						inline: false
					},{
						name: "Description",
						value: command.description,
						inline: false
					},{
						name: "Arguments Provided",
						value: message.args.join(" ")||"NONE",
						inline: false
					},{
						name: "Documentation Link",
						value: `${client.config.bot.documentationURL}#command/${command.triggers[0]}`,
						inline: false
					}
				]
			};
			Object.assign(data, message.embed_defaults("color"));
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
        } else {
            client.mixpanel.track(`bot.error`,{
				distinct_id: message.author.id,
				timestamp: new Date().toISOString(),
				command: message.command,
				messageId: message.id,
				message: message.content,
				error: e,
				errorMessage: e.message,
				errorStack: e.stack,
				level: "e1",
				filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
			});
			client.logger.error(`[CommandHandler] e1: ${e.name}: ${e.message}\n${e.stack}`);
        }
    }
});