const express = require("express"),
	app = express.Router(),
	client = require("../../"),
	config = require("../../config");

app.get("/stats",async(req,res) => {
	client.trackEvent({
		group: "WEBSERVER",
		event: "web.request.stats",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: client.os.hostname()
			}
		}
	});
	let userCount, d, date, a, dailyJoins, largeGuildCount;
	userCount = 0;
	largeGuildCount = client.guilds.filter(g => g.large).size;
	client.guilds.forEach((g) => userCount+=g.memberCount);
	d = new Date();
	date = `${d.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${d.getMonth()+1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`;
	a = await this.mdb.collection("dailyjoins").findOne({id: date});
	dailyJoins = a !== null ? a.count : null|| null;
	return res.status(200).json({
		success:true,
		clientStatus: client.user.presence.status,
		guildCount: client.guilds.size,userCount,
		shardCount: client.options.shardCount,
		memoryUsage: {
			process: {
				used: client.memory.process.getUsed(),
				total: client.memory.process.getTotal()
			},
			system: {
				used: client.memory.system.getUsed(),
				total: client.memory.system.getTotal()
			}
		},
		largeGuildCount,
		apiVersion: config.bot.apiVersion,
		botVersion: config.bot.version,
		discordjsVersion: client.Discord.version,
		nodeVersion: process.version,
		dailyJoins,
		commandCount: client.commandList.length,
		messageCount: await this.mdb.collection("stats").findOne({id: "messageCount"}).then(res => res.count),
		dmMessageCount: await this.mdb.collection("stats").findOne({id: "messageCount"}).then(res => res.dmCount)
	});
}).get("/stats/ping",async(req,res) => {
	client.trackEvent({
		group: "WEBSERVER",
		event: "web.request.stats.ping",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: client.os.hostname()
			}
		}
	});
	return res.status(200).json({
		success: true,
		ping:Math.round(client.ws.ping)
	});
});