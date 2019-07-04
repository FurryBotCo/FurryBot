import express from "express";
import { mdb } from "@modules/Database";
import client from "@root/index";
import functions from "@util/functions";
import config from "@src/config/config";

const app: express.Router = express.Router();

app.get("/", async (req, res) => {
	let d, date, a, dailyJoins;
	d = new Date();
	date = `${d.getMonth().toString().length > 1 ? d.getMonth() + 1 : `0${d.getMonth() + 1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`;
	a = await mdb.collection("dailyjoins").findOne({
		id: date
	});
	dailyJoins = a !== null ? a.count : null || null;

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
		commandCount: client.commands.length,
		messageCount: 0,
		dmMessageCount: 0
	});
})
	.get("/ping", async (req, res) => res.status(200).json({
		success: true,
		ping: Math.floor(client.shards.map(s => s.latency).reduce((a, b) => a + b) / client.shards.size)
	}));

export default app;