// add: message.client.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: message.client.r.row("selfAssignableRoles").append("role")})
// remove: message.client.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: message.client.r.row("selfAssignableRoles").difference(["role"])})
// get: message.client.r.table("guilds").get(message.guild.id)("selfAssignableRoles")

module.exports = {
	triggers: [
		"iamn",
		"iamnot",
		"rolemenot"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Remove a self assignable role",
	usage: "<role>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let roles, b, role;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		roles = await message.client.r.table("guilds").get(message.guild.id)("selfAssignableRoles").then(r => r.map(a => {
			b = message.guild.roles.get(a);
			if(!b) return {id: null,name: null};
			return {name: b.name.toLowerCase(), id: a};
		}));
		if(!roles.map(r=>r.name).includes(message.args.join(" ").toLowerCase())) {
			if(message.guild.roles.find(r => r.name.toLowerCase() === message.args.join(" ").toLowerCase())) return message.reply("That role is not self assignable.");
			return message.reply("Role not found.");
		}
		role = roles.filter(r => r.name === message.args.join(" ").toLowerCase());
		if(!role) return message.reply("Role not found.");
		if(!message.member.roles.has(role.id)) return message.reply("You don't have this role.");
		if(message.guild.me.roles.highest.rawPosition <= message.guild.roles.get(role.id).rawPosition) return message.reply("That role is higher than, or as high as my highest role.");
		await message.member.roles.add(role.id,"iamnot command");
		return message.reply(`You no longer have the **${role.name}** role.`);
	})
};