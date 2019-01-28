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
    run: (async(client,message)=>{
		// extra check, to be safe
		if (!client.config.developers.includes(message.author.id)) {
			return message.reply("You cannot run this command as you are not a developer of this bot.");
		}
        message.channel.startTyping();
        if(message.unparsedArgs.length < 1) return new Error("ERR_INVALID_USAGE");
        
        // get user from message
        var user = await message.getUserFromArgs();
    
        if(!user || !(user instanceof client.Discord.User)) {
            var data = {
                title: "User not found",
                description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
            }
            Object.assign(data, message.embed_defaults());
            var embed = new client.Discord.MessageEmbed(data);
            message.channel.send(embed);
            return message.channel.stopTyping();
        }
        var toRun = [...message.unparsedArgs];
        toRun.shift();
        var runCommand = toRun[0];
        var runArgs = [...toRun];
        runArgs.shift();
        await client.runAs(`${message.gConfig.prefix}${runCommand} ${runArgs.join(" ")}`,user,message.channel);
        var data = {
            title: "Sudo Command",
            description: `Ran command **${runCommand}** with args "${runArgs.join(" ")}" as ${user.tag}`
        }
        Object.assign(data,message.embed_defaults());
        var embed = new client.Discord.MessageEmbed(data);
        message.channel.send(embed);
        return message.channel.stopTyping();
    })
};