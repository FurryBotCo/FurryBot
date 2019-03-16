module.exports = {
	triggers: [
		"sudo",
		"runas"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Force another user to run a comand (dev only)",
	usage: "<user> <command> [args]",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) {
			return message.reply("You cannot run this command as you are not a developer of this bot.");
		}
		message.channel.startTyping();
		if(message.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
		let user, data, toRun, runCommand, runArgs, embed;
		// get user from message
		user = await message.getUserFromArgs();
    
		if(!user || !(user instanceof this.Discord.User)) {
			data = {
				title: "User not found",
				description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
			};
			Object.assign(data, message.embed_defaults());
			embed = new this.Discord.MessageEmbed(data);
			message.channel.send(embed);
			return message.channel.stopTyping();
		}
		toRun = [...message.unparsedArgs];
		toRun.shift();
		runCommand = toRun[0];
		runArgs = [...toRun];
		runArgs.shift();
		await this.runAs(`${message.gConfig.prefix}${runCommand} ${runArgs.join(" ")}`,user,message.channel);
		data = {
			title: "Sudo Command",
			description: `Ran command **${runCommand}** with args "${runArgs.join(" ")}" as ${user.tag}`
		};
		Object.assign(data,message.embed_defaults());
		embed = new this.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};