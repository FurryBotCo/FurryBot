module.exports = (async(self,guild)=>{
    await self.db.updateDailyCount();
    await self.db.createGuild(guild.id);
    self.logger.log(`New guild joined: ${guild.name} (${guild.id}). This guild has ${guild.memberCount} members! Guild was put on shard #${guild.shard.id} (${+guild.shard.id+1})`);
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
        title: "Guild Joined!",
        description: `Guild Number ${self.guilds.size}`,
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
    var ch = self.channels.get(self.config.bot.channels.joinLeave);
    if(ch instanceof self.Discord.TextChannel) {
        ch.send(embed).catch(noerr=>null);
    }
    var dt = {
        description: self.config.bot.intro.text,
        fields: self.config.bot.intro.fields,
        author: {
            name: guild.name,
            icon: guild.iconURL()
        }
    }
    var em = new self.Discord.MessageEmbed(dt);
    var chn = guild.channels.filter(c=>c.type === "text" && c.permissionsFor(self.user.id).has("SEND_MESSAGES","EMBED_LINKS","VIEW_CHANNEL"));
    if(chn.size === 0) return;
    return chn.first().send(em).catch(noerr=>null);
})