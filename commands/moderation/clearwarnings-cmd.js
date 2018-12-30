module.exports = {
	triggers: [
        "clearwarnings",
        "warnclear"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Clear warnings for a user",
	usage: "<@member/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
    
        // get member from message
        var user = await message.getMemberFromArgs();
    
        if(!user) {
            var data = {
                title: "User not found",
                description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag\n\n(tip: the user must be the first argument)"
            }
            Object.assign(data, message.embed_defaults());
            var embed = new client.Discord.MessageEmbed(data);
            message.channel.send(embed);
        }
        var w = await client.db.clearUserWarnings(user.id,message.guild.id);
    
        if(!w) {
            var data = {
                title: "Failure",
                description: `Either you provided an invalid user, or there was an internal error. Make sure the user **${user.user.tag}** has at least __*one*__ warning before using this.`,
                color: 15601937
            }
            Object.assign(data,message.embed_defaults("color"));
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        } else {
            var data = {
                title: "Success",
                description: `Cleared warnings for user **${user.user.tag}**.`,
                color: 41728
            }
            Object.assign(data,message.embed_defaults("color"));
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
    })
};