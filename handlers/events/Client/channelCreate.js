module.exports = (async function(channel) {
	this.trackEvent({
		group: "EVENTS",
		guildId: channel.guild.id,
		event: "client.events.channelCreate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: require("os").hostname()
			}
		}
	});
	if(!this || !this.mdb || !channel || !channel.guild) return;
	const gConfig = await this.mdb.collection("guilds").findOne({id: channel.guild.id}),
		ev = "channelcreate";
	if(!gConfig) return;
	if([undefined,null,""].includes(gConfig.logging[ev])) return this.mdb.collection("guilds").findOneAndUpdate({ id: channel.guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if(!gConfig.logging[ev].enabled) return;
	const ch = channel.guild.channels.get(gConfig.logging[ev].channel);
	if(!ch) return this.mdb.collection("guilds").findOneAndUpdate({ id: channel.guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	let embed;

	const type = [
		"Text",    // 0 - text
		null,      // 1 - dm channel
		"Voice",   // 2 - voice
		null,      // 3 - unknown
		"Category" // 4 - category
	];

	embed = {
		author: {
			icon_url: channel.guild.iconURL,
			name: channel.guild.name
		},
		title: "Channel Created",
		description: `Channel ${channel.name} (${channel.id}) was created`,
		fields: [
			{
				name: "Channel Info",
				value: `Name: ${channel.name}`,
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