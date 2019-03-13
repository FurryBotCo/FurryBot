// add: this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: this.mdb.collection("guilds").findOne({id: message.guild.id}).then(res => res.selfAssignableRoles);

module.exports = {
	triggers: [
		"rsar",
		"removeselfassignablerole"
	],
	userPermissions: [
		"MANAGE_ROLES"
	],
	botPermissions: [
		"MANAGE_ROLES"
	],
	cooldown: 1e3,
	description: "Remove a self assignable role",
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
		roles = await this.mdb.collection("guilds").findOne({id: message.guild.id}).then(res => res.selfAssignableRoles);
		if(!roles.includes(role.id)) return message.reply("this role is not listed as a self assignable role.");
		await this.mdb.collection("guilds").findOneAndUpdate({id: message.guild.id},{$pull: {selfAssignableRoles: role.id}});
		return message.reply(`Removed **${role.name}** from the list of self assignable roles.`);
	})
};