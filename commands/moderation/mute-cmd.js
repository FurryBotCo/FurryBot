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
	run: (async(client,message)=>{
        if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
    
        // member mention
        if(message.mentions.members.first()) {
            var user = message.mentions.members.first();
        }
        
        // user ID
        if(!isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
            var user = message.guild.members.get(message.args[0]);
        }
        
        // username
        if(isNaN(message.args[0]) && message.args[0].indexOf("#") === -1 && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
            var usr = client.users.find(t=>t.username===message.args[0]);
            if(usr instanceof client.Discord.User) var user = message.guild.members.get(usr.id);
        }
        
        // user tag
        if(isNaN(message.args[0]) && message.args[0].indexOf("#") !== -1 && !message.mentions.members.first()) {
            var usr = client.users.find(t=>t.tag===message.args[0]);
            if(usr instanceof client.Discord.User) var user = message.guild.members.get(usr.id);
        }
        
        if(!user) {
            var data = {
                title: "User not found",
                description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
            }
            Object.assign(data, message.embed_defaults());
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
    
        if(user.id === message.member.id && !message.user.isDeveloper) return message.reply("Pretty sure you don't want to do this to yourclient.");
        if(user.roles.highest.rawPosition >= message.member.roles.highest.rawPosition && message.author.id !== message.guild.owner.id) return message.reply(`You cannot mute ${user.user.tag} as their highest role is higher than yours!`);
        if(user.permissions.has("ADMINISTRATOR")) return message.reply("That user has `ADMINISTRATOR`, that would literally do nothing.");
        var reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
        if(message.gConfig.muteRole === null) {
            var data = {
                title: "No mute role",
                description: `This server does not have a mute role set, you can set this with \`${message.gConfig.prefix}setmuterole <role>\``,
                color: 15601937
            }
            Object.assign(data, message.embed_defaults("color"));
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
        if(!message.guild.roles.has(message.gConfig.muteRole)) {
            var data = {
                title: "Mute role not found",
                description: `The mute role specified for this server <@&${message.gConfig.id}> (${message.gConfig.id}) was not found, it has been reset. You can set a new one with \`${message.gConfig.prefix}setmuterole <role>\``,
                color: 15601937
            }
            await client.db.updateGuild(message.guild.id,{muteRole:null});
            Object.assign(data, message.embed_defaults("color"));
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
        if(message.guild.roles.get(message.gConfig.muteRole).rawPosition >= message.guild.me.roles.highest.rawPositon) {
            var data = {
                title: "Invalid mute role",
                description: `The current mute role <@&${message.gConfig.id}> (${message.gConfig.id}) seems to be higher than me, please move it below me. You can set a new one with \`${message.gConfig.prefix}setmuterole <role>\``,
                color: 15601937
            }
            Object.assign(data, message.embed_defaults()("color"));
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
    
        if(user.roles.has(message.gConfig.muteRole)) {
            var data = {
                title: "User already muted",
                description: `The user **${user.user.tag}** seems to already be muted.. You can unmute them with \`${message.gConfig.prefix}unmute @${user.user.tag} [reason]\``,
                color: 15601937
            }
            Object.assign(data, message.embed_defaults()("color"));
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        }
        
        user.roles.add(message.gConfig.muteRole,`Mute: ${message.author.tag} -> ${reason}`).then(() => {
            message.channel.send(`***User ${user.user.tag} was muted, ${reason}***`).catch(noerr=>null);
        }).catch(async(err) => {
            message.reply(`I couldn't mute **${user.user.tag}**, ${err}`);
            if(m !== undefined) {
                await m.delete();
            }
        })
        if(!message.gConfig.delCmds && message.channel.permissionsFor(client.user.id).has("MANAGE_MESSAGES")) message.delete().catch(noerr=>null);
    })
};