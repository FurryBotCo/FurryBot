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
	
module.exports = (async function(guild,role) {
	this.trackEvent({
		group: "EVENTS",
		guildId: guild.id,
		event: "client.events.roleDelete",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: require("os").hostname()
			}
		}
	});
	if(!this || !mdb || !guild || !role) return;
	const gConfig = await mdb.collection("guilds").findOne({id: guild.id}),
		ev = "roledelete";
	if(!gConfig) return;
	if([undefined,null,""].includes(gConfig.logging[ev])) return mdb.collection("guilds").findOneAndUpdate({ id: guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if(!gConfig.logging[ev].enabled) return;
	const ch = guild.channels.get(gConfig.logging[ev].channel);
	if(!ch) return mdb.collection("guilds").findOneAndUpdate({ id: guild.id },{
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