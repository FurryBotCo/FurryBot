// add: this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: this.mdb.collection("guilds").findOne({id: message.guild.id}).then(res => res.selfAssignableRoles);

module.exports = {
	triggers: [
		"lsar",
		"listselfassignableroles"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "List self assignable roles",
	usage: "[page]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let roles, page, c, remove, rl, b, data, embed, n;
		roles = this.mdb.collection("guilds").findOne({id: message.guild.id}).then(res => res.selfAssignableRoles);
		page = message.args.length > 0 ? parseInt(message.args[0],10) : 1;
		if(roles.length === 0) return message.reply("There are no roles set as self assignable.");
		c = this.chunk(roles,10);
		if(!page || page > c.length) return message.reply("Invalid page.");
		remove = [];
		rl = roles.map(a => {
			b = message.guild.roles.get(a);
			if(!b) {
				remove.push(a);
				return `Role Not Found - \`${a}\``;
			}
			return b.name;
		}).join("\n");
		if(remove.length > 0) await this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id},{$pull: {selfAssignableRoles: {$each: remove}}});
		data = {
			title: "Self Assignable Roles",
			description: `To gain a role, use the command \`${message.gConfig.prefix}iam <role name>\`\nTo go to the next page, use \`${message.gConfig.prefix}\`lsar [page].\nPage ${page}/${c.length}`,
			fields: [
				{
					name: "Roles",
					value: rl,
					inline: false
				}
			]
		};
		Object.assign(data,message.embed_defaults());
		embed = new this.Discord.MessageEmbed(data);
		return message.channel.send(embed);
	})
};