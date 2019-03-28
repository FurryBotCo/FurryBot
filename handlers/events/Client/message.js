module.exports = (async function(message){
	if(!this.db || !message) return;
	this.trackEvent({
		group: "MESSAGE",
		userId: message.author.id,
		event: "client.events.message",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	let blacklist, data, embed, response, start, c, end, command, category, g, u, blacklistType, blReason, neededPerms, st;
	const client = this;
	this.messageCount++;
	this.messageMessageCount++;
	if(message.author.bot || (this.config.devOnly && !this.config.developers.includes(message.author.id))) return;
	if(message.channel.type === "dm") {
		this.trackEvent({
			group: "DM",
			userId: message.author.id,
			event: "client.events.message.directMessage",
			properties: {
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.os.hostname()
				},
				author: {
					id: message.author.id,
					tag: message.author.tag
				},
				channelId: message.channel.id,
				content: message.content
			}
		});
		await message.author.send(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <${this.config.bot.websiteURL}> to see our website, <${this.config.bot.documentationURL}> to see my documentation, and join ${this.config.bot.supportInvite} if you need more help!`);
		this.logger.log(`Direct message recieved from ${message.author.tag}: ${message.content}`);
		this.stats.dmMessagesSinceStart++;
		this.stats.dmMessagesSinceLastPost++;
		return;
	}

	try {
		Object.assign(message,{
			user: await message.configureUser(),
			embed_defaults: ((...without)  => {
				let def;
				def = {
					footer: {
						text: `Shard ${![undefined,null].includes(message.guild.shard) ? `${+message.guild.shard.id+1}/${this.options.shardCount}`: "1/1"} | Bot Version ${this.config.bot.version}`
					},
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL()
					},
					color: this.randomColor(),
					timestamp: this.getCurrentTimestamp()
				};
				without.forEach((wth) => {
					if(typeof def[wth] !== "undefined") delete def[wth];
				});
				return def;
			}),
			embed_defaults_na: ((...without) => {
				let def;
				def = {
					footer: {
						text: `Shard ${![undefined,null].includes(message.guild.shard) ? `${+message.guild.shard.id+1}/${this.options.shardCount}`: "1/1"} | Bot Version ${this.config.bot.version}`
					},
					color: this.randomColor(),
					timestamp: this.getCurrentTimestamp()
				};
				without.forEach((wth) => {
					if(typeof def[wth] !== "undefined") delete def[wth];
				});
				return def;
			}),
			gConfig: await this.db.getGuild(message.guild.id).catch(error => this.config.default.guildConfig),
			uConfig: await this.db.getUser(message.author.id).catch(error => this.config.default.userConfig),
			get prefix() {
				return message.content.startsWith(`<@${client.user.id}>`) ? `<@${client.user.id}` : message.content.startsWith(`<@!${client.user.id}>`) ? `<@!${client.user.id}>` : client.config.beta || client.config.alpha ? client.config.defaultPrefix : message.gConfig.prefix.toLowerCase();
			},
			get args() {
				try {
					return message.content.slice(message.prefix.length).trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g,"")); // eslint-disable-line no-useless-escape
				}catch(error){
					return message.content.slice(message.prefix.length).trim().split(/\s+/);
				}
			},
			get unparsedArgs() {
				return message.content.slice(message.prefix.length).trim().split(/\s+/);
			},
			get command() {
				return message.args.shift().toLowerCase();
			},
		});
	}catch(error){
		this.logger.error(error);
		return;
	}
	message.unparsedArgs.shift();
	
	blacklist = (message.uConfig.blacklisted && !message.user.isDeveloper) || message.gConfig.blacklisted;
	
	if(message.content === `<@${this.user.id}>` || message.content === `<@!${this.user.id}>` && !blacklist) {
		/*c = await require(`${process.cwd()}/commands/${this.config.commandList.fullList["help"].category}/help-cmd.js`)(message);
		if(c instanceof Error) throw c;*/
		data = {
			title: "Hewwo!",
			description: `You can find out how to use me on my [docs page](${this.config.bot.documentationURL}), my current prefix here is: **${message.gConfig.prefix}**\n(this can be changed via \`${message.gConfig.prefix}prefix <newprefix>\`\nTo invite me to new servers, use [this link](https://discordapp.com/oauth2/authorize?this_id=${this.user.id}&scope=bot&permissions=-1))`
		};
		Object.assign(data,message.embed_defaults());
		embed = new this.Discord.MessageEmbed(data);
		if(!message.channel.permissionsFor(this.user).has("SEND_MESSAGES")) {
			message.author.send("I couldn't send messages in the channel where I was mentioned, so I sent this directly to you!",embed).catch(error => null);
		} else if(!message.channel.permissionsFor(this.user).has("EMBED_LINKS")) {
			return message.channel.send(`${embed.title}\n${embed.description}\n(If you give me permission to embed links this would look a lot nicer)`);
		} else {
			return message.channel.send(embed);
		}
	}

	if(this.responseList.includes(message.content.toLowerCase()) && !blacklist) {
		response = this.getResponse(message.content.toLowerCase());
		if(response.triggers.includes("f") && !message.gConfig.fResponseEnabled) return;
		this.logger.commandlog(`Response "${response.triggers[0]}" triggered by user ${message.author.tag} (${message.author.id}) in guild ${message.guild.name} (${message.guild.id})`);
		this.trackEvent({
			group: "RESPONSE",
			userId: message.author.id,
			event: `responses.${response.triggers[0]}`,
			properties: {
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.os.hostname()
				},
				author: {
					id: message.author.id,
					tag: message.author.tag
				},
				message: {
					id: message.channel.id,
					content: message.content,
					args: message.args,
					unparsedArgs: message.unparsedArgs
				},
				channel: {
					id: message.channel.id,
					name: message.channel.name
				},
				guild: {
					id: message.guild.id,
					name: message.guild.id,
					owner: {
						id: message.guild.owner.id,
						tag: message.guild.owner.tag
					}
				}
			}
		});
		start = this.performance.now();
		c = await response.run.call(this,message);
		end = this.performance.now();
		this.logger.debug(`Response handler for "${response.triggers[0]}" took ${(end-start).toFixed(3)}ms to execute.`);
		return;
	}
	if(!message.content.toLowerCase().startsWith(message.prefix.toLowerCase())) return;
	command = this.getCommand(message.command);
	category = this.getCategory(message.command);

	if(blacklist) {
		g = await this.db.isBlacklisted(message.guild.id);
		u = await this.db.isBlacklisted(message.author.id);
		blacklistType = g.blacklisted ? "guild" : u.blacklisted ? "user" : "unknown";
		blReason = g.blacklisted ? g.reason : u.blacklisted ? u.reason : "unknown";
		this.logger.info(`Skipped command "${command.triggers[0]}" with args "${message.unparsedArgs}" from ${message.author.tag} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) because of ${blacklistType} blacklist, reason: ${blReason}`);
		return;
	}
	if(!command || !category) return;

	if(category.name.toLowerCase() === "custom" && message.guild.id !== this.config.bot.mainGuild) return;
	message.command = command.triggers[0];
	try {
		if(message.gConfig.deleteCommands) message.delete().catch(err => message.channel.send(`Unable to delete command invocation:\n**${err}**`));

		if(command.devOnly && !this.config.developers.includes(message.author.id)) return message.reply("You cannot run this command as you are not a developer.");
		// user permission check
		if(command.userPermissions.length > 0 && !message.user.isDeveloper) {
			if(command.userPermissions.some(perm => !message.channel.permissionsFor(message.member).has(perm,true))) {
				neededPerms = command.userPermissions.filter(perm => !message.channel.permissionsFor(message.member).has(perm,true));
				neededPerms = neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms;
				this.trackEvent({
					group: "COMMANDS",
					userId: message.author.id,
					event: `commands.${message.command}.missingPermissions`,
					properties: {
						type: "user",
						neededPerms,
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: this.os.hostname()
						},
						author: {
							id: message.author.id,
							tag: message.author.tag
						},
						message: {
							id: message.channel.id,
							content: message.content,
							args: message.args,
							unparsedArgs: message.unparsedArgs
						},
						channel: {
							id: message.channel.id,
							name: message.channel.name
						},
						guild: {
							id: message.guild.id,
							name: message.guild.id,
							owner: {
								id: message.guild.owner.id,
								tag: message.guild.owner.tag
							}
						}
					}
				});
				data = {
					"title": "You Don't have permission to do this!",
					"description": `You require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(data, message.embed_defaults());
				embed = new this.Discord.MessageEmbed(data);
				this.logger.debug(`User ${message.author.tag} (${message.author.id}) is missing the permission(s) ${neededPerms} to run the command ${message.command} in guild ${message.guild.name} (${message.guild.id})`);
				return message.channel.send(embed);
			}
		}

		if(command.botPermissions.length > 0) {
			if(command.botPermissions.some(perm => !message.channel.permissionsFor(message.guild.me).has(perm,true))) {
				neededPerms = command.botPermissions.filter(perm => !message.channel.permissionsFor(message.guild.me).has(perm,true));
				neededPerms = neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms;
				this.trackEvent({
					group: "COMMANDS",
					userId: message.author.id,
					event: `commands.${message.command}.missingPermissions`,
					properties: {
						type: "bot",
						neededPerms,
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: this.os.hostname()
						},
						author: {
							id: message.author.id,
							tag: message.author.tag
						},
						message: {
							id: message.channel.id,
							content: message.content,
							args: message.args,
							unparsedArgs: message.unparsedArgs
						},
						channel: {
							id: message.channel.id,
							name: message.channel.name
						},
						guild: {
							id: message.guild.id,
							name: message.guild.id,
							owner: {
								id: message.guild.owner.id,
								tag: message.guild.owner.tag
							}
						}
					}
				});
				data = {
					"title": "I don't have the required permissions!",
					"description": `I require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(data, message.embed_defaults());
				embed = new this.Discord.MessageEmbed(data);
				this.logger.debug(`I am missing the permission(s) ${neededPerms} to run the command ${message.command} in guild ${message.guild.name} (${message.guild.id})`);
				return message.channel.send(embed);
			}
		}
		
		if(command.nsfw === true) {
			if(!message.channel.nsfw) {
				this.trackEvent({
					group: "COMMANDS",
					userId: message.author.id,
					event: `commands.${message.command}.errors.channelNotNSFW`,
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: this.os.hostname()
						},
						author: {
							id: message.author.id,
							tag: message.author.tag
						},
						message: {
							id: message.channel.id,
							content: message.content,
							args: message.args,
							unparsedArgs: message.unparsedArgs
						},
						channel: {
							id: message.channel.id,
							name: message.channel.name
						},
						guild: {
							id: message.guild.id,
							name: message.guild.id,
							owner: {
								id: message.guild.owner.id,
								tag: message.guild.owner.tag
							}
						}
					}
				});
				data = {
					title: "NSFW commands are not allowed here",
					description: "NSFW commands must be ran in channels marked as NSFW"
				};
				Object.assign(data, message.embed_defaults());
				embed = new this.Discord.MessageEmbed(data);
				return message.channel.send(embed);
			}

			if(!message.gConfig.nsfwModuleEnabled) {
				this.trackEvent({
					group: "COMMANDS",
					userId: message.author.id,
					event: `commands.${message.command}.errors.nsfwNotEnabled`,
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: this.os.hostname()
						},
						author: {
							id: message.author.id,
							tag: message.author.tag
						},
						message: {
							id: message.channel.id,
							content: message.content,
							args: message.args,
							unparsedArgs: message.unparsedArgs
						},
						channel: {
							id: message.channel.id,
							name: message.channel.name
						},
						guild: {
							id: message.guild.id,
							name: message.guild.id,
							owner: {
								id: message.guild.owner.id,
								tag: message.guild.owner.tag
							}
						}
					}
				});
				data = {
					title: "NSFW commands are not enabled",
					description: `NSFW commands are not enabled in this server, ask a staff member to run the command \`${message.gConfig.prefix}togglensfw\` to enable NSFW commands!`
				};
				
				Object.assign(data, message.embed_defaults());
				embed = new this.Discord.MessageEmbed(data);
				return message.channel.send(embed);
			}
			if(![undefined,null,""].includes(message.channel.topic)) {
				if(this.config.yiff.disableStatements.some(t => message.channel.topic.indexOf(t) !== -1)) {
					for(let key of this.config.yiff.disableStatements) {
						if(message.channel.topic.indexOf(key) !== -1) st = key;
					}
					this.trackEvent({
						group: "COMMANDS",
						userId: message.author.id,
						event: `commands.${message.command}.errors.channelDisabled`,
						properties: {
							bot: {
								version: this.config.bot.version,
								beta: this.config.beta,
								alpha: this.config.alpha,
								server: this.os.hostname()
							},
							author: {
								id: message.author.id,
								tag: message.author.tag
							},
							message: {
								id: message.channel.id,
								content: message.content,
								args: message.args,
								unparsedArgs: message.unparsedArgs
							},
							channel: {
								id: message.channel.id,
								name: message.channel.name
							},
							guild: {
								id: message.guild.id,
								name: message.guild.id,
								owner: {
									id: message.guild.owner.id,
									tag: message.guild.owner.tag
								}
							},
							statment: st
						}
					});
					data = {
						title: "NSFW commands are explicitly disabled in this channel.",
						description: `Ask a staff member to re-enable them by removing \`${st}\` from the channel topic`
					};
					
					Object.assign(data, message.embed_defaults());
					embed = new this.Discord.MessageEmbed(data);
					return message.channel.send(embed);
				}
			}
		}
		
		if(command.guildOwnerOnly === true && message.author.id !== message.guild.owner.id && !message.user.isDeveloper) {
			this.trackEvent({
				group: "COMMANDS",
				userId: message.author.id,
				event: `commands.${message.command}.errors.guildOwnerOnly`,
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					},
					author: {
						id: message.author.id,
						tag: message.author.tag
					},
					message: {
						id: message.channel.id,
						content: message.content,
						args: message.args,
						unparsedArgs: message.unparsedArgs
					},
					channel: {
						id: message.channel.id,
						name: message.channel.name
					},
					guild: {
						id: message.guild.id,
						name: message.guild.id,
						owner: {
							id: message.guild.owner.id,
							tag: message.guild.owner.tag
						}
					}
				}
			});
			data = {
				title: "Only the owner of this guild (server) can use this!",
				description: `Only the owner of this guild, **${message.guild.owner.user.tag}** can run this.`
			};
			
			Object.assign(data, message.embed_defaults());
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
		
		if(Object.keys(this.lang[message.gConfig.locale]).includes(command.triggers[0])) {
			message.cmd = this.lang[message.gConfig.locale][command.triggers[0]];
			message.c = message.cmd[Math.floor(Math.random()*message.cmd.length)];
		}

		this.trackEvent({
			group: "COMMANDS",
			userId: message.author.id,
			event: `commands.${message.command}`,
			properties: {
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.os.hostname()
				},
				author: {
					id: message.author.id,
					tag: message.author.tag
				},
				message: {
					id: message.channel.id,
					content: message.content,
					args: message.args,
					unparsedArgs: message.unparsedArgs
				},
				channel: {
					id: message.channel.id,
					name: message.channel.name
				},
				guild: {
					id: message.guild.id,
					name: message.guild.id,
					owner: {
						id: message.guild.owner.id,
						tag: message.guild.owner.tag
					}
				}
			}
		});
		this.stats.commandTotalsSinceStart++;
		this.stats.commandTotalsSinceLastPost++;
		if(this.commandTimeout[command.triggers[0]].has(message.author.id) && !message.user.isDeveloper) {
			this.logger.log(`Command timeout encountered by user ${message.author.tag} (${message.author.id}) on command "${message.command}" in guild ${message.guild.name} (${message.guild.id})`);
			this.trackEvent({
				group: "COMMANDS",
				userId: message.author.id,
				event: `commands.${message.command}.errors.timeout`,
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					},
					author: {
						id: message.author.id,
						tag: message.author.tag
					},
					message: {
						id: message.channel.id,
						content: message.content,
						args: message.args,
						unparsedArgs: message.unparsedArgs
					},
					channel: {
						id: message.channel.id,
						name: message.channel.name
					},
					guild: {
						id: message.guild.id,
						name: message.guild.id,
						owner: {
							id: message.guild.owner.id,
							tag: message.guild.owner.tag
						}
					}
				}
			});
			return message.reply(`${this.config.emojis.cooldown}\nPlease wait ${this.ms(command.cooldown)} before using this command again!`);
		}
		this.commandTimeout[command.triggers[0]].add(message.author.id);
		this.setTimeout((cmd,user) => {this.commandTimeout[cmd].delete(user);}, command.cooldown,command.triggers[0],message.author.id);
		this.logger.commandlog(`Command  "${command.triggers[0]}" ran with arguments "${message.unparsedArgs.join(" ")}" by user ${message.author.tag} (${message.author.id}) in guild ${message.guild.name} (${message.guild.id})`);
		start = this.performance.now();
		c = await command.run.call(this,message);
		end = this.performance.now();
		this.logger.debug(`Command handler for "${command.triggers[0]}" took ${(end-start).toFixed(3)}ms to execute.`);
		if(c instanceof Error) throw c;
	}catch(error){
		if(error.message === "ERR_INVALID_USAGE") {
			data = {
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
						name: "Category",
						value: command.category || "Unknown",
						inline: false
					},{
						name: "Arguments Provided",
						value: message.args.join(" ") || "NONE",
						inline: false
					},{
						name: "Documentation Link",
						value: `${this.config.bot.documentationURL}#command/${command.triggers[0]}`,
						inline: false
					}
				]
			};
			this.trackEvent({
				group: "COMMANDS",
				userId: message.author.id,
				event: `commands.${message.command}.invalidUsage`,
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					},
					author: {
						id: message.author.id,
						tag: message.author.tag
					},
					message: {
						id: message.channel.id,
						content: message.content,
						args: message.args,
						unparsedArgs: message.unparsedArgs
					},
					channel: {
						id: message.channel.id,
						name: message.channel.name
					},
					guild: {
						id: message.guild.id,
						name: message.guild.id,
						owner: {
							id: message.guild.owner.id,
							tag: message.guild.owner.tag
						}
					}
				}
			});
			Object.assign(data, message.embed_defaults("color"));
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			this.logger.error(`[CommandHandler] e1: ${error.name}: ${error.message}\n${error.stack}`);
			this.trackEvent({
				group: "ERRORS",
				userId: message.author.id,
				event: "client.errors",
				properties: {
					command: message.command,
					error: {
						name: error.name,
						message: error.message,
						stack: error.stack
					},
					level: "e1",
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					},
					author: {
						id: message.author.id,
						tag: message.author.tag
					},
					message: {
						id: message.channel.id,
						content: message.content,
						args: message.args,
						unparsedArgs: message.unparsedArgs
					},
					channel: {
						id: message.channel.id,
						name: message.channel.name
					},
					guild: {
						id: message.guild.id,
						name: message.guild.id,
						owner: {
							id: message.guild.owner.id,
							tag: message.guild.owner.tag
						}
					}
				}
			});
		}
	}
});