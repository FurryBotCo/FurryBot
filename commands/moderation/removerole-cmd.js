module.exports = {
	triggers: [
        "removerole",
        "rr"
    ],
    userPermissions: [
        "MANAGE_ROLES"
    ],
	botPermissions: [
        "MANAGE_ROLES"
    ],
	cooldown: 2e3,
	description: "Remove a role from a user.",
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
        var user = await message.getMemberFromArgs(1);
        
        if(!user) return message.errorEmbed("INVALID_USER");
        

        if(!member.roles.has(role.id)) return message.reply(`${member.user.tag} does not have the role **${role.name}**.`);
        if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.author.id) return message.reply("I will not remove roles higher than or as high as you.");
        if(message.guild.me.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.author.id) return message.reply("That role is higher than or as high as my top role.");
        return message.member.roles.remove(role.id)
        .then(()=>{
            return message.reply(`Removed role ${role.name} from ${member.user.tag}.`);
        })
        .catch(e => {
            return message.reply(`Error removing role ${role.name} from ${member.user.tag}, ${e}`);
        });
    })
};