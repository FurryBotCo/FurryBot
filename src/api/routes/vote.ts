import express from "express";
import config from "../../config";
import { mdb } from "../../modules/Database";
import uuid from "uuid/v4";
import * as eris from "eris";
import apiFunctions from "../functions";
import { Logger } from "../../util/LoggerV8";
import FurryBot from "@FurryBot";

export default (async (client: FurryBot) => {
	const app: express.Router = express.Router();

	app.post("/:list", async (req, res) => {
		if (req.headers.authorization !== config.universalKey) return res.status(401).json({
			success: false,
			error: "invalid authorization"
		});

		switch (req.params.list.toLowerCase()) {
			case "dbl":
				Logger.log("API | Vote", `${req.body.type.toLowerCase() === "test" ? "Test v" : "V"}ote from dbl for ${req.body.user} on bot ${req.body.bot}`);

				if (req.body.bot !== client.user.id) {
					Logger.warn("API | Vote", `Vote for different client recieved, current client: ${client.user.id}, recieved: ${req.body.bot}`);
					return res.status(400).json({
						success: false,
						error: "invalid client"
					});
				}

				await mdb.collection("votes").insertOne({
					id: uuid(),
					userId: req.body.user,
					bot: req.body.bot,
					weekend: req.body.isWeekend,
					type: req.body.type,
					query: req.body.query,
					timestamp: Date.now()
				});

				let bal = await mdb.collection("users").findOne({ id: req.body.user }).then(res => res.bal + config.eco.voteAmount).catch(err => null);

				if (!bal) {
					await mdb.collection("users").insertOne({ ...{ id: req.body.user, ...config.defaults.userConfig } });
					bal = config.defaults.userConfig.bal;
				}

				await mdb.collection("users").findOneAndUpdate({ id: req.body.user }, { $set: { bal } });

				const u = await client.getRESTUser(req.body.user);

				await u.getDMChannel().then(ch => ch.createMessage({
					embed: {
						title: "Thanks for voting for me!",
						description: `Hey, thanks for voting for me on that bot list!\nYou've been gifted **${config.eco.voteAmount}**${config.eco.emoji}!`,
						timestamp: new Date().toISOString(),
						color: client.f.randomColor()
					}
				})).catch(err => null);

				const embed: eris.EmbedOptions = {
					title: `Vote for ${client.user.username}#${client.user.discriminator}`,
					author: {
						name: `Vote performed by ${u.username}#${u.discriminator}`,
						icon_url: u.avatarURL
					},
					description: `[voted on dbl](https://discordbots.org/bot/398251412246495233/vote)`,
					timestamp: new Date().toISOString(),
					color: client.f.randomColor()
				};

				await client.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
					embeds: [embed],
					username: `Vote Logs${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://assets.furry.bot/vote_logs.png"
				});
				break;

			default:
				return res.status(404).json({
					success: false,
					error: "invalid list"
				});
		}

		return res.status(200).json({
			success: true
		});
	});

	return app;

});
