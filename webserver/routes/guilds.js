const express = require("express"),
	app = express.Router(),
	client = require("../../"),
	{ checkAuth } = require("../functions"); 

app.get("/guilds",async(req,res) => {
	client.analytics.track({
		userId: "WEBSERVER",
		event: "web.request.guilds",
		properties: {
			bot: {
				version: client.config.bot.version,
				beta: client.config.beta,
				alpha: client.config.alpha,
				server: client.os.hostname()
			}
		}
	});
	let jsn = {
		success: true,
		guildCount: client.guilds.size
	};
	if(checkAuth(req,res,false)) {
		jsn.guilds = client.guilds.map(g => ({[g.id]:{name:g.name,memberCount:g.memberCount}}));
	}
	res.status(200).json(jsn);
}).get("/guilds/:id/shard",checkAuth,async(req,res) => {
	client.analytics.track({
		userId: "WEBSERVER",
		event: "web.request.guilds.id.shard",
		properties: {
			bot: {
				version: client.config.bot.version,
				beta: client.config.beta,
				alpha: client.config.alpha,
				server: client.os.hostname()
			}
		}
	});
	if(!client.guilds.has(req.params.id)) return res.status(404).json({
		success: false,
		error: "invalid guild id"
	});
	return res.status(200).json({
		success: true,
		shardId: client.guilds.get(req.params.id).shardID,
		shardCount: client.options.shardCount
	});
});

module.exports = app;