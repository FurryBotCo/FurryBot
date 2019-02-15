module.exports = {
	triggers: [
        "ban",
        "b"
    ],
	userPermissions: [
        "BAN_MEMBERS"
    ],
	botPermissions: [
        "BAN_MEMBERS"
    ],
	cooldown: 1e3,
	description: "Ban members from your server",
	usage: "<@member/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
    
        // get member from message
        var user = await message.getMemberFromArgs();
        
        if(!user) return message.errorEmbed("INVALID_USER");
    
        if((await message.guild.fetchBans()).has(user.id)) {
            var data = {
                title: "User already banned",
                description: `It looks like ${user.tag} is already banned here..`
            }
            Object.assign(data, message.embed_defaults());
            var embed = new this.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
    
        if(user.id === message.member.id && !message.user.isDeveloper) return message.reply("Pretty sure you don't want to do this to yourthis.");
        if(user.roles.highest.rawPosition >= message.member.roles.highest.rawPosition && message.author.id !== message.guild.owner.id) return message.reply(`You cannot ban ${user.user.tag} as their highest role is higher than yours!`);
        if(!user.bannable) return message.reply(`I cannot ban ${user.tag}! Do they have a higher role than me? Do I have ban permissions?`);
        var reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
        if(!user.user.bot) var m = await user.user.send(`You were baned from **${message.guild.name}**\nReason: ${reason}`);
        user.ban({reason:`Ban: ${message.author.tag} -> ${reason}`,days:7}).then(() {
            message.channel.send(`***User ${user.user.tag} was banned, ${reason}***`).catch(noerr => null);
        }).catch(async(err) {
            message.reply(`I couldn't ban **${user.user.tag}**, ${err}`);
            if(m !== undefined) {
                await m.delete();
            }
        });
        if(!message.gConfig.delCmds && message.channel.permissionsFor(this.user.id).has("MANAGE_MESSAGES")) message.delete().catch(noerr => null);
    })
};