import express from "express";
import { mdb } from "../../modules/Database";
import config from "../../config";
import FurryBot from "@FurryBot";
import { Internal } from "../../util/Functions";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => {
		const d = new Date(),
			date = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`,
			dailyJoins = await mdb.collection("dailyjoins").findOne({ date }).then(res => res.count).catch(err => null);

		return res.status(200).json({
			success: true,
			clientStatus: "online",
			guildCount: client.guilds.size,
			userCount: client.users.size,
			shardCount: client.shards.size,
			memoryUsage: {
				process: {
					used: Internal.memory.process.getUsed(),
					total: Internal.memory.process.getTotal()
				},
				system: {
					used: Internal.memory.system.getUsed(),
					total: Internal.memory.system.getTotal()
				}
			},
			largeGuildCount: client.guilds.filter(g => g.large).length,
			botVersion: config.version,
			library: "eris",
			libraryVersion: require("eris").VERSION,
			nodeVersion: process.version,
			dailyJoins,
			commandCount: client.cmd.commands.length,
			messageCount: client.stats.messageCount,
			dmMessageCount: client.stats.dmMessageCount
		});
	});

	// fix ping sometime
	/*
		.get("/ping", async (req, res) => res.status(200).json({
			success: true,
			ping: Math.floor(client.shards.map(s => s.latency).reduce((a, b) => a + b) / client.shards.size)
		}))*/

	return app;
});
