module.exports = {
	triggers: [
        "role"
    ],
    userPermissions: [
        "MANAGE_ROLES"
    ],
	botPermissions: [
        "MANAGE_ROLES"
    ],
	cooldown: 2e3,
	description: "Manage roles for a single user, or multiple!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
        if(message.args.length === 0 || message.args[0] === "help") {

        }

        var member = await message.getMemberFromArgs();
        if(member) {
            if(message.args.length <= 1) return message.reply("Please provide a role to add or remove!");
            var r = await message.getRoleFromArgs(1);
            if(!r) {
                // operation
                // 0: toggle
                // 1: add
                // 2: remove
                if(message.args[1].startsWith("-") || message.args[1].startsWith("+")) {
                    var a = message.args[1].slice(0,1);
                    var operation = a === "+" ? 1 : 2;
                    var l = message.args[1].slice(1);
                } else {
                    var l = message.args[1];
                    var operation = 0;
                }
                var role = message.guild.roles.find(r=>r.name.toLowerCase === l.tolowerCase());
                if(!role) return message.reply("Role not found.");
            } else {
                var role = r;
            }
            if(message.member.roles.highest.rawPosition >= role.rawPosition && !message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
            if(message.guild.me.roles.highest.rawPosition >= role.rawPosition) return message.reply("This role is higher than, or as high as me, I cannot remove or assign it.");
            if(role.managed) return message.reply("This role is managed (likely permissions for a bot), these cannot be removed or assigned.");
            switch(operation) {
                case 1:
                    if(member.roles.has(role.id)) return message.reply(`No action was taken, as **${member.user.tag}** already has the role ${role.name}`);
                    return member.roles.add(role.id,`Command: ${message.author.tag} -> Add role ${role.name} to ${member.user.tag}`).then(() => {
                        return message.reply(`Added role **${role.name}** to **${member.user.tag}**`);
                    }).catch((e) => {
                        return message.reply(`Command failed: ${e}`);
                    });
                    break;

                case 2:
                    if(!member.roles.has(role.id)) return message.reply(`No action was taken, as **${member.user.tag}** does not have the role ${role.name}`);
                    return member.roles.add(role.id,`Command: ${message.author.tag} -> Remove role ${role.name} from ${member.user.tag}`).then(() => {
                        return message.reply(`Removed role **${role.name}** from **${member.user.tag}**`);
                    }).catch((e) => {
                        return message.reply(`Command failed: ${e}`);
                    });
                    break;

                default:
                    if(member.roles.has(role.id)) {
                        return member.roles.remove(role.id,`Command: ${message.author.tag} -> Remove role ${role.name} from ${member.user.tag}`).then(() => {
                            return message.reply(`Remove role **${role.name}** from **${member.user.tag}**`);
                        }).catch((e) => {
                            return message.reply(`Command failed: ${e}`);
                        });
                    } else {
                        return member.roles.add(role.id,`Command: ${message.author.tag} -> Add role ${role.name} to ${member.user.tag}`).then(() => {
                            return message.reply(`Added role **${role.name}** to **${member.user.tag}**`);
                        }).catch((e) => {
                            return message.reply(`Command failed: ${e}`);
                        });
                    }
            }
        }

        var r = await message.getRoleFromArgs();
        if(r) {
            var data = {
                title: `Role info - ${r.name} (${r.id})`,
                fields: [
                    {
                        name: "Hoisted",
                        value: r.hoist ? "Yes" : "No",
                        inline: false
                    },{
                        name: "Managed",
                        value: r.managed ? "Yes" : "No",
                        inline: false
                    },{
                        name: "Hex Color",
                        value: r.hexColor,
                        inline: false
                    },{
                        name: "Members With Role",
                        value: r.guild.members.filter(m=>m.roles.has(r.id)).size,
                        inline: false
                    }
                ]
            }
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }

        if(!["in","add","remove","all","humans","bots"].includes(message.args[0].toLowerCase())) return new Error("ERR_INVALID_USAGE");
        switch(message.args[0].toLowerCase()) {
            case "in":
                var role = await message.getRoleFromArgs(1);
                if(!role) return message.reply("Role not found.");
                if(message.args.length === 2) {
                    var count = role.guild.members.filter(m=>m.roles.has(role.id)).size;
                    return message.reply(`${count} users has the role ${role.name}.`);
                }
                if(!role2) return message.reply("Second role not found.");
                var role2 = await message.getMemberFromArgs(2);
                role.members.forEach(async(m) => {
                    await m.roles.add(role2.id,`Command: ${message.author.tag} -> Add role ${role2.name} to users in role ${role.name}`).catch(noerr => null);
                });
                var count = role.guild.members.filter(m=>m.roles.has(role.id)).size;
                var skipCount = role.guild.members.filter(m=>m.roles.has(role2.id)).size;
                return message.reply(`Changed roles for ${count} users (skipped ${skipCount - count})`);
                break;
        } 
    })
};

// TODO: add, remove, all, humans, bots