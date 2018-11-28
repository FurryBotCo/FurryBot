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
			description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag\n\n(tip: the user must be the first argument)"
		}
		Object.assign(data, local.embed_defaults());
		var embed = new self.Discord.MessageEmbed(data);
        local.channel.send(embed);
    }
    var w = await self.db.clearUserWarnings(user.id,local.guild.id);

    if(!w) {
        var data = {
            title: "Failure",
            description: `Either you provided an invalid user, or there was an internal error. Make sure the user **${user.user.tag}** has at least __*one*__ warning before using this.`,
            color: 15601937
        }
        Object.assign(data,local.embed_defaults()("color"));
        var embed = new self.Discord.MessageEmbed(data);
        return local.channel.send(embed);
    } else {
        var data = {
            title: "Success",
            description: `Cleared warnings for user **${user.user.tag}**.`,
            color: 41728
        }
        Object.assign(data,local.embed_defaults()("color"));
        var embed = new self.Discord.MessageEmbed(data);
        return local.channel.send(embed);
    }
})