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

        if(!role) {
			var data = {
				title: "Role not found",
				description: "The specified role was not found, please provide one of the following:\nRole mention, role name, role id"
			}
			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
        }


        // get member from args
        var member = await message.getMemberFromArgs();
        
        if(!member) {
			var data = {
				title: "User not found",
				description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
			}
			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
        }
        

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