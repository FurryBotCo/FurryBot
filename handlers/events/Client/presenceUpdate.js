module.exports = (async function(oldMember,newMember) {
	if(!oldMember || !newMember) return;
	if(!newMember.guild) return;
	this.trackEvent({
		group: "EVENTS",
		userId: newMember.id,
		event: "client.events.presenceUpdate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			},
			old: oldMember.presence,
			new: newMember.presence
		}
	});
	let ev, gConfig, logch, data, embed, oldPr, newPr;
	ev = "presenceupdate";
	gConfig = await this.db.getGuild(newMember.guild.id).catch(error => this.config.defaultGuildSettings);
	if(!gConfig || [undefined,null,""].includes(gConfig.logging) || [undefined,null,""].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
	logch = newMember.guild.channels.get(gConfig.logging[ev].channel);
	if(!logch) return this.db.updateGuild(newMember.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
	if(!oldMember.presence.activity) oldPr = oldMember.presence.status;
	else oldPr = `Status: ${oldMember.presence.status}\n\
	Activity Name: ${oldMember.presence.activity.name || "NONE"}\n\
	Activity Details: ${oldMember.presence.activity.details || "NONE"}\n\
	Activity State: ${oldMember.presence.activity.state || "NONE"}\n\
	Activity URL: ${oldMember.presence.activity.url || "NONE"}`

	if(!newMember.presence.activity) newPr = newMember.presence.status;
	else newPr = `Status: ${newMember.presence.status}\n\
	Activity Name: ${newMember.presence.activity.name || "NONE"}\n\
	Activity Details: ${newMember.presence.activity.details || "NONE"}\n\
	Activity State: ${newMember.presence.activity.state || "NONE"}\n\
	Activity URL: ${newMember.presence.activity.url || "NONE"}`

	data = {
		title: `Member Presence Updated`,
		author: {
			name: newMember.user.tag,
			icon_url: newMember.user.displayAvatarURL()
		},
		timestamp: newMember.createdTimestamp,
		color: this.randomColor(),
		footer: {
			text: `Shard ${![undefined,null].includes(newMember.guild.shard) ? `${+newMember.guild.shard.id+1}/${this.options.shardCount}`: "1/1"} | Bot Version ${this.config.bot.version}`
		},
		fields: [
			{
				name: "Old Presence",
				value: oldPr,
				inline: false
			},{
				name: "New Presence",
				value: newPr,
				inline: false
			},{
				name: "ID",
				value: newMember.id,
				inline: false
			}
		]
	};
	embed = new this.Discord.MessageEmbed(data);
	return logch.send(embed);
});