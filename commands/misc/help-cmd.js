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
		let lnk, command, data, embed, category;
		if(!message.args[0]) {
			lnk = message.gConfig.prefix !== "f!"?`${this.config.documentationURL}?prefix=${message.gConfig.prefix}${this.config.beta?"&beta":""}`:`${this.config.bot.documentationURL}${this.config.beta?"?beta":""}`;
			return message.channel.send(`You can view our full command documentation here: ${lnk}\n\nMake sure to check the Trello board regularly: <${this.config.apis.trello.board}>\nYou can use **${message.gConfig.prefix}help <command>** to get help with a specific command.\nMake sure to check out our official Twitter account: ${this.config.bot.twitterURL}.\n\nJoin can join our support server here: ${this.config.bot.supportInvite}`);
		}
		
		if(this.commandList.includes(message.args[0])) {
			command = this.getCommand(message.args[0]);
			
			data = {
				title: "Command Help",
				description: `\
				Command: **${message.args[0]}**\
				Usage: ${message.gConfig.prefix}${message.args[0]} ${command.usage}\
				Description: ${command.description||"No Description"}\
				User Permissions: ${command.userPermissions.join(", ")||"NONE"}\
				Bot Permissions: ${command.botPermissions.join(", ")||"NONE"}\
				NSFW: **${command.nsfw ? "Yes" : "No"}**\
				Developer Only: **${command.devOnly ? "Yes" : "No"}**\
				Guild Owner Only: **${command.guildOwnerOnly ? "Yes" : "No"}**\
				Cooldown: ${this.ms(command.cooldown)}`
			};
			if(message.user.isDeveloper) data.description+=`\nPath (dev): **${command.path.replace("/","\\")}**`;

			Object.assign(data, message.embed_defaults());
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (this.categories.includes(message.args[0])) {
			category = this.commands.filter(n => n.name.toLowerCase()===message.args[0].toLowerCase())[0];

			data = {
				title: "Category Info",
				description: `\
				Name: ${category.name}\
				Description: ${category.description}\
				Commands: ${category.commands.map(c => c.triggers[0]).join(", ")}`
			};
			if(message.user.isDeveloper) data.description+=`\nPath (dev): **${category.path}**`;

			Object.assign(data, message.embed_defaults());
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			return message.reply("Please provide a valid command or category.");
		}
	})
};