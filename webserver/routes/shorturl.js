const express = require("express"),
	app = express.Router(),
	client = require("../../");

app.get("/shorturl/:identifier",async(req,res) => {
	client.analytics.track({
		userId: "WEBSERVER",
		event: "web.request.shorturl",
		properties: {
			bot: {
				version: client.config.bot.version,
				beta: client.config.beta,
				alpha: client.config.alpha,
				server: client.os.hostname()
			}
		}
	});
	const s = await client.mdb.collection("shorturl").findOne({id: req.params.identifier});
	if(!s) return res.status(404).json({success: false, error: "invalid short code"});
	return res.status(200).json(s);
});

module.exports = app;