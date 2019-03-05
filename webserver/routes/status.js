const express = require("express"),
	app = express.Router(),
	client = require("../../");

app.get("/status",async(req,res) => {
	client.analytics.track({
		userId: "WEBSERVER",
		event: "web.request.status",
		properties: {
			bot: {
				version: client.config.bot.version,
				beta: client.config.beta,
				alpha: client.config.alpha,
				server: client.os.hostname()
			}
		}
	});
	return res.status(200).json({
		success: true,
		clientStatus: client.user.presence.status
	});
});

module.exports = app;