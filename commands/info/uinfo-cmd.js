module.exports = {
	triggers: [
		"uinfo",
		"userinfo"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get some info on a user",
	usage: "[@member/id]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
		message.channel.startTyping();
		if(message.args.length === 0 || !message.args) {
			var user = message.member;
		} else {
			// member mention
			if(message.mentions.members.first()) {
				var user = message.mentions.members.first();
			}
			
			// user ID
			if(!isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
				var user = message.guild.members.get(message.args[0]);
			}
			
			// username
			if(isNaN(message.args[0]) && message.args[0].indexOf("#") === -1 && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
				var usr = client.users.find(t=>t.username===message.args[0]);
				if(usr instanceof client.Discord.User) var user = message.guild.members.get(usr.id);
			}
			
			// user tag
			if(isNaN(message.args[0]) && message.args[0].indexOf("#") !== -1 && !message.mentions.members.first()) {
				var usr = client.users.find(t=>t.tag===message.args[0]);
				if(usr instanceof client.Discord.User) var user = message.guild.members.get(usr.id);
			}
		}
	
		
		if(!user) {
			var data = {
				title: "User not found",
				description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
			}
			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
		
		var roles = user.roles.map(role=>{if(role.name!=="@everyone"){return `<@&${role.id}>`}else{return "@everyone"}});
		
		if(!user.user.bot) {
			const req = await client.request(`https://discord.services/api/ban/${user.id}`,{
				method: "GET"
			});
	
			var x = JSON.parse(req.body);
			var ds = typeof x.ban !== "undefined"?`\nReason: ${x.ban.reason}\nProof: [${x.ban.proof}](${x.ban.proof})`:false;
			var db = "Down until further notice";
			var l = client.db.isBlacklisted(user.id);
			var ll = l.banned?`Reason: ${l.reason}\nProof: [${l.proof}](${l.proof})`:false;
			var bl = `Discord.Services: **${ds}**\nDiscord Bans: **${db}**\nmessage: **${ll}**`;
		} else {
			var bl = "Bots cannot be blacklisted.";
			// botlist lookup
		}
		var rr = roles.length > 15 ?`Too many roles to list, please use **${message.gConfig.prefix}roles ${user.id}**`:roles.toString();
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
				}/*,{
					name: "Permissions",
					value: `__Allow__:\n**${Object.keys(client._.pickBy(message.member.permissions.serialize(),((val,key)=>{return val}))).join("**, **")}**\n\n\n__Deny__:\n**${Object.keys(client._.pickBy(message.member.permissions.serialize(),((val,key)=>{return !val}))).join("**, **")}**`,
					inline: false
				}*/
				]
			};
			Object.assign(data, message.embed_defaults());
			data.thumbnail={url: user.user.displayAvatarURL()};
			var embed = new client.Discord.MessageEmbed(data);
			message.channel.send(embed);
			return message.channel.stopTyping();
	})
};