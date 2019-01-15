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
        // get member from message
        if(isNaN(message.args[0])) return message.reply("Please provide a user id.");
        
        var user = client.users.has(message.args[0]) ? client.users.get(message.args[0]) : await client.users.fetch(message.args[0]).catch(e=>false);
    
        if(!user) return message.errorEmbed("INVALID_USER");
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