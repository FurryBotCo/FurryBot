module.exports = (async(client,oldChannel,newChannel)=>{
    if(!newChannel || !newChannel.guild || !["text","voice","category"].includes(newChannel.type)) return;
    var ev = "channelupdated";
    var gConfig = await client.db.getGuild(newChannel.guild.id).catch(err=>client.config.defaultGuildSettings);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newChannel.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(newChannel.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    if(newChannel.deleted) return;

    var base = {
        title: `${client.ucwords(newChannel.type)} Channel Updated`,
        author: {
            name: newChannel.guild.name,
            icon_url: newChannel.guild.iconURL()
        },
        timestamp: new Date().toISOString(),
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

    // audit log check
    if(newChannel.guild.me.permissions.has("VIEW_AUDIT_LOG")) {
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
    }

    // parent
    if(oldChannel.parent !== newChannel.parent) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Old Parent Channel",
            value: [undefined,null,""].includes(oldChannel.parent) ? "None" : `${oldChannel.parent.name} (${oldChannel.parent.id})`,
            inline: false
        },{
            name: "New Parent Channel",
            value: [undefined,null,""].includes(newChannel.parent) ? "None" : `${newChannel.parent.name} (${newChannel.parent.id})`,
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    // permission overwrites
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

    // name
    if(oldChannel.name !== newChannel.name) {
        var data = Object.assign({},base);
        data.fields = [{
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
        if(oldChannel.topic !== newChannel.topic && !([undefined,null,""].includes(oldChannel.topic) && [undefined,null,""].includes(newChannel.topic))) {
            var data = Object.assign({},base);
            data.fields = [{
                name: "Old Topic",
                value: [undefined,null,""].includes(oldChannel.topic) ? "None" : oldChannel.topic,
                inline: false
            },{
                name: "New Topic",
                value: [undefined,null,""].includes(newChannel.topic) ? "None" : newChannel.topic,
                inline: false
            }].concat(log_data);
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }

        // nsfw
        if(oldChannel.nsfw !== newChannel.nsfw) {
            var data = Object.assign({},base);
            data.fields = [{
                name: "Old NSFW Value",
                value: oldChannel.nsfw ? "Yes" : "No",
                inline: false
            },{
                name: "New NSFW Value",
                value: newChannel.nsfw ? "Yes" : "No",
                inline: false
            }].concat(log_data);
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }

        // slowmode
        if(oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
            var data = Object.assign({},base);
            data.fields = [{
                name: "Old Slowmode",
                value: oldChannel.rateLimitPerUser === 0 ? "None" : `${oldChannel.rateLimitPerUser} Seconds`,
                inline: false
            },{
                name: "New Slowmode",
                value: newChannel.rateLimitPerUser === 0 ? "None" : `${newChannel.rateLimitPerUser} Seconds`,
                inline: false
            }].concat(log_data);
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }
        break;

    case "voice":
        // bitrate
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

        // user limit
        if(oldChannel.userLimit !== newChannel.userLimit) {
            var data = Object.assign({},base);
            data.fields = [{
                name: "Old User Limit",
                value: `${oldChannel.userLimit === 0?"UNLIMITED":oldChannel.userLimit}`,
                inline: false
            },{
                name: "New User Limit",
                value: `${newChannel.userLimit === 0?"UNLIMITED":newChannel.userLimit}`,
                inline: false
            }].concat(log_data);
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }
    }
})