module.exports=(async (self,local) => {
	
	if(!local.args[0]) {
		var lnk=local.gConfig.prefix != "f!"?`${self.config.documentationURL}?prefix=${local.gConfig.prefix}`:config.documentationURL;
		return local.channel.send(`You can view our full command documentation here: ${lnk}\n\nMake sure to check the Trello board regularly: <${self.config.trello.board}>\nYou can use **${local.gConfig.prefix}help <command>** to get help with a specific command.\nMake sure to check out our official Twitter account: ${self.config.twitterAccountURL}.\n\nJoin can join our support server here: ${self.config.discordSupportInvite}`);
	}
	
	if(self.config.commandList.all.indexOf(local.args[0]) === -1) {
		return local.message.reply("Invalid command provided");
	}
	
	var command = self.config.commandList.fullList[local.args[0]];
	cd = self.ms(command.cooldown);
	var data = {
		title: "Command Help",
		description: `Command: **${local.args[0]}**`,
		fields: [
		{
			name: "Usage",
			value: `${local.gConfig.prefix}${command.usage}`,
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
			value: self.ucwords(command.nsfw),
			inline: true
		},{
			name: "Developer Only",
			value: self.ucwords(command.devOnly),
			inline: true
		},{
			name: "Guild Owner Only",
			value: self.ucwords(command.guildOwnerOnly),
			inline: true
		},{
			name: "Cooldown",
			value: self.ucwords(self.ms(command.cooldown)),
			inline: true
		}
		]
	};
	
	Object.assign(data, self.embed_defaults);
	var embed = new self.Discord.MessageEmbed(data);
	return local.channel.send(embed);
});