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
    run: (async(self,local)=>{
        local.channel.startTyping();
        if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
        
        // member mention
        if(local.message.mentions.users.first()) {
            var user = local.message.mentions.users.first();
        }
        
        // user ID
        if(!isNaN(local.args[0]) && !(local.args.length === 0 || !local.args || local.message.mentions.users.first())) {
            var user = self.users.get(local.args[0]);
        }
        
        // username
        if(isNaN(local.args[0]) && local.args[0].indexOf("#") === -1 && !(local.args.length === 0 || !local.args || local.message.mentions.users.first())) {
            var user = self.users.find(t=>t.username===local.args[0]);
        }
        
        // user tag
        if(isNaN(local.args[0]) && local.args[0].indexOf("#") !== -1 && !local.message.mentions.users.first()) {
            var user = self.users.find(t=>t.tag===local.args[0]);
        }
    
        if(!user || !(user instanceof self.Discord.User)) {
            var data = {
                title: "User not found",
                description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
            }
            Object.assign(data, local.embed_defaults());
            var embed = new self.Discord.MessageEmbed(data);
            local.channel.send(embed);
            return local.channel.stopTyping();
        }
        var toRun = [...local.args];
        toRun.shift();
        var runCommand = toRun[0];
        var runArgs = [...toRun];
        runArgs.shift();
        await self.runAs(`${local.gConfig.prefix}${runCommand} ${runArgs.join(" ")}`,user,local.channel);
        var data = {
            title: "Sudo Command",
            description: `Ran command **${runCommand}** with args "${runArgs.join(" ")}" as ${user.tag}`
        }
        Object.assign(data,local.embed_defaults());
        var embed = new self.Discord.MessageEmbed(data);
        local.channel.send(embed);
        return local.channel.stopTyping();
    })
};