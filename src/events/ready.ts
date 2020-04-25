import ClientEvent from "../util/ClientEvent";
import Temp from "../util/Temp";
import { Logger } from "../util/LoggerV8";
import FurryBot from "../main";
import config from "../config";
import sv from "../api";
import express from "express";
import http from "http";
import { mdb, db } from "../modules/Database";
import cmd from "../commands";
import { Time, TimedTasks } from "../util/Functions";
import * as fs from "fs-extra";
import Eris from "eris";
import rClient from "../util/Redis";

export default new ClientEvent("ready", (async function (this: FurryBot) {
	rClient.INCR(`${config.beta ? "beta" : "prod"}:events:ready`);
	if (this.firstReady) return this.log("warn", "Skipping ready event as it has already fired.", "Ready");
	db.setClient(this);
	this.firstReady = true;
	const srv = await sv(this);

	this.editStatus("online", {
		name: `${config.defaults.prefix}help with some furries`,
		type: 0
	});

	const svr = http.createServer(express())
		.on("error", () => this.log("warn", "Attempted to start api server, but the port is in use.", "APIServer"))
		.on("listening", () => (svr.close(), this.srv = srv.listen(config.web.api.port, config.web.api.ip, () => this.log("debug", `Listening on ${config.web.api.ip}:${config.web.api.port}`, "APIServer"))))
		.on("close", () => this.log("debug", "Port test server closed, starting bot api server.", "APIServer"))
		.listen(config.web.api.port, config.web.api.ip);

	this.temp = new Temp(config.dir.tmp);

	process.on("beforeExit", this.temp.clean.bind(this.temp));

	this.spamCounter.interval = setInterval(() => {
		this.spamCounter.command = this.spamCounter.command.filter(s => s.time + 3e4 > Date.now());
		this.spamCounter.response = this.spamCounter.response.filter(s => s.time + 3e4 > Date.now());
	}, 1e3);


	this.log("log", `Client ready with ${this.users.size} users, in ${Object.keys(this.channelGuildMap).length} channels, of ${this.guilds.size} guilds, with ${this.cmd.commands.length} commands.`, `Ready`);

	cmd.map(c => this.cmd.addCategory(c));

	if (fs.existsSync(`${config.dir.base}/restart.json`)) {
		const t = Date.now();
		const r = JSON.parse(fs.readFileSync(`${config.dir.base}/restart.json`).toString());
		fs.unlinkSync(`${config.dir.base}/restart.json`);

		await this.getRESTChannel(r.channel).then((ch: Eris.GuildTextableChannel) => ch.createMessage(`<@!${r.user}>, restart took **${Time.ms(t - r.time, true)}**.`));
	}

	setInterval(TimedTasks.runAll.bind(TimedTasks, this), 1e3);
}));
