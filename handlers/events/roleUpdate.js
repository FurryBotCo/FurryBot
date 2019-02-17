module.exports = (async function(oldRole,newRole) {
	if(!oldRole || !oldRole.guild || !newRole || !newRole.guild || newRole.id === newRole.guild.id || !this.db) return;
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.roleUpdate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	let ev, gConfig, logch, log, data, embed, base, log_data/*, belowo, belown, aboveo, aboven*/;
	ev = "roleupdated";
	gConfig = await this.db.getGuild(newRole.guild.id).catch(error=>this.config.default.guildConfig);
	if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
	logch = newRole.guild.channels.get(gConfig.logging[ev].channel);
	if(!logch) return this.db.updateGuild(newRole.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
	if(newRole.deleted) return;
	base = {
		title: "Role Updated",
		author: {
			name: newRole.guild.name,
			icon_url: newRole.guild.iconURL()
		},
		timestamp: new Date().toISOString(),
		color: this.randomColor(),
		footer: {
			text: `Role: ${newRole.name} (${newRole.id})`
		},
		fields: []
	};

	// audit log check
	log = await this.getLogs(newRole.guild.id,"ROLE_UPDATE",newRole.id);
	if(log !== false) {
		log_data = [{
			name: "Executor",
			value: log.executor instanceof this.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
			inline: false
		},{
			name: "Reason",
			value: log.reason,
			inline: false
		}];
	} else if (log === null) {
		log_data = [{
			name: "Notice",
			value: "To get audit log info here, give me the `VIEW_AUDIT_LOG` permission.",
			inline: false
		}];
	} else {
		log_data = [];
	}

	// name
	if(oldRole.name !== newRole.name) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Name",
			value: oldRole.name,
			inline: false
		},{
			name: "New Name",
			value: newRole.name,
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// permission overwrites
	try {
		if((!([undefined,null,""].includes(oldRole.permissions) || oldRole.permissions.length === 0) && !([undefined,null,""].includes(newRole.permissions) || newRole.permissions.length === 0)) && !this._.isEqual(oldRole.permissions.map(j=>({allow:j.allow,deny:j.deny})),newRole.permissions.map(j=>({allow:j.allow,deny:j.deny})))) {
			data = Object.assign({},base);
			data.fields = [{
				name: "Permissions Update",
				value: "Check Audit Log",
				inline: false
			}].concat(log_data);
			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}
	}catch(error){}
    
	if(oldRole.mentionable !== newRole.mentionable) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Mentionability",
			value: oldRole.mentionable ? "Yes" : "No",
			inline: false
		},{
			name: "New Mentionability",
			value: newRole.mentionable ? "Yes" : "No",
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	if(oldRole.hexColor.replace("#","") !== newRole.hexColor.replace("#","")) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Color",
			value: oldRole.hexColor,
			inline: false
		},{
			name: "New Color",
			value: newRole.hexColor,
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	if(oldRole.hoist !== newRole.hoist) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Hoist",
			value: oldRole.hoist ? "Yes" : "No",
			inline: false
		},{
			name: "New Hoist",
			value: newRole.hoist ? "Yes" : "No",
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	/*if(oldRole.rawPosition !== newRole.rawPosition) {
        belowo = newRole.guild.roles.find(r=>r.rawPosition === oldRole.rawPosition - 1);
        belown = newRole.guild.roles.find(r=>r.rawPosition === newRole.rawPosition - 1);
        aboveo = newRole.guild.roles.find(r=>r.rawPosition === oldRole.rawPosition + 1);
        aboven = newRole.guild.roles.find(r=>r.rawPosition === newRole.rawPosition + 1);
        data = Object.assign({},base);
        data.fields = [{
            name: "Position",
            value: `Old: ${oldRole.rawPosition}\nNew: ${newRole.rawPosition}`,
            inline: false
        },{
            name: "Below",
            value: `Old: ${belowo instanceof this.Discord.Role ? `${belowo.name} (${belowo.id})` : "None below."}\nNew: ${belown instanceof this.Discord.Role ? `${belown.name} (${belown.id})` : "None below."}`,
            inline: false
        },{
            name: "Above",
            value: `Old: ${aboveo instanceof this.Discord.Role ? `${aboveo.name} (${aboveo.id})` : "None below."}\nNew: ${aboven instanceof this.Discord.Role ? `${aboven.name} (${aboven.id})` : "None below."}`,
            inline: false
        }].concat(log_data);
        embed = new this.Discord.MessageEmbed(data);
        logch.send(embed);
    }*/
    
});