module.exports = (async(self,local)=>{
    if(local.args.length < 2) return new Error("ERR_INVALID_USAGE");
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
        local.channel.send(embed);
        return local.channel.stopTyping();
    }

    if(user.id === local.member.id && !local.user.isDeveloper) return local.message.reply("Pretty sure you don't want to do this to yourself.");
    if(user.roles.highest.rawPosition >= local.member.roles.highest.rawPosition && local.author.id !== local.guild.owner.id) return local.message.reply(`You cannot warn ${user.user.tag} as their highest role is higher than yours!`);
    var reason = local.args.slice(1).join(" ");

    if(!reason) return local.message.reply("Please provide a reason.");

    var w = await self.db.createUserWarning(user.id,local.guild.id,local.author.id,reason);

    if(!local.gConfig.delCmds && local.channel.permissionsFor(self.user.id).has("MANAGE_MESSAGES")) local.message.delete().catch(noerr=>null);

    var data = {
        title: `User Warned - #${w.id}`,
        description: `User ${user.user.tag} was warned by ${local.author.tag}`,
        fields: [
            {
                name: "Reason",
                value: reason,
                inline: false
            }
        ]
    }
    Object.assign(data,local.embed_defaults);
    var embed = new self.Discord.MessageEmbed(data);
    return local.channel.send(embed);
})