// add: this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: this.r.row("selfAssignableRoles").append("role")})
// remove: this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: this.r.row("selfAssignableRoles").difference(["role"])})
// get: this.r.table("guilds").get(message.guild.id)("selfAssignableRoles")

module.exports = {
	triggers: [
        "lsar",
        "listselfassignableroles"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "List self assignable roles",
	usage: "[page]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        var roles = await this.r.table("guilds").get(message.guild.id)("selfAssignableRoles");
        var page = message.args.length > 0 ? parseInt(message.args[0],10) : 1;
        var c = this.chunk(roles,10);
        if(!page || page > c.length) return message.reply("Invalid page.");
        var remove = [];
        var rl = roles.map(a => {
            var b = message.guild.roles.get(a);
            if(!b) {
                remove.push(a);
                retur// add: this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: this.r.row("selfAssignableRoles").append("role")})
// remove: this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: this.r.row("selfAssignableRoles").difference(["role"])})
// get: this.r.table("guilds").get(message.guild.id)("selfAssignableRoles")

module.exports = {
	triggers: [
        "lsar",
        "listselfassignableroles"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "List self assignable roles",
	usage: "[page]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        var roles = await this.r.table("guilds").get(message.guild.id)("selfAssignableRoles");
        var page = message.args.length > 0 ? parseInt(message.args[0],10) : 1;
        var c = this.chunk(roles,10);
        if(!page || page > c.length) return message.reply("Invalid page.");
        var remove = [];
        var rl = roles.map(a => {
            var b = message.guild.roles.get(a);
            if(!b) {
                remove.push(a);
                return `Role Not Found - \`${a}\``;
            }
            return b.name;
        }).join("\n");
        if(remove.length > 0) await this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: this.r.row("selfAssignableRoles").difference(remove)});;
        var data = {
            title: "Self Assignable Roles",
            description: `To gain a role, use the command \`${message.gConfig.prefix}iam <role name>\`\nTo go to the next page, use \`${message.gConfig.prefix}\`lsar [page].\nPage ${page}/${c.length}`,
            fields: [
                {
                    name: "Roles",
                    value: rl,
                    inline: false
                }
            ]
        }
        Object.assign(data,message.embed_defaults());
        var embed = new this.Discord.MessageEmbed(data);
        return message.channel.send(embed);
    })
};n `Role Not Found - \`${a}\``;
            }
            return b.name;
        }).join("\n");
        if(remove.length > 0) await this.r.table("guilds").get(message.guild.id).update({selfAssignableRoles: this.r.row("selfAssignableRoles").difference(remove)});;
        var data = {
            title: "Self Assignable Roles",
            description: `To gain a role, use the command \`${message.gConfig.prefix}iam <role name>\`\nTo go to the next page, use \`${message.gConfig.prefix}\`lsar [page].\nPage ${page}/${c.length}`,
            fields: [
                {
                    name: "Roles",
                    value: rl,
                    inline: false
                }
            ]
        }
        Object.assign(data,message.embed_defaults());
        var embed = new this.Discord.MessageEmbed(data);
        return message.channel.send(embed);
    })
};