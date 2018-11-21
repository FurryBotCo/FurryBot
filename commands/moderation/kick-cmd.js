module.exports = (async(self,local)=>{
    if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");

    // member mention
    if(local.message.mentions.members.first()) {
        var user = local.message.mentions.members.first();
    }
    
    // user ID
    if(!isNaN(local.args[0]) && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
        var user = local.guild.members.get(local.args[0]);
    }
    
    // username
    if(isNaN(local.args[0]) && local.args[0].indexOf("#") === -1 && !(local.args.length == 0 || !local.args || local.message.mentions.members.first())) {
        var usr = self.users.find(t=>t.username==local.args[0]);
        if(usr instanceof self.Discord.User) var user = local.message.guild.members.get(usr.id);
    }
    
    // user tag
    if(isNaN(local.args[0]) && local.args[0].indexOf("#") !== -1 && !local.message.mentions.members.first()) {
        var usr = self.users.find(t=>t.tag===local.args[0]);
        if(usr instanceof self.Discord.User) var user = local.guild.members.get(usr.id);
    }
    
    if(!user) {
        var data = {
			title: "User not found",
			description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
		}
		Object.assign(data, local.embed_defaults);
		var embed = new self.Discord.MessageEmbed(data);
		return local.channel.send(embed);
    }

    if(user.id === local.member.id && !local.user.isDeveloper) return local.message.reply("Pretty sure you don't want to do this to yourself.");
    if(user.roles.highest.rawPosition >= local.member.roles.highest.rawPosition && local.author.id !== local.guild.owner.id) return local.message.reply(`You cannot ban ${user.user.tag} as their highest role is higher than yours!`);
    if(!user.kickable) return local.message.reply(`I cannot kick ${user.user.tag}! Do they have a higher role than me? Do I have kick permissions?`);
    var reason = local.args.length >= 2 ? local.args.splice(1).join(" ") : "No Reason Specified";
    if(!user.user.bot) var m = await user.user.send(`You were kicked from **${local.guild.name}**\nReason: ${reason}`);
    user.kick(`Kick: ${local.author.tag} -> ${reason}`).then(()=>{
        local.channel.send(`***User ${user.user.tag} was kicked, ${reason}***`).catch(noerr=>null);
    }).catch(async(err)=>{
        local.message.reply(`I couldn't kick **${user.user.tag}**, ${err}`);
        if(m !== undefined) {
            await m.delete();
        }
    })

    if(!local.gConfig.delCmds && local.channel.permissionsFor(self.user.id).has("MANAGE_MESSAGES")) local.message.delete().catch(noerr=>null);
})