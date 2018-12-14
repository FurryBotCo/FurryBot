module.exports = (async(self,oldChannel,newChannel)=>{
    if(!newChannel || !newChannel.guild || !["text","voice","category"].includes(newChannel.type)) return;
    var ev = "channelupdated";
    var gConfig = await self.db.getGuild(newChannel.guild.id);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newChannel.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return self.db.updateGuild({logging:{[ev]:{enabled:false,channel:null}}});
    switch(newChannel.type) {
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
    var base = {
        title: `${typeText} Channel Updated`,
        author: {
            name: newChannel.guild.name,
            icon_url: newChannel.guild.iconURL()
        },
        timestamp: self.getCurrentTimestamp(),
        color: self.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(newChannel.guild.shard) ? `${+newChannel.guild.shard.id+1}/${self.options.shardCount}`: "1/1"} | Bot Version ${self.config.bot.version}`
		},
        fields: []
    }
    var log = (await newChannel.guild.fetchAuditLogs({limit:1,type:"CHANNEL_UPDATE"})).entries.first();
    if(![undefined,null,"",[],{}].includes(log) && log.action === "CHANNEL_UPDATE") {
        var log_data = [{
           name: "Executor",
           value: log.executor instanceof self.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
           inline: false
        },{
            name: "Reason",
            value: log.executor instanceof self.Discord.User && !log.executor.bot ? "Not Applicable" : [undefined,null,""].includes(log.reason) ? "None Specified" : log.reason,
            inline: false
        }];
    }
    if(!self._.isEqual(oldChannel.permissionOverwrites.map(j=>({allow:j.allow,deny:j.deny})),newChannel.permissionOverwrites.map(j=>({allow:j.allow,deny:j.deny})))) {
        let data = Object.assign({},base);
        data.fields = [{
            name: "Channel",
            value: `${newChannel.name} (${newChannel.id})`,
            inline: false
        },{
            name: "Update Type",
            value: "Permission Overwrites",
            inline: false
        },{
            name: "Update",
            value: "Check Audit Log",
            inline: false
        }].concat(log_data);
        var embed = new self.Discord.MessageEmbed(data);
        logch.send(embed);
    }
    if(oldChannel.name !== newChannel.name) {
        let data = Object.assign({},base);
        data.fields = [{
            name: "Channel",
            value: `${newChannel.name} (${newChannel.id})`,
            inline: false
        },{
            name: "Update Type",
            value: "Name",
            inline: false
        },{
            name: "Old Value",
            value: oldChannel.name,
            inline: false
        },{
            name: "New Value",
            value: newChannel.name,
            inline: false
        }].concat(log_data);
        var embed = new self.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    /*if(typeof channel.parent !== "undefined") {
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
    var embed = new self.Discord.MessageEmbed(data);
    return logch.send(embed);*/
})