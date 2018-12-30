module.exports = {
	triggers: [
        "kick",
        "k"
    ],
	userPermissions: [
        "KICK_MEMBER"
    ],
	botPermissions: [
        "KICK_MEMBER"
    ],
	cooldown: 2e3,
	description: "Kick members from your server",
	usage: "<@member/id> [reason]",
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
                description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
            }
            Object.assign(data, message.embed_defaults());
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
    
        if(user.id === message.member.id && !message.user.isDeveloper) return message.reply("Pretty sure you don't want to do this to yourclient.");
        if(user.roles.highest.rawPosition >= message.member.roles.highest.rawPosition && message.author.id !== message.guild.owner.id) return message.reply(`You cannot kick ${user.user.tag} as their highest role is higher than yours!`);
        if(!user.kickable) return message.reply(`I cannot kick ${user.user.tag}! Do they have a higher role than me? Do I have kick permissions?`);
        var reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
        if(!user.user.bot) var m = await user.user.send(`You were kicked from **${message.guild.name}**\nReason: ${reason}`);
        user.kick(`Kick: ${message.author.tag} -> ${reason}`).then(() => {
            message.channel.send(`***User ${user.user.tag} was kicked, ${reason}***`).catch(noerr => null);
        }).catch(async(err)=>{
            message.reply(`I couldn't kick **${user.user.tag}**, ${err}`);
            if(m !== undefined) {
                await m.delete();
            }
        })
    
        if(!message.gConfig.delCmds && message.channel.permissionsFor(client.user.id).has("MANAGE_MESSAGES")) message.delete().catch(noerr => null);
    })
};