import { ClientEvent, Permissions, eval as ev, Temp } from "bot-stuff";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";
import sv from "../../../api";
import express from "express";
import http from "http";
import { mdb, mongo } from "../../../modules/Database";
import * as fs from "fs-extra";
import CmdHandler from "../../../util/cmd";

export default new ClientEvent<FurryBot>("ready", (async function (this: FurryBot) {


	await this.a.track("ready", {
		clusterId: this.cluster.id,
		shardId: null,
		users: this.bot.users.size,
		channels: Object.keys(this.bot.channelGuildMap).length,
		guids: this.bot.guilds.size,
		timestamp: Date.now()
	});
	const srv = await sv(this);
	fs.readdirSync(`${__dirname}/../../../commands`).filter(d => !fs.lstatSync(`${__dirname}/../../../commands/${d}`).isDirectory() && d.endsWith(__filename.split(".").reverse()[0])).map(f => require(`${__dirname}/../../../commands/${f}`));
	CmdHandler.setClient(this);

	this.bot.editStatus("online", {
		name: `with furries.. | ${config.defaultPrefix}help`,
		type: 0
	});

	setInterval(() => {
		this.bot.editStatus("online", {
			name: `with furries.. | ${config.defaultPrefix}help`,
			type: 0
		});
	}, 6e4);

	// we only launch the api on the first cluster
	if (this.clusterId === 0) {
		const sv = http.createServer(express())
			.on("error", () => Logger.warn(`Cluster #${this.clusterId} | APIServer`, "Attempted to start api server, but the port is in use."))
			.on("listening", () => {
				sv.close();
				this.srv = srv.listen(config.apiPort, config.apiBindIp);
			})
			.on("close", () => Logger.debug(`Cluster #${this.clusterId} | APIServer`, "Port test server closed, starting bot api server."))
			.listen(config.apiPort, config.apiBindIp);
	}

	// we will have to rework list stats to work with clustering
	// if (!config.beta) this.ls = setInterval(ListStats, 3e5, this);

	this.Temp = new Temp(config.tmpDir);

	process.on("exit", this.Temp.clean.bind(this.Temp))
		.on("SIGINT", this.Temp.clean.bind(this.Temp))
		.on("SIGTERM", this.Temp.clean.bind(this.Temp));

	Logger.log(`Cluster #${this.cluster.id}`, `Client has started with ${this.bot.users.size} users, in ${Object.keys(this.bot.channelGuildMap).length} channels, of ${this.bot.guilds.size} guilds.`);

	// we aren't posting daily joins if we aren't on the main cluster
	if (!config.beta && this.cluster.id === 0) setInterval(async () => {
		if (new Date().toString().split(" ")[4] === "00:00:00") {

			let d = new Date();
			if (d.getDate() - 1 === 0) d = new Date(d.getTime() + 8.64e+7);
			const date = `${d.getMonth() + 1}-${d.getDate() - 1}-${d.getFullYear()}`;
			const count = await mdb.collection("dailyjoins").findOne({ date }).then(res => res.count).catch(err => "Unknown");
			const st = await this.cluster.getManagerStats();

			const embed: Eris.EmbedOptions = {
				title: `Daily Counts For ${date}`,
				description: `Servers Joined Today: ${count}\nTotal Servers: ${st.guildCount}`,
				timestamp: new Date().toISOString(),
				color: this.f.randomColor()
			};

			Logger.log(`Cluster #${this.cluster.id}`, `Daily joins for ${date}: ${count}`);

			return this.bot.executeWebhook(config.webhooks.dailyjoins.id, config.webhooks.dailyjoins.token, {
				embeds: [
					embed
				],
				username: `Daily Joins${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png"
			});
		}
	}, 1e3);

	this.spamCounterInterval = setInterval(() => {
		this.spamCounter = this.spamCounter.filter(s => s.time + 3e4 > Date.now());
		this.responseSpamCounter = this.responseSpamCounter.filter(s => s.time + 3e4 > Date.now());
	}, 1e3);
}));
