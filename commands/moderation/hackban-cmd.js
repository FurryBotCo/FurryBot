module.exports = (async(self,local)=>{
     // member mention
     if(local.message.mentions.members.first()) {
        var user = local.message.mentions.users.first();
    }
    
    // user ID
    if(!isNaN(local.args[0]) && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
        var user = await self.users.fetch(local.args[0]).catch(noerr=>null);
    }
    
    // username
    if(isNaN(local.args[0]) && local.args[0].indexOf("#") === -1 && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
        var usr = self.users.find(t=>t.username===local.args[0]);
        if(usr instanceof self.Discord.User) var user = usr;
    }
    
    // user tag
    if(isNaN(local.args[0]) && local.args[0].indexOf("#") !== -1 && !local.message.mentions.members.first()) {
        var usr = self.users.find(t=>t.tag===local.args[0]);
        if(usr instanceof self.Discord.User) var user = usr;
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

    if((await local.guild.fetchBans()).has(user.id)) {
        var data = {
            title: "User already banned",
            description: `It looks like ${user.tag} is already banned here..`
        }
        Object.assign(data, local.embed_defaults());
        var embed = new self.Discord.MessageEmbed(data);
        return local.channel.send(embed);
    }

    if(user.id === local.member.id && !local.user.isDeveloper) return local.message.reply("Pretty sure you don't want to do this to yourself.");
    var reason = local.args.length >= 2 ? local.args.splice(1).join(" ") : "No Reason Specified";
    local.guild.members.ban(user.id,{reason:`Hackban: ${local.author.tag} -> ${reason}`}).then(()=>{
        local.channel.send(`***User was banned ${user.tag}, ${reason}***`).catch(noerr=>null);
    }).catch(async(err)=>{
        local.message.reply(`I couldn't hackban **${user.tag}**, ${err}`);
        if(m !== undefined) {
            await m.delete();
        }
    });

    if(!local.gConfig.delCmds && local.channel.permissionsFor(self.user.id).has("MANAGE_MESSAGES")) local.message.delete().catch(noerr=>null);
})