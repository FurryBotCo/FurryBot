module.exports = (async function(member) {
    if(!member || !member || !member.guild || !this.db) return;
    this.analytics.track({
        userId: "CLIENT",
        event: "client.events.guildMemberAdd",
        properties: {
            bot: {
                version: this.config.bot.version,
                beta: this.config.beta,
                alpha: this.config.alpha,
                server: this.os.hostname()
            }
        }
    });
    var ev = "join";
    var gConfig = await this.db.getGuild(member.guild.id).catch(err=>this.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = member.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return this.db.updateGuild(member.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var data = {
        title: `Member Joined`,
        author: {
            name: `${member.user.tag} (${member.user.id})`,
            icon_url: member.user.displayAvatarURL()
        },
        timestamp: new Date().toISOString(),
        color: this.randomColor(),
        footer: {
            text: member.guild.name,
            icon_url: member.guild.iconURL()
		},
        fields: [
            {
                name: "User",
                value: `${member.user.tag} (${member.user.id})`,
                inline: false
            },{
                name: "Account Creation Date",
                value: member.user.createdAt.toString().split("GMT")[0],
                inline: false
            }
        ]
    }
    var embed = new this.Discord.MessageEmbed(data);
    logch.send(embed);

    var d = new Date();
    if(d.getDate() - 3.6e5 > member.user.createdTimestamp) {
        // one hour
        return logch.send(new this.Discord.MessageEmbed({
            title: "Account Age Warning",
            fields: [
                {
                    name: "Warning",
                    value: "Account is under one (1) hour old",
                    inline: false
                }
            ]
        }));
    } else if(d.getDate() - 8.64e7 > member.user.createdTimestamp) {
        // one day (24 hours)
        return logch.send(new this.Discord.MessageEmbed({
            title: "Account Age Warning",
            fields: [
                {
                    name: "Warning",
                    value: "Account is under 24 hours old",
                    inline: false
                }
            ]
        }));
    } else if(d.getDate() - 6.048e8 > member.user.createdTimestamp) {
        // one week (seven days)
        return logch.send(new this.Discord.MessageEmbed({
            title: "Account Age Warning",
            fields: [
                {
                    name: "Warning",
                    value: "Account is under seven (7) days old",
                    inline: false
                }
            ]
        }));
    }
});