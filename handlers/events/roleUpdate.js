module.exports = (async(client,oldRole,newRole)=>{
    if(!newRole || !newRole.guild || !["text","voice","category"].includes(newRole.type)) return;
    var ev = "roleupdated";
    var gConfig = await client.db.getGuild(newRole.guild.id).catch(err=>client.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newRole.guild.roles.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(newRole.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    if(newRole.deleted) return;
    var base = {
        title: `${client.ucwords(newRole.type)} Role Updated`,
        author: {
            name: newRole.guild.name,
            icon_url: newRole.guild.iconURL()
        },
        timestamp: new Date().toISOString(),
        color: client.randomColor(),
        footer: {
            text: `Role: ${newRole.name} (${newRole.id})`
        },
        fields: []
    }

    // audit log check
    if(newRole.guild.me.permissions.has("VIEW_AUDIT_LOG")) {
        var log = (await newRole.guild.fetchAuditLogs({limit:1,type:"ROLE_UPDATE"})).entries.first();
        if(![undefined,null,"",[],{}].includes(log) && log.action === "ROLE_UPDATE"  && log.target.id === newRole.id) {
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

    // name
    if(oldRole.name !== newRole.name) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Old Name",
            value: oldRole.name,
            inline: false
        },{
            name: "New Name",
            value: newRole.name,
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    // permission overwrites
    if(!client._.isEqual(oldRole.permissions.map(j=>({allow:j.allow,deny:j.deny})),newRole.permissions.map(j=>({allow:j.allow,deny:j.deny})))) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Permissions Update",
            value: "Check Audit Log",
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }
    
    if(oldRole.mentionable !== newRole.mentionable) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Old Mentionability",
            value: oldRole.mentionable ? "Yes" : "No",
            inline: false
        },{
            name: "New Mentionability",
            value: newRole.mentionable ? "Yes" : "No",
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    if(oldRole.hexColor.replace("#","") !== newRole.hexColor.replace("#","")) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Old Color",
            value: oldRole.hexColor,
            inline: false
        },{
            name: "New Color",
            value: newRole.hexColor,
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    if(oldRole.hoist !== newRole.hoist) {
        var data = Object.assign({},base);
        data.fields = [{
            name: "Old Hoist",
            value: oldRole.hoisted ? "Yes" : "No",
            inline: false
        },{
            name: "New Hoist",
            value: newRole.hoist ? "Yes" : "No",
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    if(oldRole.rawPosition !== newRole.rawPosition) {
        var belowo = newRole.guild.roles.find(r=>r.rawPosition === oldRole.rawPosition - 1);
        var belown = newRole.guild.roles.find(r=>r.rawPosition === newRole.rawPosition - 1);
        var aboveo = newRole.guild.roles.find(r=>r.rawPosition === oldRole.rawPosition + 1);
        var aboven = newRole.guild.roles.find(r=>r.rawPosition === newRole.rawPosition + 1);
        var data = Object.assign({},base);
        data.fields = [{
            name: "Position",
            value: `Old: ${oldRole.rawPosition}\nNew: ${newRole.rawPosition}`,
            inline: false
        },{
            name: "Below",
            value: `Old: ${belowo instanceof client.Discord.Role ? `${belowo.name} (${belowo.id})` : "None below."}\nNew: ${belown instanceof client.Discord.Role ? `${belown.name} (${belown.id})` : "None below."}`,
            inline: false
        },{
            name: "Above",
            value: `Old: ${aboveo instanceof client.Discord.Role ? `${aboveo.name} (${aboveo.id})` : "None below."}\nNew: ${aboven instanceof client.Discord.Role ? `${aboven.name} (${aboven.id})` : "None below."}`,
            inline: false
        }].concat(log_data);
        var embed = new client.Discord.MessageEmbed(data);
        logch.send(embed);
    }
    
})