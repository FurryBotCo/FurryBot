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

module.exports = (async function (guild, role) {
	this.trackEvent({
		group: "EVENTS",
		guildId: guild.id,
		event: "client.events.roleCreate",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});
	if (!this || !mdb || !guild || !role) return;
	const gConfig = await mdb.collection("guilds").findOne({
			id: guild.id
		}),
		ev = "rolecreate";
	if (!gConfig) return;
	if ([undefined, null, ""].includes(gConfig.logging[ev])) return mdb.collection("guilds").findOneAndUpdate({
		id: guild.id
	}, {
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if (!gConfig.logging[ev].enabled) return;
	const ch = guild.channels.get(gConfig.logging[ev].channel);
	if (!ch) return mdb.collection("guilds").findOneAndUpdate({
		id: guild.id
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
			icon_url: guild.iconURL,
			name: guild.name
		},
		title: "Role Created",
		description: `Role ${role.name} (${role.id}) was created`,
		fields: [{
			name: "Role Info",
			value: `Name: ${role.name}\n\
				Hoisted: ${role.hoisted ? "Yes": "No"}\n\
				Mentionable: ${role.mentionable ? "Yes" : "No"}\n\
				Managed (Bot Role): ${role.managed ? "Yes" : "No"}\n\
				Color: ${role.color.toString(16).padStart(6,0).toUpperCase()}`,
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