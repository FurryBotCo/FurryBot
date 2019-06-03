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
	
module.exports = (async function(guild,role,oldRole) {
	this.trackEvent({
		group: "EVENTS",
		guildId: guild.id,
		event: "client.events.roleUpdate",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: require("os").hostname()
			}
		}
	});
	if(!this || !mdb || !guild || !role || !oldRole || (role.id === guild.id || oldRole.id === guild.id)) return;
	const gConfig = await mdb.collection("guilds").findOne({id: guild.id}),
		ev = "roleupdate";
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
		title: "Role Updated",
		description: `Role ${role.name} (${role.id}) was updated`,
		fields: [
			{
				name: "Old Role Info",
				value: `Name: ${oldRole.name}\n\
				Hoisted: ${oldRole.hoisted ? "Yes": "No"}\n\
				Mentionable: ${oldRole.mentionable ? "Yes" : "No"}\n\
				Managed (Bot Role): ${oldRole.managed ? "Yes" : "No"}\n\
				Color: ${oldRole.color.toString(16).padStart(6,0).toUpperCase()}\n\
				Position: ${oldRole.position}`,
				inline: false
			},
			{
				name: "New Role Info",
				value: `Name: ${role.name}\n\
				Hoisted: ${role.hoisted ? "Yes": "No"}\n\
				Mentionable: ${role.mentionable ? "Yes" : "No"}\n\
				Managed (Bot Role): ${role.managed ? "Yes" : "No"}\n\
				Color: ${role.color.toString(16).padStart(6,0).toUpperCase()}\n\
				Position: ${role.position}\n\
				${(oldRole.permissions.allow !== role.permissions.allow || oldRole.permissions.deny !== role.permissions.deny) ? "Role permissions might have changed, check the audit log." : ""}`,
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