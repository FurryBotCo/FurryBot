import ClientEvent from "../util/ClientEvent";
import Temp from "../util/Temp";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
// import sv from "../api";
import express from "express";
import http from "http";
import { mdb, mongo } from "../modules/Database";
import * as fs from "fs-extra";

export default new ClientEvent("ready", (async function (this: FurryBot) {
	this.increment([
		"events.ready"
	]);
	// const srv = await sv(this);

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

	// we only launch the api on the first cluster
	/*if (this.clusterId === 0) {
		const sv = http.createServer(express())
			.on("error", () => (Logger.warn(`Cluster #${this.clusterId} | APIServer`, "Attempted to start api server, but the port is in use."), this.increment("other.apiServerLaunchFailed")))
			.on("listening", () => (sv.close(), this.srv = srv.listen(config.apiPort, config.apiBindIp), this.increment("other.apiServerLaunch")))
			.on("close", () => Logger.debug(`Cluster #${this.clusterId} | APIServer`, "Port test server closed, starting bot api server."))
			.listen(config.apiPort, config.apiBindIp);
	}*/

	this.temp = new Temp(config.tmpDir);

	process
		.on("exit", this.temp.clean.bind(this.temp))
		.on("SIGINT", this.temp.clean.bind(this.temp))
		.on("SIGTERM", this.temp.clean.bind(this.temp));

	Logger.log("Ready", `Client ready with ${this.users.size} users, in ${Object.keys(this.channelGuildMap).length} channels, of ${this.guilds.size} guilds.`);


	this.spamCounterInterval = setInterval(() => {
		this.spamCounter = this.spamCounter.filter(s => s.time + 3e4 > Date.now());
		this.responseSpamCounter = this.responseSpamCounter.filter(s => s.time + 3e4 > Date.now());
	}, 1e3);
}));
