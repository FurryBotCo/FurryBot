module.exports = (async function(guild,user) {
    if(!guild || !user || !this.db) return;
    this.analytics.track({
        userId: "CLIENT",
        event: "client.events.guildBanRemove",
        properties: {
            bot: {
                version: this.config.bot.version,
                beta: this.config.beta,
                alpha: this.config.alpha,
                server: this.os.hostname()
            }
        }
    });
    var ev = "memberunbanned";
    var gConfig = await this.db.getGuild(guild.id).catch(err=>this.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return this.db.updateGuild(guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var data = {
        title: `:scales: Member Unbanned`,
        author: {
            name: `${user.tag} (${user.id})`,
            icon_url: user.displayAvatarURL()
        },
        timestamp: new Date().toISOString(),
        color: this.randomColor(),
        footer: {
            text: guild.name,
            icon_url: guild.iconURL()
		},
        fields: []
    }
    
    // audit log check
    var log = await this.getLogs(guild.id,"MEMBER_BAN_REMOVE",user.id);
    if(log !== false) {
         data.fields.push({
            name: "Executor",
            value: log.executor instanceof this.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
            inline: false
            },{
                name: "Reason",
                value: log.reason,
                inline: false
            });
        } else if (log === null) {
            data.fields.push({
                name: "Notice",
                value: "To get audit log info here, give me the `VIEW_AUDIT_LOG` permission.",
                inline: false
            });
        } else {}

    var embed = new this.Discord.MessageEmbed(data);
    return logch.send(embed);
});