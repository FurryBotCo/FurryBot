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

module.exports = (async function (message) {
	this.trackEvent({
		group: "EVENTS",
		userId: typeof message.author !== "undefined" ? message.author.id : null,
		event: "client.events.messageDelete",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});
	if (!this || !mdb || !message || !message.author || message.author.bot || message.channel.type !== 0) return;
	if (!message.channel.guild || ![0, 2, 4].includes(message.channel.type)) return;
	const gConfig = await mdb.collection("guilds").findOne({
			id: message.channel.guild.id
		}),
		ev = "messagedelete";
	if (!gConfig) return;
	if ([undefined, null, ""].includes(gConfig.logging[ev])) return mdb.collection("guilds").findOneAndUpdate({
		id: message.channel.guild.id
	}, {
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if (!gConfig.logging[ev].enabled) return;
	const ch = message.channel.guild.channels.get(gConfig.logging[ev].channel);
	if (!ch) return mdb.collection("guilds").findOneAndUpdate({
		id: message.channel.guild.id
	}, {
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
			icon_url: message.channel.guild.iconURL,
			name: message.channel.guild.name
		},
		footer: {
			icon_url: message.author.avatarURL,
			text: `Message Author: ${message.author.username}#${message.author.discriminator}`
		},
		title: "Message Deleted",
		description: `Message by ${message.author.username}#${message.author.discriminator} deleted in <#${message.channel.id}> (${message.channel.id})`,
		fields: [{
			name: "Content",
			value: message.content,
			inline: false
		}],
		color: functions.randomColor(),
		timestamp: this.getCurrentTimestamp()
	};
	return ch.createMessage({
		embed
	}).catch(err => {
		this.logger.error(err);
	});
});