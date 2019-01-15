module.exports = (async(client,member) => {
    if(!member || !member || !member.guild || !client.db) return;
    var ev = "leave";
    var gConfig = await client.db.getGuild(member.guild.id).catch(err=>client.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = member.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(member.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var data = {
        title: `Member Left`,
        author: {
            name: `${member.user.tag} (${member.user.id})`,
            icon_url: member.user.displayAvatarURL()
        },
        timestamp: new Date().toISOString(),
        color: client.randomColor(),
        footer: {
            text: member.guild.name,
            icon_url: member.guild.iconURL()
		},
        fields: []
    }

    // audit log check
    var log = await client.getLogs(member.guild.id,"MEMBER_UPDATE",member.id);
    if(log !== false) {
        data.title = "Member Kicked";
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
    logch.send(embed);
});