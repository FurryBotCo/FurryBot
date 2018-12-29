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
	run: (async (client,message) => {
	
		if(!message.args[0]) {
			var lnk=message.gConfig.prefix !== "f!"?`${client.config.documentationURL}?prefix=${message.gConfig.prefix}${client.config.beta?"&beta":""}`:`${client.config.bot.documentationURL}${client.config.beta?"?beta":""}`;
			return message.channel.send(`You can view our full command documentation here: ${lnk}\n\nMake sure to check the Trello board regularly: <${client.config.apis.trello.board}>\nYou can use **${message.gConfig.prefix}help <command>** to get help with a specific command.\nMake sure to check out our official Twitter account: ${client.config.bot.twitterURL}.\n\nJoin can join our support server here: ${client.config.bot.supportInvite}`);
		}
		
		if(client.commandList.includes(message.args[0])) {
			var command = client.getCommand(message.args[0]);
			
			cd = client.ms(command.cooldown);
			var data = {
				title: "Command Help",
				description: `
				Command: **${message.args[0]}**
				Usage: ${message.gConfig.prefix}${message.args[0]} ${command.usage}
				Description: ${command.description||"No Description"}
				User Permissions: ${command.userPermissions.join(", ")||"NONE"}
				Bot Permissions: ${command.botPermissions.join(", ")||"NONE"}
				NSFW: **${command.nsfw ? "Yes" : "No"}**
				Developer Only: **${command.devOnly ? "Yes" : "No"}**
				Guild Owner Only: **${command.guildOwnerOnly ? "Yes" : "No"}**
				Cooldown: ${client.ms(command.cooldown)}`,
				fields: []
			}
			if(message.user.isDeveloper) data.description+=`\nPath (dev): **${command.path.replace("/","\\")}**`

			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (client.categories.includes(message.args[0])) {
			var category = client.commands.filter(n=>n.name.toLowerCase()===message.args[0].toLowerCase())[0];

			var data = {
				title: "Category Info",
				description: `
				Name: ${category.name}
				Description: ${category.description}
				Commands: ${category.commands.map(c=>c.triggers[0]).join(", ")}`,
				fields: []
			}
			if(message.user.isDeveloper) data.description+=`\nPath (dev): **${category.path}**`;

			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			return message.reply("Please provide a valid command or category.");
		}
	})
};