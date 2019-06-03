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
	
module.exports = (async function(error) {
	let embed;
	const num = this.random(10,"1234567890"),
		code = `err.${config.beta ? "beta" : "stable"}.${num}`;
	if(this.logger !== undefined) this.logger.error(`[UnknownOrigin] e1: ${error.name}: ${error.message}\n${error.stack},\nError Code: ${code}`);
	else console.error(`[UnknownOrigin] e1: ${error.name}: ${error.message}\n${error.stack},\nError Code: ${code}`);

	await this.mdb.collection("errors").insertOne({
		id: code,
		num,
		error: {
			name: error.name,
			message: error.message,
			stack: error.stack
		},
		level: "e1",
		bot: {
			version: config.bot.version,
			beta: config.beta,
			alpha: config.alpha,
			server: os.hostname()
		}
	});
	this.trackEvent({
		group: "ERRORS",
		event: "client.errors",
		properties: {
			code,
			num,
			error: {
				name: error.name,
				message: error.message,
				stack: error.stack
			},
			level: "e1",
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});

	embed = {
		title: "General Error",
		description: `Error Code: \`${code}\``,
		author: {
			name: "General Error",
			icon_url: "https://i.furry.bot/furry.png"
		},
		fields: [
			{
				name: "Error",
				value: `Name: ${error.name}\n\
				Stack: ${error.stack}\n\
				Message: ${error.message}`,
				inline: false
			}
		]
	};
	return this.bot.executeWebhook(config.webhooks.errors.id,config.webhooks.errors.token,{ embeds: [ embed ], username: `Error Reporter${config.beta ? " - Beta" : ""}` });
});