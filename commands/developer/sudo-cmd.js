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
        message.channel.startTyping();
        if(message.unparsedArgs.length < 1) return new Error("ERR_INVALID_USAGE");
        
        // member mention
        if(message.mentions.users.first()) {
            var user = message.mentions.users.first();
        }
        
        // user ID
        if(!isNaN(message.unparsedArgs[0]) && !(message.unparsedArgs.length === 0 || !message.unparsedArgs || message.mentions.users.first())) {
            var user = client.users.get(message.unparsedArgs[0]);
        }
        
        // username
        if(isNaN(message.unparsedArgs[0]) && message.unparsedArgs[0].indexOf("#") === -1 && !(message.unparsedArgs.length === 0 || !message.unparsedArgs || message.mentions.users.first())) {
            var user = client.users.find(t=>t.username===message.unparsedArgs[0]);
        }
        
        // user tag
        if(isNaN(message.unparsedArgs[0]) && message.unparsedArgs[0].indexOf("#") !== -1 && !message.mentions.users.first()) {
            var user = client.users.find(t=>t.tag===message.unparsedArgs[0]);
        }
    
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