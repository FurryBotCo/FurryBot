import express from "express";
import { mdb } from "../../modules/Database";
import manager from "../../../";
import functions from "../../util/functions";
import config from "../../config";
import apiFunctions from "../functions";
import CmdHandler from "../../util/cmd";

const app: express.Router = express.Router();

app.get("/", async (req, res) => {
	if (!manager.ready) res.status(400).json({
		success: false,
		error: "ClusterManager is not in the 'ready' state."
	});

	const d = new Date(),
		date = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`,
		dailyJoins = await mdb.collection("dailyjoins").findOne({ date }).then(res => res.count).catch(err => null);

	return res.status(200).json({
		success: true,
		guildCount: manager.stats.guilds,
		userCount: manager.stats.users,
		shardCount: manager.stats.shards.length,
		memoryUsage: {
			process: {
				used: functions.memory.process.getUsed(),
				total: functions.memory.process.getTotal()
			},
			system: {
				used: functions.memory.system.getUsed(),
				total: functions.memory.system.getTotal()
			}
		},
		largeGuildCount: manager.stats.largeGuilds,
		botVersion: config.version,
		library: "eris",
		libraryVersion: require("eris").VERSION,
		nodeVersion: process.version,
		dailyJoins,
		commandCount: CmdHandler.commands.length,
		messageCount: 0,
		dmMessageCount: 0
	});
})
	.get("/ping", async (req, res) => !manager.ready ? res.status(400).json({
		success: false,
		error: "ClusterManager is not in the 'ready' state."
	}) : res.status(200).json({
		success: true,
		ping: Math.floor(manager.stats.shards.map(s => s.latency).reduce((a, b) => a + b) / manager.stats.shards.length) || 0
	}));

export default app;