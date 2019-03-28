const express = require("express"),
	app = express.Router(),
	client = require("../../");

app.post("/vote/dbl",async(req,res) => {
	if(!req.headers["authorization"] || req.headers["authorization"] !== client.config.universalKey) return res.status(401).json({success: false, error: "unauthorized"});
	if(req.body.bot !== "398251412246495233") return res.status(400).json({success: false, error: "invalid bot"});
	let data, embed, user;
	switch(req.body.type.toLowerCase()) {
	case "upvote":
		client.trackEvent({
			group: "WEBSERVER",
			event: "upvote.dbl",
			properties: {
				bot: req.body.bot,
				user: req.body.user,
				type: req.body.type,
				isWeekend: req.body.isWeekend,
				query: req.body.query
			}
		});
		user = await client.mdb.collections("users").findOne({id: req.body.user});
		if(req.body.isWeekend) {
			await client.mdb.collections("users").findOneAndUpdate({id: req.body.user},{$set:{bal: user.bal + 1000}});
			data = {
				title: "Thanks For Upvoting!",
				description: `As a reward for upvoting on Discord Bots, you earned 1000 ${client.config.emojis.owo}\nWeekend Voting, Double ${client.config.emojis.owo}!`,
				color: 65535
			};
		} else {
			await client.mdb.collections("users").findOneAndUpdate({id: req.body.user},{$set:{bal: user.bal + 500}});
			data = {
				title: "Thanks For Upvoting!",
				description: `As a reward for upvoting on Discord Bots, you earned 500 ${client.config.emojis.owo}`,
				color: 65535
			};
		}
		embed = new client.Discord.MessageEmbed(data);
		await client.users.get(req.body.user).send(embed);
		break;

	case "test":
		client.trackEvent({
			group: "WEBSERVER",
			event: "upvote.dbl.test",
			properties: {
				bot: req.body.bot,
				user: req.body.user,
				type: req.body.type,
				isWeekend: req.body.isWeekend,
				query: req.body.query
			}
		});
		client.logger.log(`Test DBL Vote: ${req.body}`);
		break;
	}
});

module.exports = app;