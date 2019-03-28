module.exports = (async function(oldChannel,newChannel) {
	if(!newChannel || !newChannel.guild || !["text","voice","category"].includes(newChannel.type) || !this.db) return;
	this.trackEvent({
		group: "EVENTS",
		channelId: newChannel.id,
		event: "client.events.channelUpdate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			},
			type: newChannel.type,
			nsfw: newChannel.nsfw
		}
	});
	let ev, gConfig, logch, data, embed, log, base, log_data;
	ev = "channelupdated";
	gConfig = await this.db.getGuild(newChannel.guild.id).catch(error => this.config.defaultGuildSettings);
	if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
	logch = newChannel.guild.channels.get(gConfig.logging[ev].channel);
	if(!logch) return this.db.updateGuild(newChannel.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
	if(newChannel.deleted) return;

	base = {
		title: `${this.ucwords(newChannel.type)} Channel Updated`,
		author: {
			name: newChannel.guild.name,
			icon_url: newChannel.guild.iconURL()
		},
		timestamp: new Date().toISOString(),
		color: this.randomColor(),
		footer: {
			text: `Channel: ${newChannel.name} (${newChannel.id})`
		},
		fields: []
	};

	// audit log check
	log = await this.getLogs(newChannel.guild.id,"CHANNEL_UPDATE",newChannel.id);
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

	// parent
	if(oldChannel.parent !== newChannel.parent) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Parent Channel",
			value: [undefined,null,""].includes(oldChannel.parent) ? "None" : `${oldChannel.parent.name} (${oldChannel.parent.id})`,
			inline: false
		},{
			name: "New Parent Channel",
			value: [undefined,null,""].includes(newChannel.parent) ? "None" : `${newChannel.parent.name} (${newChannel.parent.id})`,
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// permission overwrites
	if(!this._.isEqual(oldChannel.permissionOverwrites.map(j => ({allow:j.allow,deny:j.deny})),newChannel.permissionOverwrites.map(j => ({allow:j.allow,deny:j.deny})))) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Permissions Overwrites Update",
			value: "Check Audit Log",
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// name
	if(oldChannel.name !== newChannel.name) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Name",
			value: oldChannel.name,
			inline: false
		},{
			name: "New Name",
			value: newChannel.name,
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	switch(newChannel.type) {
	case "text":
		// topic
		if(oldChannel.topic !== newChannel.topic && !([undefined,null,""].includes(oldChannel.topic) && [undefined,null,""].includes(newChannel.topic))) {
			data = Object.assign({},base);
			data.fields = [{
				name: "Old Topic",
				value: [undefined,null,""].includes(oldChannel.topic) ? "None" : oldChannel.topic,
				inline: false
			},{
				name: "New Topic",
				value: [undefined,null,""].includes(newChannel.topic) ? "None" : newChannel.topic,
				inline: false
			}].concat(log_data);
			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}

		// nsfw
		if(oldChannel.nsfw !== newChannel.nsfw) {
			data = Object.assign({},base);
			data.fields = [{
				name: "Old NSFW Value",
				value: oldChannel.nsfw ? "Yes" : "No",
				inline: false
			},{
				name: "New NSFW Value",
				value: newChannel.nsfw ? "Yes" : "No",
				inline: false
			}].concat(log_data);
			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}

		// slowmode
		if(oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
			data = Object.assign({},base);
			data.fields = [{
				name: "Old Slowmode",
				value: oldChannel.rateLimitPerUser === 0 ? "None" : `${oldChannel.rateLimitPerUser} Seconds`,
				inline: false
			},{
				name: "New Slowmode",
				value: newChannel.rateLimitPerUser === 0 ? "None" : `${newChannel.rateLimitPerUser} Seconds`,
				inline: false
			}].concat(log_data);
			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}
		break;

	case "voice":
		// bitrate
		if(oldChannel.bitrate !== newChannel.bitrate) {
			data = Object.assign({},base);
			data.fields = [{
				name: "Old Bitrate",
				value: `${oldChannel.bitrate/1000}kbps`,
				inline: false
			},{
				name: "New Bitrate",
				value: `${newChannel.bitrate/1000}kbps`,
				inline: false
			}].concat(log_data);
			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}

		// user limit
		if(oldChannel.userLimit !== newChannel.userLimit) {
			data = Object.assign({},base);
			data.fields = [{
				name: "Old User Limit",
				value: `${oldChannel.userLimit === 0?"UNLIMITED":oldChannel.userLimit}`,
				inline: false
			},{
				name: "New User Limit",
				value: `${newChannel.userLimit === 0?"UNLIMITED":newChannel.userLimit}`,
				inline: false
			}].concat(log_data);
			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}
	}
});