// add: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: this.mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);

module.exports = {
	triggers: [
		"iam",
		"roleme"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Get a self assignable role",
	usage: "<role>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let roles, b, a, role;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		roles = await this.mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles).then(r => r.map(a => {
			b = message.channel.guild.roles.get(a);
			if(!b) return {id: null,name: null};
			return {name: b.name.toLowerCase(), id: a};
		}));
		if(!roles.map(r => r.name).includes(message.args.join(" ").toLowerCase())) {
			if(message.channel.guild.roles.find(r => r.name.toLowerCase() === message.args.join(" ").toLowerCase())) return message.channel.createMessage(`<@!${message.author.id}>,That role is not self assignable.`);
			return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
		}
		role = roles.filter(r => r.name === message.args.join(" ").toLowerCase());
		if(!role || role.length === 0) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
		role = role[0];
		if(message.member.roles.includes(role.id)) return message.channel.createMessage(`<@!${message.author.id}>, You already have this role.`);
		a = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
		if(a.higher || a.same) return message.channel.createMessage(`<@!${message.author.id}>, That role is higher than, or as high as my highest role.`);
		await message.member.addRole(role.id,"iam command");
		return message.channel.createMessage(`<@!${message.author.id}>, You now have the **${role.name}** role.`);
	})
};