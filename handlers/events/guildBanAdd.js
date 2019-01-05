module.exports = (async(client,guild,user) => {
    if(!guild || !user) return;
    var ev = "userbanned";
    var gConfig = await client.db.getGuild(guild.id).catch(err=>client.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var data = {
        title: `${guild.me.permissions.has("USE_EXTERNAL_EMOJIS") ? client.config.emojis.abanned : ":hammer"} Member Banned`,
        author: {
            name: guild.name,
            icon_url: guild.iconURL()
        },
        timestamp: new Date().toISOString(),
        color: client.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(guild.shard) ? `${+guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
		},
        fields: [
            {
                name: "User",
                value: `${user.tag} (${user.id})`,
                inline: false
            }
        ]
    }
    
    // audit log check
    if(guild.me.permissions.has("VIEW_AUDIT_LOG")) {
        var log = (await guild.fetchAuditLogs({limit:1,type:"MEMBER_BAN_ADD"})).entries.first();    
        if(![undefined,null,"",[],{}].includes(log) && log.action === "MEMBER_BAN_ADD") {
            data.fields.push({
            name: "Executor",
            value: log.executor instanceof client.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
            inline: false
            },{
                name: "Reason",
                value: log.executor instanceof client.Discord.User && [undefined,null,""].includes(log.reason) ? "None Specified" : log.reason,
                inline: false
            });
        }
    } else {
        data.fields.push({
            name: "Notice",
            value: "To get audit log info here, give me the `VIEW_AUDIT_LOG` permission.",
            inline: false
        });
    }

    var embed = new client.Discord.MessageEmbed(data);
    return logch.send(embed);
});