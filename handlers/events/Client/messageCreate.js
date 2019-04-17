module.exports = (async function (message) {
	if(!this.mdb || !message) return;
	
	this.trackEvent({
		group: "MESSAGE",
		userId: message.author.id,
		event: "client.events.message",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: require("os").hostname()
			}
		}
	});

	let blacklist, embed, response, start, c, end, command, category, g, u, blacklistType, blReason, neededPerms, st;

	if(["563448758965239839"].includes(message.author.id) && message.channel.id === "475196091822899210") {
		await message.addReaction("upvote:542963565150208001");
		await message.addReaction("downvote:542963565238288384");
		await message.addReaction("❌");
		return;
	}

	if(message.author.bot || (this.config.devOnly && !this.config.developers.includes(message.author.id))) return;


	if(message.channel.type === 1) {
		this.trackEvent({
			group: "DM",
			userId: message.author.id,
			event: "client.events.message.directMessage",
			properties: {
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: require("os").hostname()
				},
				author: {
					id: message.author.id,
					tag: message.author.tag
				},
				channelId: message.channel.id,
				content: message.content
			}
		});
		await message.author.getDMChannel().then(dm => dm.createMessage(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <${this.config.bot.websiteURL}> to see our website, use \`${this.config.defaultPrefix}help\` to see my commands, and join ${this.config.bot.supportInvite} if you need more help!`));
		return this.logger.log(`Direct message recieved from ${message.author.username}#${message.author.discriminator}: ${message.content}`);
	}

	if(message.content === `<@${this.bot.user.id}>` || message.content === `<@!${this.bot.user.id}>`) {
		/*c = await require(`${process.cwd()}/commands/${this.config.commandList.fullList["help"].category}/help-cmd.js`)(message);
		if(c instanceof Error) throw c;*/
		embed = {
			title: "Hewwo!",
			description: `You can find out how to use me by running **${message.gConfig.prefix}help**, my current prefix here is: **${message.gConfig.prefix}**\n(this can be changed via \`${message.gConfig.prefix}prefix <newprefix>\`\nTo invite me to new servers, use [this link](https://discordapp.com/oauth2/authorize?this_id=${this.bot.user.id}&scope=bot&permissions=-1))`
		};
		Object.assign(embed,message.embed_defaults());
		if(!message.channel.permissionsOf(this.bot.user.id).has("sendMessages")) {
			return message.author.getDMChannel().then(dm => dm.createMessage({content: "I couldn't send messages in the channel where I was mentioned, so I sent this directly to you!",embed})).catch(error => null);
		} else if(!message.channel.permissionsOf(this.bot.user.id).has("embedLinks")) {
			return message.channel.createmessage(`${embed.title}\n${embed.description}\n(If you give me permission to embed links this would look a lot nicer)`);
		} else {
			return message.channel.createMessage({ embed });
		}
	}

	const m = await this.setupMessage(message);
	Object.assign(message,m);

	blacklist = (message.uConfig.blacklisted && !message.user.isDeveloper) || message.gConfig.blacklisted;

	if(["owo","uwu"].some(r => message.content.toLowerCase() === r)) {
		let cn;
		switch(message.content.toLowerCase()) {
		case "owo":
			this.trackEvent({
				group: "RANDOM",
				userId: message.author.id,
				event: "random.owo",
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: require("os").hostname()
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
						id: message.channel.guild.id,
						name: message.channel.guild.id,
						owner: {
							id: message.channel.guild.ownerID,
							tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
						}
					}
				}
			});
			this.logger.info(`Logged 1 owo from ${message.author.username}#${message.author.discriminator} (${message.author.id})`);
			cn = message.uConfig.owoCount || 0;
			return this.mdb.collection("users").findOneAndUpdate({
				id: message.author.id
			},{
				$set: {
					owoCount: cn + 1
				}
			});
			break; // eslint-disable-line no-unreachable

		case "uwu":
			this.trackEvent({
				group: "RANDOM",
				userId: message.author.id,
				event: "random.uwu",
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: require("os").hostname()
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
						id: message.channel.guild.id,
						name: message.channel.guild.id,
						owner: {
							id: message.channel.guild.ownerID,
							tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
						}
					}
				}
			});
			this.logger.info(`Logged 1 uwu from ${message.author.username}#${message.author.discriminator} (${message.author.id})`);
			cn = message.uConfig.uwuCount || 0;
			return this.mdb.collection("users").findOneAndUpdate({
				id: message.author.id
			},{
				$set: {
					uwuCount: cn + 1
				}
			});
			break; // eslint-disable-line no-unreachable
		}
	}

	if(this.responseList.includes(message.content.toLowerCase()) && !blacklist) {
		response = this.getResponse(message.content.toLowerCase());
		if(response.triggers.includes("f") && !message.gConfig.fResponseEnabled) return;
		this.logger.command(`Response "${response.triggers[0]}" triggered by user ${message.author.tag} (${message.author.id}) in guild ${message.channel.guild.name} (${message.channel.guild.id})`);
		this.trackEvent({
			group: "RESPONSE",
			userId: message.author.id,
			event: `responses.${response.triggers[0]}`,
			properties: {
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: require("os").hostname()
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
					id: message.channel.guild.id,
					name: message.channel.guild.id,
					owner: {
						id: message.channel.guild.ownerID,
						tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
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
		g = await this.mdb.findOne({id: message.channel.guild.id}).then(res => res.blacklisted ? { blacklisted: true, reason: res.reason} : false);
		u = await this.db.isBlacklisted(message.author.id).then(res => res.blacklisted ? { blacklisted: true, reason: res.reason} : false);
		blacklistType = g.blacklisted ? "guild" : u.blacklisted ? "user" : "unknown";
		blReason = g.blacklisted ? g.reason : u.blacklisted ? u.reason : "unknown";
		this.logger.info(`Skipped command "${command.triggers[0]}" with args "${message.unparsedArgs}" from ${message.author.tag} (${message.author.id}) in ${message.channel.guild.name} (${message.channel.guild.id}) because of ${blacklistType} blacklist, reason: ${blReason}`);
		return;
	}
	if(!command || !category) return;

	if(category.name.toLowerCase() === "custom" && message.channel.guild.id !== this.config.bot.mainGuild) return;
	message.command = command.triggers[0];
	try {
		if(message.gConfig.deleteCommands) message.delete().catch(err => message.channel.createMessage(`Unable to delete command invocation:\n**${err}**`));
		if(command.devOnly && !this.config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer.`);
		// user permission check
		if(command.userPermissions.length > 0 && !message.user.isDeveloper) {
			if(command.userPermissions.some(perm => !message.channel.permissionsOf(message.member.id).has(perm,true))) {
				neededPerms = command.userPermissions.filter(perm => !message.channel.permissionsOf(message.member.id).has(perm,true));
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
							server: require("os").hostname()
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
							id: message.channel.guild.id,
							name: message.channel.guild.id,
							owner: {
								id: message.channel.guild.ownerID,
								tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
							}
						}
					}
				});
				embed = {
					"title": "You Don't have permission to do this!",
					"description": `You require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(embed, message.embed_defaults());
				this.logger.debug(`User ${message.author.tag} (${message.author.id}) is missing the permission(s) ${neededPerms} to run the command ${message.command} in guild ${message.channel.guild.name} (${message.channel.guild.id})`);
				return message.channel.createMessage({ embed });
			}
		}

		if(command.botPermissions.length > 0) {
			if(command.botPermissions.some(perm => !message.channel.permissionsOf(this.bot.user.id).has(perm,true))) {
				neededPerms = command.botPermissions.filter(perm => !message.channel.permissionsOf(this.bot.user.id).has(perm,true));
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
							server: require("os").hostname()
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
							id: message.channel.guild.id,
							name: message.channel.guild.id,
							owner: {
								id: message.channel.guild.ownerID,
								tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
							}
						}
					}
				});
				embed = {
					"title": "I don't have the required permissions!",
					"description": `I require the permission(s) **${neededPerms}** to run this command!`
				};
				Object.assign(embed, message.embed_defaults());
				this.logger.debug(`I am missing the permission(s) ${neededPerms} to run the command ${message.command} in guild ${message.channel.guild.name} (${message.channel.guild.id})`);
				return message.channel.createMessage({ embed });
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
							server: require("os").hostname()
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
							id: message.channel.guild.id,
							name: message.channel.guild.id,
							owner: {
								id: message.channel.guild.ownerID,
								tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
							}
						}
					}
				});
				embed = {
					title: "NSFW commands are not allowed here",
					description: "NSFW commands must be ran in channels marked as NSFW"
				};
				Object.assign(embed, message.embed_defaults());
				return message.channel.createMessage({ embed });
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
							server: require("os").hostname()
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
							id: message.channel.guild.id,
							name: message.channel.guild.id,
							owner: {
								id: message.channel.guild.ownerID,
								tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
							}
						}
					}
				});
				embed = {
					title: "NSFW commands are not enabled",
					description: `NSFW commands are not enabled in this server, ask a staff member to run the command \`${message.gConfig.prefix}togglensfw\` to enable NSFW commands!`
				};
				
				Object.assign(embed, message.embed_defaults());
				return message.channel.createMessage({ embed });
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
								server: require("os").hostname()
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
								id: message.channel.guild.id,
								name: message.channel.guild.id,
								owner: {
									id: message.channel.guild.ownerID,
									tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
								}
							},
							statment: st
						}
					});
					embed = {
						title: "NSFW commands are explicitly disabled in this channel.",
						description: `Ask a staff member to re-enable them by removing \`${st}\` from the channel topic`
					};
					
					Object.assign(embed, message.embed_defaults());
					return message.channel.createMessage({ embed });
				}
			}
		}
		if(command.guildOwnerOnly === true && message.author.id !== message.channel.guild.ownerID && !message.user.isDeveloper) {
			this.trackEvent({
				group: "COMMANDS",
				userId: message.author.id,
				event: `commands.${message.command}.errors.guildOwnerOnly`,
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: require("os").hostname()
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
						id: message.channel.guild.id,
						name: message.channel.guild.id,
						owner: {
							id: message.channel.guild.ownerID,
							tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
						}
					}
				}
			});
			embed = {
				title: "Only the owner of this guild (server) can use this!",
				description: `Only the owner of this guild, **${message.channel.guild.owner.user.tag}** can run this.`
			};
			
			Object.assign(embed, message.embed_defaults());
			return message.channel.createMessage({ embed });
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
					server: require("os").hostname()
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
					id: message.channel.guild.id,
					name: message.channel.guild.id,
					owner: {
						id: message.channel.guild.ownerID,
						tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
					}
				}
			}
		});
		if(this.commandTimeout[command.triggers[0]].has(message.author.id) && !message.user.isDeveloper) {
			this.logger.log(`Command timeout encountered by user ${message.author.username}#${message.author.discriminator} (${message.author.id}) on command "${message.command}" in guild ${message.channel.guild.name} (${message.channel.guild.id})`);
			this.trackEvent({
				group: "COMMANDS",
				userId: message.author.id,
				event: `commands.${message.command}.errors.timeout`,
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: require("os").hostname()
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
						id: message.channel.guild.id,
						name: message.channel.guild.id,
						owner: {
							id: message.channel.guild.ownerID,
							tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
						}
					}
				}
			});
			return message.channel.createMessage(`<@!${message.author.id}>, ${this.config.emojis.cooldown}\nPlease wait ${this.ms(command.cooldown)} before using this command again!`);
		}
		this.commandTimeout[command.triggers[0]].add(message.author.id);
		setTimeout((cmd,user) => {this.commandTimeout[cmd].delete(user);}, command.cooldown,command.triggers[0],message.author.id);
		this.logger.command(`Command  "${command.triggers[0]}" ran with arguments "${message.unparsedArgs.join(" ")}" by user ${message.author.username}#${message.author.discriminator} (${message.author.id}) in guild ${message.channel.guild.name} (${message.channel.guild.id})`);
		start = this.performance.now();
		c = await command.run.call(this,message);
		end = this.performance.now();
		this.logger.debug(`Command handler for "${command.triggers[0]}" took ${(end-start).toFixed(3)}ms to execute.`);
		if(c instanceof Error) throw c;
	}catch(error){
		if(error.message === "ERR_INVALID_USAGE") {
			embed = {
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
						value: command.category.split(/(\\+|\/)/).reverse()[0] || "Unknown",
						inline: false
					},{
						name: "Arguments Provided",
						value: message.args.join(" ") || "NONE",
						inline: false
					}/*,{
						name: "Documentation Link",
						value: `${this.config.bot.documentationURL}#command/${command.triggers[0]}`,
						inline: false
					}*/
					// removed due to help being moved fully into bot commands
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
						server: require("os").hostname()
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
						id: message.channel.guild.id,
						name: message.channel.guild.id,
						owner: {
							id: message.channel.guild.ownerID,
							tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
						}
					}
				}
			});
			Object.assign(embed, message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		} else {
			const num = this.random(10,"1234567890"),
				code = `${message.command}.${this.config.beta ? "beta" : "stable"}.${num}`;
			this.logger.error(`[CommandHandler] e1: ${error.name}: ${error.message}\n${error.stack},\nError Code: ${code}`);

			await this.mdb.collection("errors").insertOne({
				id: code,
				num,
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
					server: require("os").hostname()
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
					id: message.channel.guild.id,
					name: message.channel.guild.id,
					owner: {
						id: message.channel.guild.ownerID,
						tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
					}
				}
			});
			this.trackEvent({
				group: "ERRORS",
				userId: message.author.id,
				event: "client.errors",
				properties: {
					command: message.command,
					code,
					num,
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
						server: require("os").hostname()
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
						id: message.channel.guild.id,
						name: message.channel.guild.id,
						owner: {
							id: message.channel.guild.ownerID,
							tag: this.bot.users.has(message.channel.guild.ownerID) ? `${this.bot.users.get(message.channel.guild.ownerID).username}#${this.bot.users.get(message.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(message.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
						}
					}
				}
			});
			const owner = message.channel.guild.members.get(message.channel.guild.ownerID);
			embed = {
				title: "Level One Command Handler Error",
				description: `Error Code: \`${code}\``,
				author: {
					name: message.channel.guild.name,
					icon_url: message.channel.guild.iconURL
				},
				fields: [
					{
						name: "Server",
						value: `Server: ${message.channel.guild.name} (${message.channel.guild.id})\n\
						Server Creation Date: ${new Date(message.channel.guild.createdAt).toString().split("GMT")[0]}\n\
						Owner: ${owner.username}#${owner.discriminator} (${owner.id})`,
						inline: false
					},
					{
						name: "Message",
						value: `Message Content: ${message.content}\n\
						Message ID: ${message.id}\n\
						Channel: ${message.channel.name} (${message.channel.id}, <#${message.channel.id}>)\n\
						Author: ${message.author.username}#${message.author.discriminator} (${message.author.id})`,
						inline: false
					},
					{
						name: "Command",
						value: `Command: ${message.command}\n\
						Arguments: ${message.args.join(" ")}\n\
						Unparsed Args: ${message.unparsedArgs.join(" ")}\n\
						Ran: ${message.content}`,
						inline: false
					},
					{
						name: "Error",
						value: `Name: ${error.name}\n\
						Stack: ${error.stack}\n\
						Message: ${error.message}`,
						inline: false
					}
				]
			};
			await this.bot.executeWebhook(this.config.webhooks.errors.id,this.config.webhooks.errors.token,{ embeds: [ embed ], username: `Error Reporter${this.config.beta ? " - Beta" : ""}` });
			return message.channel.createMessage(`An internal error occured while doing this, tell the people in my support server ${this.config.bot.supportInvite}.\nError code: \`${code}\``);
		}
	}
});