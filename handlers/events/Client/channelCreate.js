const config = require("../../../config"),
	Trello = require("trello"),
	os = require("os"),
	util = require("util"),
	request = util.promisify(require("request")),
	phin = require("phin").defaults({
		method: "GET",
		parse: "json",
		headers: {
			"User-Agent": config.web.userAgent
		}
	}),
	uuid = require("uuid/v4"),
	fs = require("fs"),
	path = require("path"),
	colors = require("console-colors-2"),
	Canvas = require("canvas-constructor").Canvas,
	fsn = require("fs-nextra"),
	chalk = require("chalk"),
	chunk = require("chunk"),
	ytdl = require("ytdl-core"),
	_ = require("lodash"),
	perf = require("perf_hooks"),
	performance = perf.performance,
	PerformanceObserver = perf.PerformanceObserver,
	child_process = require("child_process"),
	shell = child_process.exec,
	truncate = require("truncate"),
	wordGen = require("random-words"),
	deasync = require("deasync"),
	{ MongoClient, mongo, mdb } = require("../../../modules/Database");
	
module.exports = (async function(channel) {
	if(!this || !this.mdb || !channel || channel.type === 1 || !channel.guild) return;
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
	const gConfig = await mdb.collection("guilds").findOne({id: channel.guild.id}),
		ev = "channelcreate";
	if(!gConfig) return;
	if([undefined,null,""].includes(gConfig.logging[ev])) return mdb.collection("guilds").findOneAndUpdate({ id: channel.guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if(!gConfig.logging[ev].enabled) return;
	const ch = channel.guild.channels.get(gConfig.logging[ev].channel);
	if(!ch) return mdb.collection("guilds").findOneAndUpdate({ id: channel.guild.id },{
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