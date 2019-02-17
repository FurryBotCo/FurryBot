module.exports = (async function(member) {
	if(!member || !member || !member.guild || !this.db) return;
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.guildMemberRemove",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	let ev, gConfig, logch, log, data, embed;
	ev = "leave";
	gConfig = await this.db.getGuild(member.guild.id).catch(error=>this.config.default.guildConfig);
	if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
	logch = member.guild.channels.get(gConfig.logging[ev].channel);
	if(!logch) return this.db.updateGuild(member.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
	data = {
		title: "Member Left",
		author: {
			name: `${member.user.tag} (${member.user.id})`,
			icon_url: member.user.displayAvatarURL()
		},
		timestamp: new Date().toISOString(),
		color: this.randomColor(),
		footer: {
			text: member.guild.name,
			icon_url: member.guild.iconURL()
		},
		fields: []
	};

	// audit log check
	log = await this.getLogs(member.guild.id,"MEMBER_UPDATE",member.id);
	if(log !== false) {
		data.title = "Member Kicked";
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
	logch.send(embed);
});