module.exports = {
	triggers: [
        "unban",
        "ub"
    ],
	userPermissions: [
        "BAN_MEMBERS"
    ],
	botPermissions: [
        "BAN_MEMBERS"
    ],
	cooldown: 2e3,
	description: "Remove bans for people that have been previously banned in your server",
	usage: "<id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        // member mention
        if(message.mentions.members.first()) {
           var user = message.mentions.users.first();
       }
       
       // user ID
       if(!isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
           var user = await client.users.fetch(message.args[0]).catch(noerr=>null);
       }
       
       // username
       if(isNaN(message.args[0]) && message.args[0].indexOf("#") === -1 && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
           var usr = client.users.find(t=>t.username===message.args[0]);
           if(usr instanceof client.Discord.User) var user = usr;
       }
       
       // user tag
       if(isNaN(message.args[0]) && message.args[0].indexOf("#") !== -1 && !message.mentions.members.first()) {
           var usr = client.users.find(t=>t.tag===message.args[0]);
           if(usr instanceof client.Discord.User) var user = usr;
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
        if(!(await message.guild.fetchBans()).has(user.id)) {
            var data = {
                title: "User not banned",
                description: `It doesn't look like ${user.tag} is banned here..`
            }
            Object.assign(data, message.embed_defaults());
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
       }
    
       var reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
       message.guild.members.unban(user.id,{reason:`Unban: ${message.author.tag} -> ${reason}`}).then(() => {
           message.channel.send(`***Unbanned ${user.tag}, ${reason}***`).catch(noerr => null);
       }).catch(async(err) => {
           message.reply(`I couldn't unban **${user.tag}**, ${err}`);
           if(m !== undefined) {
               await m.delete();
           }
       });
    
       if(!message.gConfig.delCmds && message.channel.permissionsFor(client.user.id).has("MANAGE_MESSAGES")) message.delete().catch(noerr => null);
    })
};