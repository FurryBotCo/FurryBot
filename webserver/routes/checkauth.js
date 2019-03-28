const express = require("express"),
	app = express.Router(),
	client = require("../../"),
	{ checkAuth } = require("../functions"); 

app.get("/checkauth",checkAuth,async(req,res) => {
	client.trackEvent({
		group: "WEBSERVER",
		event: "web.request.checkauth",
		properties: {
			bot: {
				version: client.config.bot.version,
				beta: client.config.beta,
				alpha: client.config.alpha,
				server: client.os.hostname()
			}
		}
	});
	return res.status(200).json({success:true});
});

module.exports = app;