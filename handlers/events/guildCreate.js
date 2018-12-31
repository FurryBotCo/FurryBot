module.exports = (async(client,guild)=>{
    await client.db.updateDailyCount();
    await client.db.createGuild(guild.id);
    client.logger.log(`New guild joined: ${guild.name} (${guild.id}). This guild has ${guild.memberCount} members! Guild was put on shard #${guild.shard.id} (${+guild.shard.id+1})`);
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
        description: `Guild Number ${client.guilds.size}`,
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
                value: `Total: ${guild.memberCount}\n\n${client.config.emojis.online}: ${guild.members.filter(m=>m.user.presence.status==="online").size}\n${client.config.emojis.idle}: ${guild.members.filter(m=>m.user.presence.status==="idle").size}\n${client.config.emojis.dnd}: ${guild.members.filter(m=>m.user.presence.status==="dnd").size}\n${client.config.emojis.offline}: ${guild.members.filter(m=>m.user.presence.status==="offline").size}\nUser Count: ${guild.members.filter(m=>m.user.bot===false).size}\nBot Count: ${guild.members.filter(m=>m.user.bot===true).size}`,
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
        timestamp: client.getCurrentTimestamp(),
        color: client.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(guild.shard) ? `${+guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
		},
    }
    var embed = new client.Discord.MessageEmbed(data);
    var ch = client.channels.get(client.config.bot.channels.joinLeave);
    if(ch instanceof client.Discord.TextChannel) {
        ch.send(embed).catch(noerr=>null);
    }
    var dt = {
        description: client.config.bot.intro.text,
        fields: client.config.bot.intro.fields,
        author: {
            name: guild.name,
            icon: guild.iconURL()
        },
        timestamp: client.getCurrentTimestamp(),
        color: client.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(guild.shard) ? `${+guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
		},
    }
    var em = new client.Discord.MessageEmbed(dt);
    var chn = guild.channels.filter(c=>c.type === "text" && c.permissionsFor(client.user.id).has("SEND_MESSAGES","EMBED_LINKS","VIEW_CHANNEL"));
    if(chn.size === 0) return;
    return chn.first().send(em).catch(noerr=>null);
})