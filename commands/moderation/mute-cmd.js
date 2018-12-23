module.exports = {
	triggers: [
        "mute",
        "m"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [
        "MANAGE_ROLES"
    ],
	cooldown: 2.5e3,
	description: "Stop a user from chatting",
	usage: "<@member/id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(self,local)=>{
        if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
    
        // member mention
        if(local.message.mentions.members.first()) {
            var user = local.message.mentions.members.first();
        }
        
        // user ID
        if(!isNaN(local.args[0]) && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
            var user = local.guild.members.get(local.args[0]);
        }
        
        // username
        if(isNaN(local.args[0]) && local.args[0].indexOf("#") === -1 && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
            var usr = self.users.find(t=>t.username===local.args[0]);
            if(usr instanceof self.Discord.User) var user = local.message.guild.members.get(usr.id);
        }
        
        // user tag
        if(isNaN(local.args[0]) && local.args[0].indexOf("#") !== -1 && !local.message.mentions.members.first()) {
            var usr = self.users.find(t=>t.tag===local.args[0]);
            if(usr instanceof self.Discord.User) var user = local.guild.members.get(usr.id);
        }
        
        if(!user) {
            var data = {
                title: "User not found",
                description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
            }
            Object.assign(data, local.embed_defaults());
            var embed = new self.Discord.MessageEmbed(data);
            return local.channel.send(embed);
        }
    
        if(user.id === local.member.id && !local.user.isDeveloper) return local.message.reply("Pretty sure you don't want to do this to yourself.");
        if(user.roles.highest.rawPosition >= local.member.roles.highest.rawPosition && local.author.id !== local.guild.owner.id) return local.message.reply(`You cannot mute ${user.user.tag} as their highest role is higher than yours!`);
        if(user.permissions.has("ADMINISTRATOR")) return local.message.reply("That user has `ADMINISTRATOR`, that would literally do nothing.");
        var reason = local.args.length >= 2 ? local.args.splice(1).join(" ") : "No Reason Specified";
        if(local.gConfig.muteRole === null) {
            var data = {
                title: "No mute role",
                description: `This server does not have a mute role set, you can set this with \`${local.gConfig.prefix}setmuterole <role>\``,
                color: 15601937
            }
            Object.assign(data, local.embed_defaults()("color"));
            var embed = new self.Discord.MessageEmbed(data);
            return local.channel.send(embed);
        }
        if(!local.guild.roles.has(local.gConfig.muteRole)) {
            var data = {
                title: "Mute role not found",
                description: `The mute role specified for this server <@&${local.gConfig.id}> (${local.gConfig.id}) was not found, it has been reset. You can set a new one with \`${local.gConfig.prefix}setmuterole <role>\``,
                color: 15601937
            }
            await self.db.updateGuild(local.guild.id,{muteRole:null});
            Object.assign(data, local.embed_defaults()("color"));
            var embed = new self.Discord.MessageEmbed(data);
            return local.channel.send(embed);
        }
        if(local.guild.roles.get(local.gConfig.muteRole).rawPosition >= local.guild.me.roles.highest.rawPositon) {
            var data = {
                title: "Invalid mute role",
                description: `The current mute role <@&${local.gConfig.id}> (${local.gConfig.id}) seems to be higher than me, please move it below me. You can set a new one with \`${local.gConfig.prefix}setmuterole <role>\``,
                color: 15601937
            }
            Object.assign(data, local.embed_defaults()("color"));
            var embed = new self.Discord.MessageEmbed(data);
            return local.channel.send(embed);
        }
    
        if(user.roles.has(local.gConfig.muteRole)) {
            var data = {
                title: "User already muted",
                description: `The user **${user.user.tag}** seems to already be muted.. You can unmute them with \`${local.gConfig.prefix}unmute @${user.user.tag} [reason]\``,
                color: 15601937
            }
            Object.assign(data, local.embed_defaults()("color"));
            var embed = new self.Discord.MessageEmbed(data);
            return local.channel.send(embed);
        }
        
        user.roles.add(local.gConfig.muteRole,`Mute: ${local.author.tag} -> ${reason}`).then(() => {
            local.channel.send(`***User ${user.user.tag} was muted, ${reason}***`).catch(noerr=>null);
        }).catch(async(err) => {
            local.message.reply(`I couldn't mute **${user.user.tag}**, ${err}`);
            if(m !== undefined) {
                await m.delete();
            }
        })
        if(!local.gConfig.delCmds && local.channel.permissionsFor(self.user.id).has("MANAGE_MESSAGES")) local.message.delete().catch(noerr=>null);
    })
};