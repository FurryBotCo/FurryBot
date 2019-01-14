module.exports = (async(client,role)=>{
    var ev = "roledeleted";
    var gConfig = await client.db.getGuild(role.guild.id).catch(err=>client.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = role.guild.roles.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(role.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    if(!role.deleted) return;
    var below = role.guild.roles.find(r=>r.rawPosition === role.rawPosition - 1);
    var above = role.guild.roles.find(r=>r.rawPosition === role.rawPosition + 1);
    var data = {
        title: `:wastebasket: Role Deleted`,
        author: {
            name: role.guild.name,
            icon_url: role.guild.iconURL()
        },
        timestamp: role.createdTimestamp,
        color: client.randomColor(),
        footer: {
            text: `Role: ${role.name} (${role.id})`
        },
        fields: [
            {
                name: "Color",
                value: role.hexColor,
                inline: false
            },{
                name: "Hoisted (Displayed Separately)",
                value: role.hoisted ? "Yes" : "No",
                inline: false
            },{
                name: "Bot Role",
                value: role.managed ? "Yes" : "No",
                inline: false
            }
        ]
    }
    
    // audit log check
    if(role.guild.me.permissions.has("VIEW_AUDIT_LOG")) {
        var log = (await role.guild.fetchAuditLogs({limit:1,type:"ROLE_DELETE"})).entries.first();    
        if(![undefined,null,"",[],{}].includes(log) && log.action === "ROLE_DELETE"  && log.target.id === role.id) {
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