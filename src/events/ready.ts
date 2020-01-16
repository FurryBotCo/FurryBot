import ClientEvent from "../util/ClientEvent";
import Temp from "../util/Temp";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import config from "../config";
import sv from "../api";
import express from "express";
import http from "http";
import { mdb } from "../modules/Database";
import cmd from "../commands";

export default new ClientEvent("ready", (async function (this: FurryBot) {
	this.increment([
		"events.ready"
	]);
	const srv = await sv(this);

	this.editStatus("online", {
		name: `with furries.. | ${config.defaultPrefix}help`,
		type: 0
	});

	setInterval(() => {
		this.editStatus("online", {
			name: `with furries.. | ${config.defaultPrefix}help`,
			type: 0
		});
	}, 6e4);

	this.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
		embeds: [
			{
				title: "Ready",
				description: `Ready with ${this.shards.size} shards, and ${this.guilds.size} guilds.`,
				timestamp: new Date().toISOString()
			}
		],
		username: `Furry Bot${config.beta ? " - Beta" : ""} Status`,
		avatarURL: "https://i.furry.bot/furry.png"
	});


	const svr = http.createServer(express())
		.on("error", () => (Logger.warn("APIServer", "Attempted to start api server, but the port is in use."), this.increment("other.apiServerLaunchFailed")))
		.on("listening", () => (svr.close(), this.srv = srv.listen(config.apiPort, config.apiBindIp, () => Logger.debug("APIServer", `Listening on ${config.apiBindIp}:${config.apiPort}`)), this.increment("other.apiServerLaunch")))
		.on("close", () => Logger.debug("APIServer", "Port test server closed, starting bot api server."))
		.listen(config.apiPort, config.apiBindIp);

	this.temp = new Temp(config.tmpDir);

	process.on("beforeExit", this.temp.clean.bind(this.temp));

	this.spamCounterInterval = setInterval(() => {
		this.spamCounter = this.spamCounter.filter(s => s.time + 3e4 > Date.now());
		this.responseSpamCounter = this.responseSpamCounter.filter(s => s.time + 3e4 > Date.now());
	}, 1e3);

	cmd.map(c => this.cmd.addCategory(c));

	this.cmd.commands.map(c => this.commandStats[c.triggers[0]] = 0);

	setInterval(async () => {
		let o = {
			messageCount: 0,
			dmMessageCount: 0
		};
		const k: typeof o = await mdb.collection("stats").findOne({ id: "messages" });

		if (k) {
			o = {
				messageCount: k.messageCount,
				dmMessageCount: k.dmMessageCount
			};
			await mdb.collection("stats").deleteOne({ id: "messages" }).catch(err => null);
		}

		await mdb.collection("stats").insertOne({
			id: "messages",
			messageCount: o.messageCount + this.stats.messageCount,
			dmMessageCount: o.dmMessageCount + this.stats.dmMessageCount,
			time: Date.now()
		});
		this.stats.messageCount = 0;
		this.stats.dmMessageCount = 0;
		// Logger.debug("Stats", "Posted message stats.");
	}, 1e4);

	setInterval(async () => {
		if (new Date().toString().split(" ")[4] === "00:00:00") {
			const d = new Date(Date.now() + 432e5);
			const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
			let k = await mdb.collection("dailyjoins").findOne({ id }).catch(err => null);
			if (!k) k = "Unknown.";
			Logger.log("Daily Joins", `Daily joins for ${id}: ${k}`);
			await this.executeWebhook(config.webhooks.dailyjoins.id, config.webhooks.dailyjoins.token, {
				embeds: [
					{
						title: `Daily Joins for ${id}`,
						description: `Total Servers Joined Today: ${k}\nTotal Servers: ${this.guilds.size}`,
						timestamp: new Date().toISOString()
					}
				],
				username: `Daily Joins${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png"
			});
		}
	}, 1e3);
	Logger.log("Ready", `Client ready with ${this.users.size} users, in ${Object.keys(this.channelGuildMap).length} channels, of ${this.guilds.size} guilds, with ${this.cmd.commands.length} commands.`);
}));
