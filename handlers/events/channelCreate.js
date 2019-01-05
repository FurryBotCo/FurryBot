module.exports = (async(client,channel)=>{
    if(!channel || !channel.guild || !["text","voice","category"].includes(channel.type)) return;
    var ev = "channelcreated";
    var gConfig = await client.db.getGuild(channel.guild.id).catch(err=>client.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = channel.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(channel.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    if(channel.deleted) return;
    var data = {
        title: `:new: ${client.ucwords(channel.type)} Channel Created`,
        author: {
            name: channel.guild.name,
            icon_url: channel.guild.iconURL()
        },
        timestamp: channel.createdTimestamp,
        color: client.randomColor(),
        footer: {
            text: `Channel: ${channel.name} (${channel.id})`
        },
        fields: [
            {
                name: "Parent Channel",
                value: [undefined,null,""].includes(channel.parent) ? "None" : `${channel.parent.name} (${channel.parent.id})`,
                inline: false
            }
        ]
    }

    
    switch(channel.type) {
        case "text":
            // topic, slowmode, & nsfw (text only)
            data.fields.push({
                name: "Topic",
                value: [undefined,null,""].includes(channel.topic) ? "None" : channel.topic,
                inline: false
            },{
                name: "Slowmode",
                value: channel.rateLimitPerUser === 0 ? "None" : `${channel.rateLimitPerUser} Seconds`,
                inline: false
            },{
                name: "NSFW",
                value: channel.nsfw ? "Yes" : "No",
                inline: false
            })
            break;

        case "voice":
            // bitrate & user limit (voice only)
            data.fields.push({
                name: "Bitrate",
                value: `${channel.bitrate/1000}kbps`,
                inline: false
            },{
                name: "Channel User Limit",
                value: channel.userLimit === "0" ? "UNLIMITED" : channel.userLimit,
                inline: false
            });
            break;
    }

    
    // audit log check
    if(channel.guild.me.permissions.has("VIEW_AUDIT_LOG")) {
        var log = (await channel.guild.fetchAuditLogs({limit:1,type:"CHANNEL_CREATE"})).entries.first();    
        if(![undefined,null,"",[],{}].includes(log) && log.action === "CHANNEL_CREATE") {
            data.fields.push({
            name: "Executor",
            value: log.executor instanceof client.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
            inline: false
            },{
                name: "Reason",
                value: log.executor instanceof client.Discord.User && !log.executor.bot ? "Not Applicable" : [undefined,null,""].includes(log.reason) ? "None Specified" : log.reason,
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
})