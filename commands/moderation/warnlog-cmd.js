module.exports = (async(self,local)=>{
    local.channel.startTyping();
	if(local.args.length == 0 || !local.args || (!isNaN(local.args[0]) && local.args[0].length > 17)) {
        var user = local.member;
        var page = isNaN(local.args[0]) && local.args[0].length > 17 ? local.args[0] : 1;
	} else {
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
    
    var warnings = await self.db.getUserWarnings(user.id,local.guild.id);

    var wr = self.chunk(warnings,10);
    var pages = wr.length;
    if(page > pages) return local.message.reply("Invalid page number.");
    var fields = [];
    for(let key in wr[page-1]) {
        var w = wr[page-1][key];
        var usr = await self.users.fetch(w.blame);
        var blame = !usr ? "Unknown" : usr.tag;
        fields.push({
            name: `#${w.id} - ${new Date(w.timestamp).toDateString()} by **${blame}**`,
            value: w.reason,
            inline: false
        });
    }
    var data = {
        title: `Warn Log for **${user.user.tag}** - Page ${page}/${pages}`,
        fields
    };
    Object.assign(data,local.embed_defaults);
    var embed = new self.Discord.MessageEmbed(data);
    local.channel.send(embed);
    return local.channel.stopTyping();
})