const express = require("express"),
	app = express.Router(),
	client = require("../../"),
	{ checkAuth } = require("../functions");

app.post("/dev/eval",checkAuth,async(req,res) => {
	client.trackEvent({
		group: "WEBSERVER",
		event: "web.request.dev.eval",
		properties: {
			bot: {
				version: client.config.bot.version,
				beta: client.config.beta,
				alpha: client.config.alpha,
				server: client.os.hostname()
			}
		}
	});
	console.log(req.body);
	if(!req.body.code) return res.status(400).json({ success: false, message: "missing code" });
	for(let b of  this.config.evalBlacklist) {
		if(b.test(req.body.code)) return res.status(400).json({ success: false, message: "blacklisted code found"});
	}
	const start = client.performance.now(),
		result = await eval(req.body.code),
		end = client.performance.now();
	return res.status(200).json({ success: true, result, time: (end-start).toFixed(3) });
});

module.exports = app;