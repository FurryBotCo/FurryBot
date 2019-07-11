import express from "express";
import config from "@config";
import client from "@root/index";
import { mdb } from "@modules/Database";
import uuid from "uuid/v4";
import functions from "@util/functions";
import uConfig from "@src/default/userConfig.json";

const app: express.Router = express.Router();

app.post("/:list", async (req, res) => {
	if (req.headers.authorization !== config.universalKey) return res.status(401).json({
		success: false,
		error: "invalid authorization"
	});

	switch (req.params.list.toLowerCase()) {
		case "dbl":
			console.log(`${req.body.type.toLowerCase() === "test" ? "Test v" : "V"}ote from dbl for ${req.body.user} on bot ${req.body.bot}`);

			if (req.body.bot !== client.user.id) {
				console.log(`Vote for different client recieved, current client: ${client.user.id}, recieved: ${req.body.bot}`);
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

			let bal = await mdb.collection("users").findOne({ id: req.body.user }).then(res => res.bal + 100).catch(err => null);

			if (!bal) {
				await mdb.collection("users").insertOne({ ...{ id: req.body.user, ...uConfig } });
				bal = uConfig.bal;
			}

			await mdb.collection("users").findOneAndUpdate({ id: req.body.user }, { $set: { bal } });

			let u = client.users.get(req.body.user);
			if (!u) u = await client.getRESTUser(req.body.user);

			await u.getDMChannel().then(ch => ch.createMessage({
				embed: {
					title: "Thanks for voting for me!",
					description: `Hey, thanks for voting for me on that bot list!\nYou've been gifted **100**${config.ecoEmoji}!`,
					timestamp: new Date().toISOString(),
					color: functions.randomColor()
				}
			})).catch(err => null);
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

export default app;