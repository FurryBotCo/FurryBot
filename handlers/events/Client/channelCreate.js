const {
	config,
	os,
	util,
	phin,
	performance,
	Database: {
		MongoClient,
		mongo,
		mdb
	},
	functions
} = require("../../../modules/CommandRequire");

module.exports = (async function (channel) {
	if (!this || !this.mdb || !channel || channel.type === 1 || !channel.guild) return;
	this.trackEvent({
		group: "EVENTS",
		guildId: channel.guild.id,
		event: "client.events.channelCreate",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});
	const gConfig = await mdb.collection("guilds").findOne({
			id: channel.guild.id
		}),
		ev = "channelcreate";
	if (!gConfig) return;
	if ([undefined, null, ""].includes(gConfig.logging[ev])) return mdb.collection("guilds").findOneAndUpdate({
		id: channel.guild.id
	}, {
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if (!gConfig.logging[ev].enabled) return;
	const ch = channel.guild.channels.get(gConfig.logging[ev].channel);
	if (!ch) return mdb.collection("guilds").findOneAndUpdate({
		id: channel.guild.id
	}, {
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	let embed;

	const type = [
		"Text", // 0 - text
		null, // 1 - dm channel
		"Voice", // 2 - voice
		null, // 3 - unknown
		"Category" // 4 - category
	];

	embed = {
		author: {
			icon_url: channel.guild.iconURL,
			name: channel.guild.name
		},
		title: "Channel Created",
		description: `Channel ${channel.name} (${channel.id}) was created`,
		fields: [{
			name: "Channel Info",
			value: `Name: ${channel.name}`,
			inline: false
		}],
		color: functions.randomColor(),
		timestamp: functions.getCurrentTimestamp()
	};
	return ch.createMessage({
		embed
	}).catch(err => {
		this.logger.error(err);
	});
});