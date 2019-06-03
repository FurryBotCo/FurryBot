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
	
module.exports = (async function(message,oldMessage) {
	this.trackEvent({
		group: "EVENTS",
		userId: message.author !== "undefined" ? message.author.id : null,
		event: "client.events.messageUpdate",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: require("os").hostname()
			}
		}
	});
	if(!this || !mdb || !message || !message.author || message.author.bot || !oldMessage || message.channel.type !== 0 || message.content === oldMessage.content) return;
	this.bot.emit("messageCreate",message);
	if(!message.channel.guild || ![0,2,4].includes(message.channel.type)) return;
	const gConfig = await mdb.collection("guilds").findOne({id: message.channel.guild.id}),
		ev = "messageupdate";
	if(!gConfig) return;
	if([undefined,null,""].includes(gConfig.logging[ev])) return mdb.collection("guilds").findOneAndUpdate({ id: message.channel.guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if(!gConfig.logging[ev].enabled) return;
	const ch = message.channel.guild.channels.get(gConfig.logging[ev].channel);
	if(!ch) return mdb.collection("guilds").findOneAndUpdate({ id: message.channel.guild.id },{
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
		title: "Message Edited",
		description: `Message by ${message.author.username}#${message.author.discriminator} edited in <#${message.channel.id}> (${message.channel.id})`,
		fields: [
			{
				name: "Old Content",
				value: oldMessage.content,
				inline: false
			},
			{
				name: "New Content",
				value: message.content,
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