import ClientEvent from "@modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "@config";
import srv from "@src/api";
import express from "express";
import http from "http";
import ListStats from "@util/ListStats";
import Temp from "@util/Temp";

export default new ClientEvent("ready", (async function (this: FurryBot) {

	this.editStatus("online", {
		name: `with furries.. | ${config.defaultPrefix}help`,
		type: 0
	});

	const client = this;

	const sv = http.createServer(express())
		.on("error", () => this.logger.warn("Attempted to start api server, but the port is in use."))
		.on("listening", () => {
			sv.close();
			client.srv = srv.listen(config.apiPort);
		})
		.on("close", () => this.logger.debug("Port test server closed, starting bot api server."))
		.listen(config.apiPort);

	if (!config.beta) this.ls = setInterval(ListStats, 3e5, this);

	this.Temp = new Temp(`${__dirname}/tmp`);

	process.on("exit", this.Temp.clean)
		.on("SIGINT", this.Temp.clean)
		.on("SIGTERM", this.Temp.clean);

	this.logger.log(`Client has started with ${this.users.size} users, in ${Object.keys(this.channelGuildMap).length} channels, of ${this.guilds.size} guilds.`);

	// redo daily counts posting sometime
}));