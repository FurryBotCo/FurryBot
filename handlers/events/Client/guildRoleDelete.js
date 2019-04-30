module.exports = (async function(guild,role) {
	this.trackEvent({
		group: "EVENTS",
		guildId: guild.id,
		event: "client.events.roleDelete",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: require("os").hostname()
			}
		}
	});
	if(!this || !this.mdb || !guild || !role) return;
	const gConfig = await this.mdb.collection("guilds").findOne({id: guild.id}),
		ev = "roledelete";
	if(!gConfig) return;
	if([undefined,null,""].includes(gConfig.logging[ev])) return this.mdb.collection("guilds").findOneAndUpdate({ id: guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if(!gConfig.logging[ev].enabled) return;
	const ch = guild.channels.get(gConfig.logging[ev].channel);
	if(!ch) return this.mdb.collection("guilds").findOneAndUpdate({ id: guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	let embed;


	embed = {
		author: {
			icon_url: guild.iconURL,
			name: guild.name
		},
		title: "Role Deleted",
		description: `Role ${role.name} (${role.id}) was deleted`,
		fields: [
			{
				name: "Role Info",
				value: `Name: ${role.name}\n\
				Hoisted: ${role.hoisted ? "Yes": "No"}\n\
				Mentionable: ${role.mentionable ? "Yes" : "No"}\n\
				Managed (Bot Role): ${role.managed ? "Yes" : "No"}\n\
				Color: ${role.color.toString(16).padStart(6,0).toUpperCase()}`,
				inline: false
			}
		],
		color: this.randomColor(),
		timestamp: this.getCurrentTimestamp()
	};
	return ch.createMessage({ embed }).catch(err => {
		this.logger.error(err);
	});
});