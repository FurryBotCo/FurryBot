// add: this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: this.r.row("selfAssignableRoles").append("role")})
// remove: this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: this.r.row("selfAssignableRoles").difference(["role"])})
// get: this.r.table("guilds").get(message.guild.id)("selfAssignableRoles")

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
        if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");

        var role = await message.getRoleFromArgs();
        if(!role) return message.errorEmbed("INVALID_ROLE");
        var roles = await this.r.table("guilds").get(message.guild.id)("selfAssignableRoles");
        if(!roles.includes(role.id)) return message.reply("This role is not listed as a self assignable role.");
        await this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: r.row("selfAssignableRoles").difference([role.id])})
        return message.reply(`Removed **${role.name}** from the list of self assignable roles.`);
    })
};