module.exports = (async(client,oldChannel,newChannel)=>{
    if(!newChannel || !newChannel.guild || !["text","voice","category"].includes(newChannel.type)) return;
    var ev = "channelupdated";
    var gConfig = await client.db.getGuild(newChannel.guild.id).catch(err=>client.config.defaultGuildSettings);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newChannel.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild({logging:{[ev]:{enabled:false,channel:null}}});
    switch(newChannel.type) {
        case "text":
            var typeText = ":pencil: Text";
            break;

        case "voice":
            var typeText = ":loudspeaker: Voice";
            break;

        case "category":
            var typeText = "Category";
            break;
    }
    var base = {
        title: `${typeText} Channel Updated`,
        author: {
            name: newChannel.guild.name,
            icon_url: newChannel.guild.iconURL()
        },
        timestamp: client.getCurrentTimestamp(),
        color: client.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(newChannel.guild.shard) ? `${+newChannel.guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
		},
        fields: [
            {
                name: "Channel",
                value: `${newChannel.name} (${newChannel.id})`,
                inline: false
            }
        ]
    }
    var log = (await newChannel.guild.fetchAuditLogs({limit:1,type:"CHANNEL_UPDATE"})).entries.first();
    if(![undefined,null,"",[],{}].includes(log) && log.action === "CHANNEL_UPDATE") {
        var log_data = [{
        name: "Executor",
        value: log.executor instanceof client.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
        inline: false
        },{
            name: "Reason",
            value: log.executor instanceof client.Discord.User && !log.executor.bot ? "Not Applicable" : [undefined,null,""].includes(log.reason) ? "None Specified" : log.reason,
            inline: false
        }];
    }
    if(!client._.isEqual(oldChannel.permissionOverwrites.map(j=>({allow:j.allow,deny:j.deny})),newChannel.permissionOverwrites.map(j=>({allow:j.allow,deny:j.deny})))) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Permissions Overwrites Update",
            value: "Check Audit Log",
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }
    if(oldChannel.name !== newChannel.name) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Channel",
            value: `${newChannel.name} (${newChannel.id})`,
            inline: false
        },{
            name: "Old Name",
            value: oldChannel.name,
            inline: false
        },{
            name: "New Name",
            value: newChannel.name,
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    switch(newChannel.type) {
        case "text":
        // topic
        // slowmode
        // nsfw
        break;

    case "voice":
        if(oldChannel.bitrate !== newChannel.bitrate) {
            var data = Object.assign({},base);
            data.fields = [{
                name: "Old Bitrate",
                value: `${oldChannel.bitrate/1000}kbps`,
                inline: false
            },{
                name: "New Bitrate",
                value: `${newChannel.bitrate/1000}kbps`,
                inline: false
            }].concat(log_data);
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }

        if(oldChannel.userLimit !== newChannel.userLimit) {
            var data = Object.assign({},base);
            data.fields = [{
                name: "Old User Limit",
                value: `${oldChannel.userLimit === "0"?"UNLIMITED":oldChannel.userLimit}`,
                inline: false
            },{
                name: "New User Limit",
                value: `${newChannel.userLimit === "0"?"UNLIMITED":newChannel.userLimit}`,
                inline: false
            }].concat(log_data);
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }
    }
})