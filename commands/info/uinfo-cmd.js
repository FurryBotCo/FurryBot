module.exports = (async (self,local) => {
	local.channel.startTyping();
	if(local.args.length == 0 || !local.args) {
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
		Object.assign(data, local.embed_defaults());
		var embed = new self.Discord.MessageEmbed(data);
		return local.channel.send(embed);
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
	var rr = roles.length > 15 ?`Too many roles to list, please use **${local.gConfig.prefix}roles ${user.id}**`:roles.toString();
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
			},{
				name: "Permissions",
				value: `__Allow__:\n**${Object.keys(self._.pickBy(local.member.permissions.serialize(),((val,key)=>{return val}))).join("**, **")}**\n\n\n__Deny__:\n**${Object.keys(self._.pickBy(local.member.permissions.serialize(),((val,key)=>{return !val}))).join("**, **")}**`,
				inline: false
			}
			]
		};
		Object.assign(data, self.embed_defaults());
		data.thumbnail={url: user.user.displayAvatarURL()};
		var embed = new self.Discord.MessageEmbed(data);
		local.channel.send(embed);
		return local.channel.stopTyping();
});
