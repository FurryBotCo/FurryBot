module.exports = (async function(oldMember,newMember) {
    if(!oldMember || !newMember || !newMember.guild) return;
    this.analytics.track({
        userId: "CLIENT",
        event: "client.events.guildMemberUpdate",
        properties: {
            bot: {
                version: this.config.bot.version,
                beta: this.config.beta,
                alpha: this.config.alpha,
                server: this.os.hostname()
            }
        }
    });
    var ev = "memberupdated";
    var gConfig = await this.db.getGuild(newMember.guild.id).catch(err=>this.config.default.guildConfig);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newMember.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return this.db.updateGuild(newMember.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var base = {
        title: `Member Updated`,
        author: {
            name: `${newMember.user.tag} (${newMember.user.id})`,
            icon_url: newMember.user.displayAvatarURL()
        },
        timestamp: new Date().toISOString(),
        color: this.randomColor(),
        footer: {
            text: newMember.guild.name,
            icon_url: newMember.guild.iconURL()
		},
        fields: []
    }
    
    // audit log check
    var log = await this.getLogs(newMember.guild.id,"MEMBER_UPDATE",newMember.id);
    if(log !== false) {
         var log_data = [{
            name: "Executor",
            value: log.executor instanceof this.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
            inline: false
            },{
                name: "Reason",
                value: log.reason,
                inline: false
            }];
        } else if (log === null) {
            var log_data = [{
                name: "Notice",
                value: "To get audit log info here, give me the `VIEW_AUDIT_LOG` permission.",
                inline: false
            }];
        } else {
            var log_data = [];
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
        var embed = new this.Discord.MessageEmbed(data);
        logch.send(embed);
    }

    // roles
    var or = oldMember.roles.map(r=>({id:r.id,name:r.name}));
    var nr = newMember.roles.map(r=>({id:r.id,name:r.name}));
    var added = or.filter(r=>!nr.map(rr=>rr.id).includes(r.id));
    var removed = nr.filter(r=>!or.map(rr=>rr.id).includes(r.id));
    if(added.length > 0) {
        try {
            added.forEach((r)=>{
                var data = Object.assign({description: "Role added to member"},base);
                data.fields = [{
                    name: "Role",
                    value: `${r.name} (${r.id})`,
                    inline: false
                }].concat(log_data);
                var embed = new this.Discord.MessageEmbed(data);
                logch.send(embed);
            })
        }catch(e){
            console.error(e);
        }
    }

    if(removed.length > 0) {
        try {
            removed.forEach((r)=>{
                var data = Object.assign({description: "Role removed from member"},base);
                data.fields = [{
                    name: "Role",
                    value: `${r.name} (${r.id})`,
                    inline: false
                }].concat(log_data);
                var embed = new this.Discord.MessageEmbed(data);
                logch.send(embed);
            })
        }catch(e){
            console.error(e);
        }
    }
});