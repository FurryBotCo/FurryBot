// add: this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: this.mdb.collection("guilds").findOne({id: message.guild.id}).then(res => res.selfAssignableRoles);

module.exports = {
	triggers: [
		"asar",
		"addselfassignablerole"
	],
	userPermissions: [
		"MANAGE_ROLES"
	],
	botPermissions: [
		"MANAGE_ROLES"
	],
	cooldown: 1e3,
	description: "Add a self assignable role",
	usage: "<@role/role id/role name>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let role, roles;
		role = await message.getRoleFromArgs();
		if(!role) return message.errorEmbed("INVALID_ROLE");
		if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot add roles as high as, or higher than you.");
		if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
		if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
		roles = await this.mdb.collection("guilds").findOne({id: message.guild.id}).then(res => res.selfAssignableRoles);
		if(roles.includes(role.id)) return message.reply("this role is already listed as a self assignable role.");
		await  this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id}, {$push: {selfAssignableRoles: role.id}});
		return message.reply(`Added **${role.name}** to the list of self assignable roles.`);
	})
};