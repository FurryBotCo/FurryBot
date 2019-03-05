const express = require("express"),
	app = express.Router(),
	client = require("../../");

app.get("/commands",async(req,res) => {
	client.analytics.track({
		userId: "WEBSERVER",
		event: "web.request.commands",
		properties: {
			bot: {
				version: client.config.bot.version,
				beta: client.config.beta,
				alpha: client.config.alpha,
				server: client.os.hostname()
			}
		}
	});
	const commands = require("./commands");
	let cmds = {};

	commands.map(c => c.name.toLowerCase()).forEach((c) => {
		cmds[c] = {};
	});

	commands.map(c => c.commands).forEach((cmd) => {
		cmd.forEach((c) => {

		});
	});
	commands.forEach((category) => {
		category.commands.forEach((cmd) => {
			let cc = Object.assign({},cmd);
			delete cc.run;
			cmds[category.name.toLowerCase()][cmd.triggers[0]] = cc;
		});
	});
	return res.status(200).json({success:true,list:cmds});
});

module.exports = app;