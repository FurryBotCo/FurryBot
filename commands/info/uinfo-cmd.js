module.exports = (async (self,local) => {
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
	
	var roles = user.roles.map(role=>{if(role.name!=="@everyone"){return `<@&${role.id}>`}else{return "@everyone"}});
	
	if(!user.user.bot) {
		const req = await self.request(`https://discord.services/api/ban/${user.id}`,{
			method: "GET"
		});

		var x = JSON.parse(req.body);
		var ds = typeof x.ban !== "undefined"?`\nReason: ${x.ban.reason}\nProof: [${x.ban.proof}](${x.ban.proof})`:false;
		var db = "Down until further notice";
		var l = self.db.isBlacklisted(user.id);
		var ll = l.banned?`Reason: ${l.reason}\nProof: [${l.proof}](${l.proof})`:false;
		var bl = `Discord.Services: **${ds}**\nDiscord Bans: **${db}**\nLocal: **${ll}**`;
	} else {
		var bl = "Bots cannot be blacklisted.";
		// botlist lookup
	}
	var rr = roles.length > 15?`Too many roles to list, please use **${self.gConfig.prefix}roles ${user.id}**`:roles.toString();
	var data = {
			name: "User info",
			fields: [
			{
				name: "Tag",
				value: user.user.tag,
				inline: true
			},{
				name: "User ID",
				value: user.id,
				inline: true
			},{
				name: "Joined Server",
				value: user.joinedAt.toString().split("GMT")[0],
				inline: true
			},{
				name: "Joined Discord",
				value: user.user.createdAt.toString().split("GMT")[0],
				inline: true
			},{
				name: `Roles [${roles.length}]`,
				value: rr,
				inline: false
			}, {
				name: "Blacklist",
				value: bl,
				inline: false
			}
			]
		};
		Object.assign(data, self.embed_defaults);
		data.thumbnail={url: user.user.displayAvatarURL()};
		var embed = new self.Discord.MessageEmbed(data);
		return self.channel.send(embed);
});