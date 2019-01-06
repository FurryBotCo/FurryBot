module.exports = (async(client,oldMember,newMember) => {
    if(!oldMember || !newMember || !newMember.guild) return;
    var ev = "join";
    var gConfig = await client.db.getGuild(newMember.guild.id).catch(err=>client.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newMember.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(newMember.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var base = {
        title: `Member Joined`,
        author: {
            name: `${newMember.user.tag} (${newMember.user.id})`,
            icon_url: newMember.user.displayAvatarURL()
        },
        timestamp: new Date().toISOString(),
        color: client.randomColor(),
        footer: {
            text: newMember.guild.name,
            icon_url: newMember.guild.iconURL()
		},
        fields: []
    }
    
    // audit log check
    if(newMember.guild.me.permissions.has("VIEW_AUDIT_LOG")) {
        var log = (await newMember.guild.fetchAuditLogs({limit:1,type:"CHANNEL_UPDATE"})).entries.first();
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
    } else {
        var log_data = [{
            name: "Notice",
            value: "To get audit log info here, give me the `VIEW_AUDIT_LOG` permission.",
            inline: false
        }];
    }

    // nickname
    if(oldMember.nickname !== newMember.nickname && !([undefined,null,""].includes(oldMember.nickname) && [undefined,null,""].includes(newMember.nickname))) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Old Nickname",
            value: [undefined,null,""].includes(oldMember.nickname) ? "None" : oldMember.nickname,
            inline: false
        },{
            name: "New Nickname",
            value: [undefined,null,""].includes(newMember.nickname) ? "None" : newMember.nickname,
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    // roles
    var or = oldMember.roles.map(r=>({id:r.id,name:r.name}));
    var nr = newMember.roles.map(r=>({id:r.id,name:r.name}));
    var added = or.filter(r=>!nr.map(rr=>rr.id).includes(r.id));
    var removed = nr.filter(r=>!or.map(rr=>rr.id).includes(r.id));
    if(added.length > 0) {
        added.forEach((r)=>{
            var data = Object.assign({description: "Role added to member"},base);
            data.fields = [{
                name: "Role",
                value: `${r.name} (${r.id})`,
                inline: false
            }].concat(log_data);
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        })
    }

    if(removed.length > 0) {
        removed.forEach((r)=>{
            var data = Object.assign({description: "Role removed from member"},base);
            data.fields = [{
                name: "Role",
                value: `${r.name} (${r.id})`,
                inline: false
            }].concat(log_data);
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        })
    }
});