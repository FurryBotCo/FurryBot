// add: message.client.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: message.client.r.row("selfAssignableRoles").append("role")})
// remove: message.client.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: message.client.r.row("selfAssignableRoles").difference(["role"])})
// get: message.client.r.table("guilds").get(message.guild.id)("selfAssignableRoles")

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
	run: (async(message) => {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let role, roles;
		role = await message.getRoleFromArgs();
		if(!role) return message.errorEmbed("INVALID_ROLE");
		roles = await message.client.r.table("guilds").get(message.guild.id)("selfAssignableRoles");
		if(!roles.includes(role.id)) return message.reply("message.client role is not listed as a self assignable role.");
		await message.client.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: message.client.r.row("selfAssignableRoles").difference([role.id])});
		return message.reply(`Removed **${role.name}** from the list of self assignable roles.`);
	})
};