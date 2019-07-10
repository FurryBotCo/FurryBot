import ClientEvent from "@modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "@config";
import srv from "@src/api";
import express from "express";
import http from "http";
import ListStats from "@util/ListStats";
import Temp from "@util/Temp";
import functions from "@util/functions";
import { mdb } from "@src/modules/Database";

export default new ClientEvent("ready", (async function (this: FurryBot) {

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
	const sv = http.createServer(express())
		.on("error", () => this.logger.warn("Attempted to start api server, but the port is in use."))
		.on("listening", () => {
			sv.close();
			this.srv = srv.listen(config.apiPort);
		})
		.on("close", () => this.logger.debug("Port test server closed, starting bot api server."))
		.listen(config.apiPort);

	if (!config.beta) this.ls = setInterval(ListStats, 3e5, this);

	this.Temp = new Temp(`${config.rootDir}/tmp`);

	process.on("exit", this.Temp.clean)
		.on("SIGINT", this.Temp.clean)
		.on("SIGTERM", this.Temp.clean);

	this.logger.log(`Client has started with ${this.users.size} users, in ${Object.keys(this.channelGuildMap).length} channels, of ${this.guilds.size} guilds.`);

	// redo daily counts posting sometime
	setInterval(async () => {
		if (new Date().toString().split(" ")[4] === "00:00:00") {
			const d = new Date(),
				date = `${d.getMonth() + 1}-${d.getDate() - 1}-${d.getFullYear()}`,
				count = await mdb.collection("dailyjoins").findOne({ date }).then(res => res.count).catch(err => "Unknown");

			const embed: Eris.EmbedOptions = {
				title: `Daily Counts For ${date}`,
				description: `Servers Joined Today: ${count}`,
				timestamp: new Date().toISOString(),
				color: functions.randomColor()
			};

			console.log(`Daily joins for ${date}: ${count}`);

			return this.executeWebhook(config.webhooks.dailyjoins.id, config.webhooks.dailyjoins.token, {
				embeds: [
					embed
				],
				username: `Daily Joins${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png"
			});
		}
	}, 1e3);
}));