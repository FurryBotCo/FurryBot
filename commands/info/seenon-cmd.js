module.exports = (async(self,local)=>{
    local.channel.startTyping();
    if(local.args.length === 0 || !local.args) {
		var user = local.member;
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
		if(isNaN(local.args[0]) && local.args[0].indexOf("#") === -1 && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
			var usr = self.users.find(t=>t.username===local.args[0]);
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
		Object.assign(data, local.embed_defaults());
		var embed = new self.Discord.MessageEmbed(data);
		return local.channel.send(embed);
    }
    
    var a = self.guilds.filter(g=>g.members.has(user.id));
    var b = a.map(g=>`${g.name} (${g.id})`),
    guilds = [],
    fields = [],
    i = 0;
    for(let key in b) {
        if(!guilds[i]) guilds[i] = "";
        if(guilds[i].length > 1000 || +guilds[i].length+b[key].length > 1000) {
            i++;
            guilds[i] = b[key];
        } else {
            guilds[i]+=`\n${b[key]}`;
        }
    }
    guilds.forEach((g,c)=>{
        fields.push({
            name: `Server List #${+c+1}`,
            value: g,
            inline: false
        })
    });
    var data = {
        title: `Seen On ${b.length} Servers - ${user.user.tag} (${user.id})`,
        desciption: `I see this user in ${guilds.size} other guilds.`,
        fields
    }
    var embed = new self.Discord.MessageEmbed(data);
    local.channel.send(embed);
    return local.channel.stopTyping();
})