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
import { Internal, Time, TimedTasks } from "../util/Functions";
import * as fs from "fs-extra";
import Eris from "eris";

export default new ClientEvent("ready", (async function (this: FurryBot) {
	if (this.firstReady) return Logger.warn("Ready", "Skipping ready event as it has already fired.");
	this.firstReady = true;

	const srv = await sv(this);

	this.editStatus("online", {
		name: `${config.defaults.prefix}help with some furries`,
		type: 0
	});

	this.w.get("shard").execute({
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
		.on("error", () => Logger.warn("APIServer", "Attempted to start api server, but the port is in use."))
		.on("listening", () => (svr.close(), this.srv = srv.listen(config.web.api.port, config.web.api.ip, () => Logger.debug("APIServer", `Listening on ${config.web.api.ip}:${config.web.api.port}`))))
		.on("close", () => Logger.debug("APIServer", "Port test server closed, starting bot api server."))
		.listen(config.web.api.port, config.web.api.ip);

	this.temp = new Temp(config.dir.tmp);

	process.on("beforeExit", this.temp.clean.bind(this.temp));

	this.spamCounter.interval = setInterval(() => {
		this.spamCounter.command = this.spamCounter.command.filter(s => s.time + 3e4 > Date.now());
		this.spamCounter.response = this.spamCounter.response.filter(s => s.time + 3e4 > Date.now());
	}, 1e3);

	cmd.map(c => this.cmd.addCategory(c));

	Logger.log("Ready", `Client ready with ${this.users.size} users, in ${Object.keys(this.channelGuildMap).length} channels, of ${this.guilds.size} guilds, with ${this.cmd.commands.length} commands.`);

	if (fs.existsSync(`${config.dir.base}/restart.json`)) {
		const t = Date.now();
		const r = JSON.parse(fs.readFileSync(`${config.dir.base}/restart.json`).toString());
		fs.unlinkSync(`${config.dir.base}/restart.json`);

		await this.getRESTChannel(r.channel).then((ch: Eris.GuildTextableChannel) => ch.createMessage(`<@!${r.user}>, restart took **${Time.ms(t - r.time, true)}**.`));
	}

	setInterval(TimedTasks.runAll.bind(TimedTasks, this), 1e3);
}));
