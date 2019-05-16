module.exports = {
	triggers: [
		"help",
		"h",
		"?"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: .5e3,
	description: "Get some help with the bot",
	usage: "[command or category]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let command, embed, category;
		if(!message.args[0]) {
			//lnk = message.gConfig.prefix !== "f!" ? `${this.config.bot.documentationURL}prefix=${message.gConfig.prefix}` : this.config.bot.documentationURL;
			//return message.channel.createMessage(`You can view our full command documentation here: ${lnk}\n\nMake sure to check the Trello board regularly: <${this.config.apis.trello.board}>\nYou can use **${message.gConfig.prefix}help <command>** to get help with a specific command.\nMake sure to check out our official Twitter account: ${this.config.bot.twitterURL}.\n\nJoin can join our support server here: ${this.config.bot.supportInvite}`);
			const categories = this.commands.map(c => {
				let j = Object.assign({},c);
				j.commands = c.commands.map(cmd => cmd.triggers[0]);
				return j;
			});
			categories.forEach((c) => {
				if((c.name.toLowerCase() === "developer" && !this.config.developers.includes(message.author.id)) || (c.name.toLowerCase() === "custom" && message.channel.guild.id !== this.config.bot.mainGuild)) categories.splice(categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()),categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()));
			});
			embed = {
				title: "Command Help",
				fields: categories.map(c => ({name: `${c.displayName}`,value:`\`${message.gConfig.prefix}help ${c.name}\`\n[Hover for more info](https://google.com '${c.description}\n${c.commands.length} Commands Total')`,inline: true}))
			};
			Object.assign(embed,message.embed_defaults());
			return message.channel.createMessage({ embed });
		}
		
		if(this.commandList.includes(message.args[0].toLowerCase())) {
			command = this.getCommand(message.args[0].toLowerCase());
			
			embed = {
				title: command.triggers[0],
				description: command.description,
				fields: [
					{
						name: "Usage:",
						value: `\`${message.gConfig.prefix}${message.args[0].toLowerCase()} ${command.usage}\``,
						inline: false
					},{
						name: "Restrictions:",
						value: `NSFW: **${command.nsfw ? "Yes" : "No"}**\n\
						Developer Only: **${command.devOnly ? "Yes" : "No"}**\n\
						Guild Owner Only: **${command.guildOwnerOnly ? "Yes": "No"}**`,
						inline: false
					},{
						name: "Permissions",
						value: `Bot: ${command.botPermissions.join(", ") || "NONE"}\n\
						User: ${command.userPermissions.join(", ") || "NONE"}`,
						inline: false
					},{
						name: "Aliases:",
						value: command.triggers.join(", "),
						inline: false	
					},{
						name: "Cooldown",
						value: this.ms(command.cooldown),
						inline: false
					}
				]
			};
			if(this.config.developers.includes(message.author.id)) embed.fields.push({
				name: "Path (dev)",
				value: command.path,
				inline: false
			});
			Object.assign(embed, message.embed_defaults());
			return message.channel.createMessage({ embed });
		} else if (this.categoryList.includes(message.args[0].toLowerCase())) {
			category = this.getCategory(message.args[0].toLowerCase());

			embed = {
				title: category.displayName,
				description: category.description,
				fields: [
					{
						name: "Commands:",
						value: category.commands.map(cmd => cmd.triggers[0]).join(", "),
						inline: false
					}
				]
			};
			if(this.config.developers.includes(message.author.id)) embed.fields.push({
				name: "Path (dev)",
				value: category.path,
				inline: false
			});

			Object.assign(embed, message.embed_defaults());
			return message.channel.createMessage({ embed });
		} else {
			return message.channel.createMessage(`<@!${message.author.id}>, Please provide a valid command or category.`);
		}
	})
};