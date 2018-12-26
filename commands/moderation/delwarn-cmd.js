module.exports = {
	triggers: [
        "delwarn",
        "rmwarn"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Delete a users warning",
	usage: "<@member/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");
    
        // member mention
        if(message.mentions.members.first()) {
            var user = message.mentions.members.first();
        }
        
        // user ID
        if(!isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
            var user = message.guild.members.get(message.args[0]);
        }
        
        // username
        if(isNaN(message.args[0]) && message.args[0].indexOf("#") === -1 && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
            var usr = client.users.find(t=>t.username===message.args[0]);
            if(usr instanceof client.Discord.User) var user = message.guild.members.get(usr.id);
        }
        
        // user tag
        if(isNaN(message.args[0]) && message.args[0].indexOf("#") !== -1 && !message.mentions.members.first()) {
            var usr = client.users.find(t=>t.tag===message.args[0]);
            if(usr instanceof client.Discord.User) var user = message.guild.members.get(usr.id);
        }
    
        if(!user) {
            var data = {
                title: "User not found",
                description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag\n\n(tip: the user must be the first argument)"
            }
            Object.assign(data, message.embed_defaults());
            var embed = new client.Discord.MessageEmbed(data);
            message.channel.send(embed);
        }
    
        if(isNaN(message.args[1])) return message.reply(`Please provide a valid warning id as the second argument.`);
    
        var w = await client.db.deleteUserWarning(user.id,message.guild.id,message.args[1]);
    
        if(!w) {
            var data = {
                title: "Failure",
                description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.user.tag}** has a warning with the id ${message.args[1]}.`,
                color: 15601937
            }
            Object.assign(data,message.embed_defaults("color"));
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        } else {
            var data = {
                title: "Success",
                description: `Deleted warning #${message.args[1]} for user **${user.user.tag}**.`,
                color: 41728
            }
            Object.assign(data,message.embed_defaults("color"));
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
    })
};