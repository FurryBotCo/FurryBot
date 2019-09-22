import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";
import srv from "../../../api";
import express from "express";
import http from "http";
import ListStats from "../../../util/ListStats";
import Temp from "../../../util/Temp";
import functions from "../../../util/functions";
import { mdb, mongo } from "../../../modules/Database";
import WebSocket from "ws";
import ev from "../../../util/eval";
import phin from "phin";
import Permissions from "../../../util/Permissions";
import * as fs from "fs-extra";
import os from "os";
import util from "util";
import { performance } from "perf_hooks";

export default new ClientEvent("ready", (async function (this: FurryBot) {

	/* await this.track("clientEvent", "events.ready", {
		hostname: this.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientID,
		userCount: this.users.size,
		channelCount: Object.keys(this.channelGuildMap).length,
		guildCount: this.guilds.size
	}, new Date()); */

	fs.readdirSync(`${__dirname}/../../../commands`).filter(d => !fs.lstatSync(`${__dirname}/../../../commands/${d}`).isDirectory() && d.endsWith(__filename.split(".").reverse()[0])).map(f => require(`${__dirname}/../../../commands/${f}`));


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

	this.wss = new WebSocket.Server({ server: srv });

	// we only launch the api on the first cluster
	if (this.cluster.id === 0) {
		const sv = http.createServer(express())
			.on("error", () => this.logger.warn(`Cluster #${this.cluster.id} | APIServer`, "Attempted to start api server, but the port is in use."))
			.on("listening", () => {
				sv.close();
				this.srv = srv.listen(config.apiPort, config.apiBindIp);
			})
			.on("close", () => this.logger.debug(`Cluster #${this.cluster.id} | APIServer`, "Port test server closed, starting bot api server."))
			.listen(config.apiPort, config.apiBindIp);
	}

	// we will have to rework list stats to work with clustering
	// if (!config.beta) this.ls = setInterval(ListStats, 3e5, this);

	this.Temp = new Temp(config.tmpDir);

	process.on("exit", this.Temp.clean)
		.on("SIGINT", this.Temp.clean)
		.on("SIGTERM", this.Temp.clean);

	this.logger.log(`Cluster #${this.cluster.id}`, `Client has started with ${this.users.size} users, in ${Object.keys(this.channelGuildMap).length} channels, of ${this.guilds.size} guilds.`);

	// we aren't posting daily joins if we aren't on the main cluster
	if (!config.beta && this.cluster.id === 0) setInterval(async () => {
		if (new Date().toString().split(" ")[4] === "00:00:00") {

			let d = new Date();
			if (d.getDate() - 1 === 0) d = new Date(d.getTime() + 8.64e+7);
			const date = `${d.getMonth() + 1}-${d.getDate() - 1}-${d.getFullYear()}`;
			const count = await mdb.collection("dailyjoins").findOne({ date }).then(res => res.count).catch(err => "Unknown");

			/* await this.track("general", "dailyCountPosting", {
				hostname: this.f.os.hostname(),
				beta: config.beta,
				clientId: config.bot.clientID,
				date,
				count
			}, d); */

			const embed: Eris.EmbedOptions = {
				title: `Daily Counts For ${date}`,
				description: `Servers Joined Today: ${count}\nTotal Servers: ${this.guilds.size}`,
				timestamp: new Date().toISOString(),
				color: this.f.randomColor()
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

	this.spamCounterInterval = setInterval(() => {
		this.spamCounter = this.spamCounter.filter(s => s.time + 3e4 > Date.now());
		this.responseSpamCounter = this.responseSpamCounter.filter(s => s.time + 3e4 > Date.now());
	}, 1e3);

	this.wss.on("connection", async (socket, request) => {
		this.logger.debug("IO", `IO Connection From ${request.socket.remoteAddress}`);

		socket.once("close", () => {
			this.logger.debug("IO", `IO Disconnect From ${request.socket.remoteAddress}`);
		});

		if (!request.url || request.url.indexOf("?") === -1) return socket.close(1000, "Invalid Authentication");
		const k = request.url.split("?")[1].split("&").map(t => t.split("="));

		const j = k.filter(t => t[0] === "key")[0];
		if (!j || j[1] !== config.universalKey) return socket.close(1000, "Invalid Authentication");

		socket.on("message", async (d) => {
			d = d.toString();
			let j;
			try {
				j = JSON.parse(d);
			} catch (e) {
				return socket.send(JSON.stringify({
					event: "error",
					data: "all payloads must be in the json format"
				}));
			}

			if (!j.event || !j.data) return socket.send(JSON.stringify({
				event: "error",
				data: "missing 'event' or 'data' property"
			}));

			switch (j.event.toLowerCase()) {
				case "eval":
					console.debug("IO", `IO Eval: ${j.data}`);
					const start = performance.now();
					let res;
					let error = false;
					try {
						// an external functions is used because typescript screws with the context and the variables
						res = await ev.call(this, j.data, {
							config,
							phin,
							functions,
							util,
							fs,
							mdb,
							mongo,
							Permissions,
							os
						}).catch(err => err);
					} catch (e) {
						res = e;
						error = true;
					}
					if (res instanceof Error) error = true;

					res = util.inspect(res, { depth: 1, colors: false });
					const end = performance.now();

					if (res.indexOf(config.bot.token) !== -1) res = res.replace(new RegExp(config.bot.token, "g"), "[BOT TOKEN]");
					if (res.indexOf(config.universalKey) !== -1) res = res.replace(new RegExp(config.universalKey, "g"), "[UNIVERSAL KEY]");


					socket.send(JSON.stringify({
						event: "response",
						data: {
							eval: j.data,
							res,
							error,
							time: {
								start: parseFloat(start.toFixed(3)),
								end: parseFloat(end.toFixed(3)),
								total: parseFloat((end - start).toFixed(3))
							}
						}
					}));
					break;

				default:
					return socket.send(JSON.stringify({
						event: "error",
						data: "invalid event"
					}));
			}
		});
	});

	/*this.io.use(async (s, next) => {

	this.logger.debug(`IO Connection From ${s.conn.remoteAddress}`, 0);
	s.once("disconnect", async () => {

		this.logger.debug(`IO Disconnect From ${s.conn.remoteAddress}`, 0);
	});
	if (s.handshake.query && s.handshake.query.key) {
		if (s.handshake.query.key !== config.universalKey) return s.disconnect();
		else next();
	} else return s.disconnect();
})
	.on("connection", async (s) => {

		s.on("eval", async (d) => {

			console.debug(`IO Eval: ${d}`);
			const start = performance.now();
			let res;
			let error = false;
			try {
				// an external functions is used because typescript screws with the context and the variables
				res = await ev.call(this, d, {
					config,
					phin,
					functions,
					util,
					fs,
					mdb,
					mongo,
					Permissions,
					os
				}).catch(err => err);
			} catch (e) {
				res = e;
				error = true;
			}
			if (res instanceof Error) error = true;

			res = util.inspect(res, { depth: 1, colors: false });
			const end = performance.now();

			if (res.indexOf(config.bot.token) !== -1) res = res.replace(new RegExp(config.bot.token, "g"), "[BOT TOKEN]");
			if (res.indexOf(config.universalKey) !== -1) res = res.replace(new RegExp(config.universalKey, "g"), "[UNIVERSAL KEY]");


	s.emit("response", {
		eval: d,
		res,
		error,
		time: {
			start: parseFloat(start.toFixed(3)),
			end: parseFloat(end.toFixed(3)),
			total: parseFloat((end - start).toFixed(3))
		}
	});
});
	});*/
}));