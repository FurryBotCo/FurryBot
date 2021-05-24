#!/usr/bin/env ts-node
import "./util/first";
import config from "./config";
import Logger from "logger";

import { DEBUG, Master } from "clustering";
import { isMaster } from "cluster";
if (isMaster) {
	Logger.info(`Running in ${config.beta ? "BETA" : "PRODUCTION"} mode.`);
	Logger.info(`IPC debug is: ${DEBUG ? "ENABLED" : "DISABLED"}`);
}
const m = new Master({
	token: config.client.token,
	path: `${config.dir.codeSrc}/main.${config.ext}`,
	pid: config.dir.tmp,
	...config.options
});
void m.launch();

process
	.on("uncaughtException", (err) => Logger.error("Uncaught Exception", err))
	.on("unhandledRejection", (r, p) => Logger.error("Unhandled Rejection", r ?? p));
