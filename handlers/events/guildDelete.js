module.exports = (async function(guild) {
    await this.db.updateDailyCount(true);
    await this.db.deleteGuild(guild.id);
    this.analytics.track({
        userId: "CLIENT",
        event: "client.events.guildDelete",
        properties: {
            guildId: guild.id,
            name: guild.name,
            owner: guild.owner.tag,
            ownderId: guild.owner.id,
            guildCreationDate: new Date(guild.createdTimestmap),
            totalGuilds: this.guilds.size,
            bot: {
                version: this.config.bot.version,
                beta: this.config.beta,
                alpha: this.config.alpha,
                server: this.os.hostname()
            }
        }
    });
    this.logger.log(`Guild left: ${guild.name} (${guild.id}). This guild had ${guild.memberCount} members.`);
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
        description: `RIP Guild Number ${+this.guilds.size+1}`,
        image: {
            url: guild.iconURL()||this.config.bot.noGuildIcon
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
                value: `Total: ${guild.memberCount}\n\n${this.config.emojis.online}: ${guild.members.filter(m=>m.user.presence.status==="online").size}\n${this.config.emojis.idle}: ${guild.members.filter(m=>m.user.presence.status==="idle").size}\n${this.config.emojis.dnd}: ${guild.members.filter(m=>m.user.presence.status==="dnd").size}\n${this.config.emojis.offline}: ${guild.members.filter(m=>m.user.presence.status==="offline").size}\nUser Count: ${guild.members.filter(m=>m.user.bot===false).size}\nBot Count: ${guild.members.filter(m=>m.user.bot===true).size}`,
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
        timestamp: this.getCurrentTimestamp(),
        color: this.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(guild.shard) ? `${+guild.shard.id+1}/${this.options.shardCount}`: "1/1"} | Bot Version ${this.config.bot.version}`
		},
    }
    var embed = new this.Discord.MessageEmbed(data);
    var ch = this.channels.get(this.config.bot.channels.joinLeave);
    if(ch instanceof this.Discord.TextChannel) {
        ch.send(embed).catch(noerr=>null);
    }
});