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
	run: (async(message) => {
		let lnk, command, data, embed, category;
		if(!message.args[0]) {
			lnk = message.gConfig.prefix !== "f!"?`${message.client.config.documentationURL}?prefix=${message.gConfig.prefix}${message.client.config.beta?"&beta":""}`:`${message.client.config.bot.documentationURL}${message.client.config.beta?"?beta":""}`;
			return message.channel.send(`You can view our full command documentation here: ${lnk}\n\nMake sure to check the Trello board regularly: <${message.client.config.apis.trello.board}>\nYou can use **${message.gConfig.prefix}help <command>** to get help with a specific command.\nMake sure to check out our official Twitter account: ${message.client.config.bot.twitterURL}.\n\nJoin can join our support server here: ${message.client.config.bot.supportInvite}`);
		}
		
		if(message.client.commandList.includes(message.args[0])) {
			command = message.client.getCommand(message.args[0]);
			
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
				Cooldown: ${message.client.ms(command.cooldown)}`
			};
			if(message.user.isDeveloper) data.description+=`\nPath (dev): **${command.path.replace("/","\\")}**`;

			Object.assign(data, message.embed_defaults());
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (message.client.categories.includes(message.args[0])) {
			category = message.client.commands.filter(n=>n.name.toLowerCase()===message.args[0].toLowerCase())[0];

			data = {
				title: "Category Info",
				description: `\
				Name: ${category.name}\
				Description: ${category.description}\
				Commands: ${category.commands.map(c=>c.triggers[0]).join(", ")}`
			};
			if(message.user.isDeveloper) data.description+=`\nPath (dev): **${category.path}**`;

			Object.assign(data, message.embed_defaults());
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			return message.reply("Please provide a valid command or category.");
		}
	})
};