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
        // role mention
        if(message.mentions.roles.first()) {
            var role = message.mentions.roles.first();
        }
        
        // role ID
        if(!isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.roles.first())) {
            var role = message.guild.roles.get(message.args[0]);
        }
        
        // role name
        if(isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.roles.first())) {
            var rl = message.guild.roles.find(r=>r.name.toLowerCase()===message.args[0].toLowerCase());
            if(rl instanceof client.Discord.Role) var role = message.guild.roles.get(rl.id);
        }

        if(!role) {
			var data = {
				title: "Role not found",
				description: "The specified role was not found, please provide one of the following:\nRole mention, role name, role id"
			}
			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
        }


        // member mention
        if(message.mentions.members.first()) {
            var member = message.mentions.members.first();
        }
        
        // user ID
        if(!isNaN(message.args[1]) && !(message.args.length === 1 || !message.args || message.mentions.members.first())) {
            var member = message.guild.members.get(message.args[1]);
        }
        
        // username
        if(isNaN(message.args[1]) && message.args[1].indexOf("#") === -1 && !(message.args.length === 1 || !message.args || message.mentions.members.first())) {
            var usr = client.users.find(t=>t.username.toLowerCase()===message.args[1].toLowerCase());
            if(usr instanceof client.Discord.User) var member = message.guild.members.get(usr.id);
        }
        
        // user tag
        if(isNaN(message.args[1]) && message.args[1].indexOf("#") !== -1 && !message.mentions.members.first()) {
            var usr = client.users.find(t=>t.tag.toLowerCase()===message.args[1].toLowerCase());
            if(usr instanceof client.Discord.User) var member = message.guild.members.get(usr.id);
        }
        
        if(!member) {
			var data = {
				title: "User not found",
				description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
			}
			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
        }
        

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