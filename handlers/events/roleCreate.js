module.exports = (async(client,role)=>{
    if(!role || !role.guild || !client.db) return;
        var ev = "rolecreated";
    var gConfig = await client.db.getGuild(role.guild.id).catch(err=>client.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = role.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(role.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    if(role.deleted) return;
    var below = role.guild.roles.find(r=>r.rawPosition === role.rawPosition - 1);
    var above = role.guild.roles.find(r=>r.rawPosition === role.rawPosition + 1);
    var data = {
        title: `:new: Role Created`,
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
            },{
                name: "Role Below",
                value: below instanceof client.Discord.Role ? `${below.name} (${below.id})` : "None below.",
                inline: false
            },{
                name: "Role Above",
                value: above instanceof client.Discord.Role ? `${above.name} (${above.id})` : "None above.",
                inline: false
            }
        ]
    }
    
    // audit log check
    var log = await client.getLogs(role.guild.id,"ROLE_CREATE",role.id);
    if(log !== false) {
        data.fields.push({
            name: "Executor",
            value: log.executor instanceof client.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
            inline: false
            },{
                name: "Reason",
                value: log.reason,
                inline: false
            });
        } else if (log === null) {
            data.fields.push({
                name: "Notice",
                value: "To get audit log info here, give me the `VIEW_AUDIT_LOG` permission.",
                inline: false
            });
        } else {}

    var embed = new client.Discord.MessageEmbed(data);
    return logch.send(embed);
})