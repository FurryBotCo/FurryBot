module.exports = {
	triggers: [
		"perms",
		"listperms"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Check your own and the bots permissions",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let allow_user, deny_user, allow_bot, deny_bot, au, du, ab, db, embed, b;
		b = message.channel.permissionsOf(this.bot.user.id);
		allow_user = [],
		deny_user = [],
		allow_bot = [],
		deny_bot = [];
	
		for(let p in this.config.Permissions.constant) {
			if(message.member.permission.allow & this.config.Permissions.constant[p]) allow_user.push(p);
			else deny_user.push(p);
		}

		for(let p in this.config.Permissions.constant) {
			if(b.allow & this.config.Permissions.constant[p]) allow_bot.push(p);
			else deny_bot.push(p);
		}

		au = allow_user.length === 0 ? "NONE" : allow_user.join("**, **"),
		du = deny_user.length === Object.keys(this.config.Permissions.constant).length ? "NONE" : deny_user.join("**, **"),
		ab = allow_bot.length === 0 ? "NONE" : allow_bot.join("**, **"),
		db = deny_bot.length === Object.keys(this.config.Permissions.constant).length ? "NONE" : deny_bot.join("**, **");
		embed = {
			title: "Permission Info",
			fields: [
				{
					name: "User",
					value: `__Allow__:\n**${au.length === 0 ? "NONE" : au
					}**\n\n\n__Deny__:\n**${du.length === 0 ? "NONE" : du}**`,
					inline: false
				},{
					name: "Bot",
					value: `__Allow__:\n**${ab.length === 0 ? "NONE" : ab}**\n\n\n__Deny__:\n**${db.length === 0 ? "NONE" : db}**`,
					inline: false
				}
			]
		};
		Object.assign(embed,message.embed_defaults());
		return message.channel.createMessage({ embed });
	})
};