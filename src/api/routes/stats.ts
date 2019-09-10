import express from "express";
import { mdb } from "../../modules/Database";
import client from "../../../";
import functions from "../../util/functions";
import config from "../../config";
import apiFunctions from "../functions";

const app: express.Router = express.Router();

app.get("/", async (req, res) => {
	const d = new Date(),
		date = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`,
		dailyJoins = await mdb.collection("dailyjoins").findOne({ date }).then(res => res.count).catch(err => null);

	return res.status(200).json({
		success: true,
		clientStatus: client.guilds.get(config.bot.mainGuild).members.get(client.user.id).status,
		guildCount: client.guilds.size,
		userCount: client.guilds.map(g => g.memberCount).reduce((a, b) => a + b),
		shardCount: client.shards.size,
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
		largeGuildCount: client.guilds.filter(g => g.large).length,
		botVersion: config.version,
		library: "eris",
		libraryVersion: require("eris").VERSION,
		nodeVersion: process.version,
		dailyJoins,
		commandCount: client.cmdHandler.commands.length,
		messageCount: 0,
		dmMessageCount: 0
	});
})
	.get("/ping", async (req, res) => res.status(200).json({
		success: true,
		ping: Math.floor(client.shards.map(s => s.latency).reduce((a, b) => a + b) / client.shards.size)
	}));

export default app;