module.exports = {
	triggers: [
        "hackban",
        "hb"
    ],
	userPermissions: [
        "BAN_MEMBERS"
    ],
	botPermissions: [
        "BAN_MEMBERS"
    ],
	cooldown: 2.5e3,
	description: "Ban a person that isn't in your server",
	usage: "<@user/id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        // get user from message
        var user = await message.getUserFromArgs();
   
		if(!user) var user = await this.users.fetch(message.args[0]).catch(u=>false);
        if(!user) return message.errorEmbed("INVALID_USER");
   
       if((await message.guild.fetchBans()).has(user.id)) {
           var data = {
               title: "User already banned",
               description: `It looks like ${user.tag} is already banned here..`
           }
           Object.assign(data, message.embed_defaults());
           var embed = new this.Discord.MessageEmbed(data);
           return message.channel.send(embed);
       }
   
       if(user.id === message.member.id && !message.user.isDeveloper) return message.reply("Pretty sure you don't want to do this to yourthis.");
       var reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
       message.guild.members.ban(user.id,{reason:`Hackban: ${message.author.tag} -> ${reason}`}).then(() {
           message.channel.send(`***User ${user.tag} was banned, ${reason}***`).catch(noerr=>null);
       }).catch(async(err) {
           message.reply(`I couldn't hackban **${user.tag}**, ${err}`);
           if(m !== undefined) {
               await m.delete();
           }
       });
   
       if(!message.gConfig.delCmds && message.channel.permissionsFor(this.user.id).has("MANAGE_MESSAGES")) message.delete().catch(noerr=>null);
   })
};