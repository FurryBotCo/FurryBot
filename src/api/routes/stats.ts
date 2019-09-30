import express from "express";
import { mdb } from "../../modules/Database";
import config from "../../config";
import apiFunctions from "../functions";
import CmdHandler from "../../util/cmd";
import FurryBot from "@FurryBot";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => {
		const d = new Date(),
			date = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`,
			dailyJoins = await mdb.collection("dailyjoins").findOne({ date }).then(res => res.count).catch(err => null);

		const st = await client.cluster.getMasterStats();
		return res.status(200).json({
			success: true,
			clientStatus: "online",
			guildCount: st.guildCount,
			userCount: st.userCount,
			shardCount: st.shardCount,
			clusterCount: st.clusters.size,
			memoryUsage: {
				process: {
					used: client.f.memory.process.getUsed(),
					total: client.f.memory.process.getTotal()
				},
				system: {
					used: client.f.memory.system.getUsed(),
					total: client.f.memory.system.getTotal()
				}
			},
			largeGuildCount: st.largeGuildCount,
			botVersion: config.version,
			library: "eris",
			libraryVersion: require("eris").VERSION,
			nodeVersion: process.version,
			dailyJoins,
			commandCount: CmdHandler.commands.length,
			messageCount: 0,
			dmMessageCount: 0
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
