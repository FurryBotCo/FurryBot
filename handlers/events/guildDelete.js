module.exports = (async(self,guild)=>{
    await self.db.updateDailyCount(true);
    await self.db.deleteGuild(guild.id);
    self.logger.log(`Guild left: ${guild.name} (${guild.id}). This guild had ${guild.memberCount} members.`);
    var textChCount = 0,
	voiceChCount = 0,
    categoryChCount = 0;
    guild.channels.forEach((ch) => {
		switch (ch.type) {
			case "text":
				textChCount++;
				break;

			case "voice":
				voiceChCount++;
				break;
				
			case "category":
				categoryChCount++;
				break;
		}
    });
    var o = guild.members.find(m=>m.id===guild.owner.id);
	if(!o) {
		var owner="Unknown";
	} else {
		owner = `${o.user.tag} (${o.id})`;
    }
    var data = {
        title: "Guild Left!",
        description: `RIP Guild Number ${+self.guilds.size+1}`,
        image: {
            url: guild.iconURL()||"https://assets.mcprocdn.com/images/noicon.png"
        },
        thumbnail: {
            url: guild.owner.user.displayAvatarURL()
        },
        author: {
            name: guild.owner.user.tag,
            icon: guild.owner.user.displayAvatarURL()
        },
        fields: [
            {
                name: "Name",
                value: `${guild.name} (${guild.id})`,
                inline: false
            },{
                name: "Members",
                value: `Total: ${guild.memberCount}\n\n${self.config.emojis.online}: ${guild.members.filter(m=>m.user.presence.status==="online").size}\n${self.config.emojis.idle}: ${guild.members.filter(m=>m.user.presence.status==="idle").size}\n${self.config.emojis.dnd}: ${guild.members.filter(m=>m.user.presence.status==="dnd").size}\n${self.config.emojis.offline}: ${guild.members.filter(m=>m.user.presence.status==="offline").size}\nUser Count: ${guild.members.filter(m=>m.user.bot===false).size}\nBot Count: ${guild.members.filter(m=>m.user.bot===true).size}`,
                inline: false
            },{
                name: "Large Guild (300+ Members)",
                value: guild.large?"Yes":"No",
                inline: false
            },{
                name: "Guild Owner",
                value: `${guild.owner.user.tag} (${guild.owner.user.id})`
            }
        ],
        timestamp: self.getCurrentTimestamp(),
        color: self.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(guild.shard) ? `${+guild.shard.id+1}/${self.options.shardCount}`: "1/1"} | Bot Version ${self.config.bot.version}`
		},
    }
    var embed = new self.Discord.MessageEmbed(data);
    var ch = self.channels.get(self.config.bot.joinLeaveChannel);
    if(ch instanceof self.Discord.TextChannel) {
        ch.send(embed).catch(noerr=>null);
    }
})