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
	
module.exports = (async function(message,emoji,userID) {
	this.trackEvent({
		group: "EVENTS",
		userId: typeof userID !== "undefined" ? userID : null,
		event: "client.events.messageReactionAdd",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: require("os").hostname()
			}
		}
	});

});