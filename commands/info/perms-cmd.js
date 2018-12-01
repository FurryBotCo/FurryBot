module.exports = (async (self,local) => {
	var allow_user = Object.keys(self._.pickBy(local.member.permissions.serialize(),((val,key) =>{return val;}))),
	deny_user = Object.keys(self._.pickBy(local.member.permissions.serialize(),((val,key) => {return !val;}))),
	allow_bot = Object.keys(self._.pickBy(local.guild.me.permissions.serialize(),((val,key) => {return val;}))),
	deny_bot = Object.keys(self._.pickBy(local.guild.me.permissions.serialize(),((val,key) => {return !val;})));

	var au = allow_user.length === Object.keys(self.Discord.Permissions.FLAGS).length ? "NONE" : allow_user.join("**, **"),
	du = deny_user.length === Object.keys(self.Discord.Permissions.FLAGS).length ? "NONE" : deny_user.join("**, **"),
	ab = allow_bot.length === Object.keys(self.Discord.Permissions.FLAGS).length ? "NONE" : allow_bot.join("**, **"),
	db = deny_bot.length === Object.keys(self.Discord.Permissions.FLAGS).length ? "NONE" : deny_bot.join("**, **");
	var data = {
		title: "Permission Info",
		fields: [
			{
				name: "User",
				value: `__Allow__:\n**${au}**\n\n\n__Deny__:\n**${du}**`,
				inline: false
			},{
				name: "Bot",
				value: `__Allow__:\n**${ab}**\n\n\n__Deny__:\n**${db}**`,
				inline: false
			}
		]
	}
	Object.assign(data,local.embed_defaults());
	var embed = new self.Discord.MessageEmbed(data);
	return local.channel.send(embed);
});