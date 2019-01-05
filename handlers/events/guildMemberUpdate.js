module.exports = (async(client,oldMember,newMember) => {
    if(!oldMember || !newMemeber || !newMember.guild) return;
    var ev = "memberupdated";
    var gConfig = await client.db.getGuild(newMember.guild.id).catch(err=>client.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newMember.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(newMember.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var data = {
        title: `Member Updated`,
        author: {
            name: newMemer.guild.name,
            icon_url: newMember.guild.iconURL()
        },
        timestamp: new Date().toISOString(),
        color: client.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(guild.shard) ? `${+guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
		},
        fields: [
            {
                name: "Member",
                value: `${newmember.tag} (${newMember.id})`,
                inline: false
            }
        ]
    }
    
    // audit log check
    if(newMember.guild.me.permissions.has("VIEW_AUDIT_LOG")) {
        var log = (await newMember.guild.fetchAuditLogs({limit:1,type:"GUILD_MEMBER_UPDATE"})).entries.first();    
        if(![undefined,null,"",[],{}].includes(log) && log.action === "GUILD_MEMBER_UPDATE") {
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