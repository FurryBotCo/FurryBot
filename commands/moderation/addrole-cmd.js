module.exports = {
	triggers: [
        "addrole",
        "ar"
    ],
    userPermissions: [
        "MANAGE_ROLES"
    ],
	botPermissions: [
        "MANAGE_ROLES"
    ],
	cooldown: 2e3,
	description: "Add a role to a user.",
	usage: "<@role/id/name> <@user/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
        if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");
        // get role from message
        var role = await message.getRoleFromArgs();

        if(!role) return message.errorEmbed("INVALID_ROLE");


        // get member from message
        var member = await message.getMemberFromArgs(1);
        
        if(!member) return message.errorEmbed("INVALID_USER");
        

        if(member.roles.has(role.id)) return message.reply(`${member.user.tag} already has the role **${role.name}**.`);
        if(member.roles.highest.rawPosition <= role.rawPosition) return message.reply("I will not assign a role to you that is higher than you.");
        if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("That role is higher than or as high as my top role.");
        return message.member.roles.add(role.id)
        .then(()=>{
            return message.reply(`Added role ${role.name} to ${member.user.tag}.`);
        })
        .catch(e => {
            return message.reply(`Error adding role ${role.name} to ${member.user.tag}, ${e}`);
        });
    })
};