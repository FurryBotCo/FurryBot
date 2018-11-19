module.exports = (async(self,local)=>{
    Object.assign(self,local);
    if(self.args.length == 0 || !self.args) {
		var user = self.member;
	} else {
		// member mention
		if(self.message.mentions.members.first()) {
			var user = self.message.mentions.members.first();
		}
		
		// user ID
		if(!isNaN(self.args[0]) && !(self.args.length === 0 || !self.args || self.message.mentions.members.first())) {
			var user = self.guild.members.get(args[0]);
		}
		
		// username
		if(isNaN(self.args[0]) && self.args[0].indexOf("#") === -1 && !(self.args.length == 0 || !self.args || self.message.mentions.members.first())) {
			var usr = self.users.find(t=>t.username==args[0]);
			if(usr instanceof self.Discord.User) var user = self.message.guild.members.get(usr.id);
		}
		
		// user tag
		if(isNaN(self.args[0]) && self.args[0].indexOf("#") !== -1 && !self.message.mentions.members.first()) {
			var usr = self.users.find(t=>t.tag===args[0]);
			if(usr instanceof self.Discord.User) var user = self.guild.members.get(usr.id);
		}
	}

	
	if(!user) {
		var data = {
			title: "User not found",
			description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
		}
		Object.assign(data, self.embed_defaults);
		var embed = new self.Discord.MessageEmbed(data);
		return self.channel.send(embed);
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
    return self.channel.send(embed);
})