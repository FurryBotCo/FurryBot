// add: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: this.mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);

module.exports = {
	triggers: [
		"asar",
		"addselfassignablerole"
	],
	userPermissions: [
		"manageRoles" // 268435456
	],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 1e3,
	description: "Add a self assignable role",
	usage: "<@role/role id/role name>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let role, roles, a, b;
		role = await message.getRoleFromArgs();
		if(!role) return message.errorEmbed("INVALID_ROLE");
		a = this.compareMemberWithRole(message.member,role);
		b = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
		if((a.higher || a.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot add roles as high as, or higher than you.`);
		if(b.higher || b.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
		if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
		roles = await this.mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);
		if(roles.includes(role.id)) return message.channel.createMessage(`<@!${message.author.id}>, this role is already listed as a self assignable role.`);
		await  this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id}, {$push: {selfAssignableRoles: role.id}});
		return message.channel.createMessage(`<@!${message.author.id}>, Added **${role.name}** to the list of self assignable roles.`);
	})
};