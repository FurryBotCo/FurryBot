module.exports = (async function(channel) {
	if(!channel || !channel.guild || !["text","voice","category"].includes(channel.type) || !this.db) return;
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.channelCreate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			},
			type: channel.type,
			nsfw: channel.nsfw
		}
	});
	let ev, gConfig, logch, data, embed, log;
	ev = "channelcreated";
	gConfig = await this.db.getGuild(channel.guild.id).catch(error => this.config.default.guildConfig);
	if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
	logch = channel.guild.channels.get(gConfig.logging[ev].channel);
	if(!logch) return this.db.updateGuild(channel.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
	if(channel.deleted) return;
	data = {
		title: `:new: ${this.ucwords(channel.type)} Channel Created`,
		author: {
			name: channel.guild.name,
			icon_url: channel.guild.iconURL()
		},
		timestamp: channel.createdTimestamp,
		color: this.randomColor(),
		footer: {
			text: `Channel: ${channel.name} (${channel.id})`
		},
		fields: [
			{
				name: "Parent Channel",
				value: [undefined,null,""].includes(channel.parent) ? "None" : `${channel.parent.name} (${channel.parent.id})`,
				inline: false
			}
		]
	};

    
	switch(channel.type) {
	case "text":
		// topic, slowmode, & nsfw (text only)
		data.fields.push({
			name: "Topic",
			value: [undefined,null,""].includes(channel.topic) ? "None" : channel.topic,
			inline: false
		},{
			name: "Slowmode",
			value: channel.rateLimitPerUser === 0 ? "None" : `${channel.rateLimitPerUser} Seconds`,
			inline: false
		},{
			name: "NSFW",
			value: channel.nsfw ? "Yes" : "No",
			inline: false
		});
		break;

	case "voice":
		// bitrate & user limit (voice only)
		data.fields.push({
			name: "Bitrate",
			value: `${channel.bitrate/1000}kbps`,
			inline: false
		},{
			name: "Channel User Limit",
			value: channel.userLimit === "0" ? "UNLIMITED" : channel.userLimit,
			inline: false
		});
		break;
	}

    
	// audit log check
	log = await this.getLogs(channel.guild.id,"CHANNEL_CREATE",channel.id);
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