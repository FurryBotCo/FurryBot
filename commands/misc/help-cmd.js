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
		
		if(!client.commandList.includes(message.args[0])) {
			return message.reply("Invalid command provided");
		}
		
		var command = client.getCommand(message.args[0]);
		console.log(command);
		cd = client.ms(command.cooldown);
		var data = {
			title: "Command Help",
			description: `Command: **${message.args[0]}**`,
			fields: [
			{
				name: "Usage",
				value: `${message.gConfig.prefix}${command.usage}`,
				inline: true
			},{
				name: "Description",
				value: command.description,
				inline: true
			},{
				name: "Bot Permissions",
				value: command.botPermissions.join(", ")||"NONE",
				inline: true
			},{
				name: "User Permissions",
				value: command.userPermissions.join(", ")||"NONE",
				inline: true
			},{
				name: "NSFW",
				value: command.nsfw ? "Yes" : "No",
				inline: true
			},{
				name: "Developer Only",
				value: command.devOnly ? "Yes" : "No",
				inline: true
			},{
				name: "Guild Owner Only",
				value: command.guildOwnerOnly ? "Yes" : "No",
				inline: true
			},{
				name: "Cooldown",
				value: client.ms(command.cooldown),
				inline: true
			}
			]
		};
		
		Object.assign(data, message.embed_defaults());
		var embed = new client.Discord.MessageEmbed(data);
		return message.channel.send(embed);
	})
};