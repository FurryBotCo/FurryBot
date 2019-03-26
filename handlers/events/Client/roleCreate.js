module.exports = (async function(role) {
	if(!role || !role.guild || !this.db) return;
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.roleCreate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	let ev, gConfig, logch, log, data, embed, above, below;
	ev = "rolecreated";
	gConfig = await this.db.getGuild(role.guild.id).catch(error => this.config.default.guildConfig);
	if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
	logch = role.guild.channels.get(gConfig.logging[ev].channel);
	if(!logch) return this.db.updateGuild(role.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
	if(role.deleted) return;
	below = role.guild.roles.find(r => r.rawPosition === role.rawPosition - 1);
	above = role.guild.roles.find(r => r.rawPosition === role.rawPosition + 1);
	data = {
		title: ":new: Role Created",
		author: {
			name: role.guild.name,
			icon_url: role.guild.iconURL()
		},
		timestamp: role.createdTimestamp,
		color: this.randomColor(),
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
				value: below instanceof this.Discord.Role ? `${below.name} (${below.id})` : "None below.",
				inline: false
			},{
				name: "Role Above",
				value: above instanceof this.Discord.Role ? `${above.name} (${above.id})` : "None above.",
				inline: false
			}
		]
	};
    
	// audit log check
	log = await this.getLogs(role.guild.id,"ROLE_CREATE",role.id);
	if(log !== false) {
		data.fields.push({
			name: "Executor",
			value: log.executor instanceof this.Discord.User ? `${log.executor.username}#${log.executor.discriminator} (${log.executor.id})` : "Unknown",
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

	embed = new this.Discord.MessageEmbed(data);
	return logch.send(embed);
});