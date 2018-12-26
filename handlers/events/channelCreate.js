module.exports = (async(client,channel)=>{
    if(!channel || !channel.guild || !["text","voice","category"].includes(channel.type)) return;
    var ev = "channelcreated";
    var gConfig = await client.db.getGuild(channel.guild.id);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = channel.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild({logging:{[ev]:{enabled:false,channel:null}}});
    switch(channel.type) {
        case "text":
            var typeText = ":pencil: Text";
            break;

        case "voice":
            var typeText = ":loudspeaker: Voice";
            break;

        case "category":
            var TypeText = "Category";
            break;
    }
    var log = (await channel.guild.fetchAuditLogs({limit:1,type:"CHANNEL_CREATE"})).entries.first();
    
    var data = {
        title: `:new: ${typeText} Channel Created`,
        author: {
            name: channel.guild.name,
            icon_url: channel.guild.iconURL()
        },
        timestamp: channel.createdTimestamp,
        color: client.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(channel.guild.shard) ? `${+channel.guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
		},
        fields: [
            {
                name: "Name",
                value: channel.name,
                inline: false
            },{
                name: "ID",
                value: channel.id,
                inline: false
            }
        ]
    }

    if(typeof channel.parent !== "undefined") {
        data.fields.push({
            name: "Parent Channel Name",
            value: channel.parent.name,
            inline: false
        },{
            name: "Parent Channel ID",
            value: channel.parent.id,
            inline: false
        });
    }
    if(channel.type === "voice") {
        data.fields.push({
            name: "Bitrate",
            value: `${channel.bitrate/1000}kbps`,
            inline: false
        },{
            name: "Channel User Limit",
            value: channel.userLimit === "0" ? "UNLIMITED" : channel.userLimit,
            inline: false
        });
    }
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
    var embed = new client.Discord.MessageEmbed(data);
    return logch.send(embed);
})