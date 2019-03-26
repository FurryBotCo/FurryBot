module.exports = (async function(oldGuild,newGuild) {
	if(!newGuild || !this.db) return;
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.guildUpdate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	let ev, gConfig, logch, log, data, embed, base, log_data;
	ev = "guildupdated";
	gConfig = await this.db.getGuild(newGuild.id).catch(error => this.config.defaultGuildSettings);
	if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
	logch = newGuild.channels.get(gConfig.logging[ev].channel);
	if(!logch) return this.db.updateGuild(newGuild.id,{logging:{[ev]:{enabled:false,channel:null}}});
	if(newGuild.deleted) return;

	base = {
		title: "Server Updated",
		author: {
			name: newGuild.name,
			icon_url: newGuild.iconURL()
		},
		timestamp: new Date().toISOString(),
		color: this.randomColor(),
		footer: {
			text: `Channel: ${newGuild.name} (${newGuild.id})`
		},
		fields: []
	};

	const contentFilters = [
			"disabled",              // 0
			"members without roles", // 1
			"all members"            // 2
		],
		verificationLevels = [
			"unrestricted",                                                                      // 0
			"LOW - must have verified email on account",                                         // 1
			"MEDIUM - must be registered on Discord for longer than 5 minutes",                  // 2
			"HIGH - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes", // 3
			"VERY_HIGH - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number"                // 4
		],
		mfaLevels = [
			"not required", // 0
			"required"      // 1
		];
	// audit log check
	log = await this.getLogs(newGuild.id,"GUILD_UPDATE",newGuild.id);
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
	if(oldGuild.name !== newGuild.name) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Name",
			value: oldGuild.name,
			inline: false
		},{
			name: "New Name",
			value: newGuild.name,
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// region
	if(oldGuild.region !== newGuild.region) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Region",
			value: this.ucwords(oldGuild.region),
			inline: false
		},{
			name: "New Region",
			value: this.ucwords(newGuild.region),
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// icon
	if(oldGuild.iconURL() !== newGuild.iconURL()) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Icon",
			value: oldGuild.iconURL() === null ? "none" : `[url](${oldGuild.iconURL()})\nalso see thumbnail`,
			inline: false
		},{
			name: "New Icon",
			value: newGuild.iconURL() === null ? "none" : `[url](${newGuild.iconURL()})\nalso see image`,
			inline: false
		}].concat(log_data);
		if(oldGuild.iconURL() !== null) data.thumbnail = {
			url: oldGuild.iconURL()
		};
		if(newGuild.iconURL() !== null) data.image = {
			url: newGuild.iconURL()
		};
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// owner
	if(oldGuild.ownerID !== newGuild.ownerID) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Owner",
			value: `${oldGuild.owner.tag} (${oldGuild.owner.id})`,
			inline: false
		},{
			name: "New Owner",
			value: `${newGuild.owner.tag} (${newGuild.owner.id})`,
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// content filter
	if(oldGuild.explicitContentFilter !== newGuild.explicitContentFilter) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Content Filter",
			value: contentFilters[oldGuild.explicitContentFilter],
			inline: false
		},{
			name: "New Content Filter",
			value: contentFilters[newGuild.explicitContentFilter],
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// default message notifications
	if(oldGuild.defaultMessageNotifications !== newGuild.defaultMessageNotifications) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Message Notifications",
			value: oldGuild.defaultMessageNotifications === "ALL" ? "All Message Notifications" : "Mentions Only",
			inline: false
		},{
			name: "New Message Notifications",
			value: newGuild.defaultMessageNotifications === "ALL" ? "All Message Notifications" : "Mentions Only",
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// afk channel
	if(oldGuild.afkChannelID !== newGuild.afkChannelID) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old AFK Channel",
			value: oldGuild.afkChannel instanceof this.Discord.VoiceChannel ? `${oldGuild.afkChannel.name} (${oldGuild.afkChannel.id})` : "None",
			inline: false
		},{
			name: "New AFK Channel",
			value: newGuild.afkChannel instanceof this.Discord.VoiceChannel ? `${newGuild.afkChannel.name} (${newGuild.afkChannel.id})` : "None",
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// afk timeout
	if(oldGuild.afkTimeout !== newGuild.afkTimeout) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old AFK Timeout",
			value: oldGuild.afkTimeout === null ? "None" : this.ms(oldGuild.afkTimeout*1000),
			inline: false
		},{
			name: "New AFK Timeout",
			value: newGuild.afkTimeout === null ? "None" : this.ms(newGuild.afkTimeout*1000),
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// mfa level
	if(oldGuild.mfaLevel !== newGuild.mfaLevel) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old 2FA Requirment",
			value: mfaLevels[oldGuild.mfaLevel],
			inline: false
		},{
			name: "New 2FA Requirment",
			value: mfaLevels[newGuild.mfaLevel],
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// verification level
	if(oldGuild.verificationLevel !== newGuild.verificationLevel) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Verification Level",
			value: verificationLevels[oldGuild.verificationLevel],
			inline: false
		},{
			name: "New Verification Level",
			value: verificationLevels[newGuild.verificationLevel],
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}

	// features
	if(!this._.isEqual(oldGuild.features,newGuild.features)) {
		data = Object.assign({},base);
		data.fields = [{
			name: "Old Features List",
			value: oldGuild.features.join(", "),
			inline: false
		},{
			name: "New Features List",
			value: newGuild.features.join(", "),
			inline: false
		}].concat(log_data);
		embed = new this.Discord.MessageEmbed(data);
		logch.send(embed);
	}
});