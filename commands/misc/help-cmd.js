module.exports = {
	triggers: [
		"help",
		"h",
		"?"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: .5e3,
	description: "Get some help with the bot",
	usage: "[command or category]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let command, data, embed, category;
		if(!message.args[0]) {
			//lnk = message.gConfig.prefix !== "f!" ? `${this.config.bot.documentationURL}prefix=${message.gConfig.prefix}` : this.config.bot.documentationURL;
			//return message.channel.send(`You can view our full command documentation here: ${lnk}\n\nMake sure to check the Trello board regularly: <${this.config.apis.trello.board}>\nYou can use **${message.gConfig.prefix}help <command>** to get help with a specific command.\nMake sure to check out our official Twitter account: ${this.config.bot.twitterURL}.\n\nJoin can join our support server here: ${this.config.bot.supportInvite}`);
			const categories = this.commands.map(c => {
                let j = Object.assign({},c);
                j.commands = c.commands.map(cmd => cmd.triggers[0]);
                return j;
			});
			categories.forEach((c) => {
				if((c.name.toLowerCase() === "developer" && !this.config.developers.includes(message.author.id)) || (c.name.toLowerCase() === "custom" && message.guild.id !== this.config.bot.mainGuild)) categories.splice(categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()),categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()));
			})
			data = {
				title: "Command Help",
				fields: categories.map(c => ({name: `${c.displayName}`,value:`\`${message.gConfig.prefix}help ${c.name}\`\n[Hover for more info](https://google.com '${c.description}\n${c.commands.length} Commands Total')`,inline: true}))
			}
			Object.assign(data,message.embed_defaults());
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
		
		if(this.commandList.includes(message.args[0])) {
			command = this.getCommand(message.args[0]);
			
			data = {
				title: command.triggers[0],
				description: command.description,
				fields: [
					{
						name: "Usage:",
						value: `\`${message.gConfig.prefix}${command.usage}\``,
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
			}
			if(this.config.developers.includes(message.author.id)) data.fields.push({
				name: "Path (dev)",
				value: command.path,
				inline: false
			});
			Object.assign(data, message.embed_defaults());
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (this.categoryList.includes(message.args[0])) {
			category = this.getCategory(message.args[0].toLowerCase());

			data = {
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
			if(this.config.developers.includes(message.author.id)) data.fields.push({
				name: "Path (dev)",
				value: category.path,
				inline: false
			});

			Object.assign(data, message.embed_defaults());
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			return message.reply("Please provide a valid command or category.");
		}
	})
};