process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import * as fs from "fs-extra";
import MakeFile from "./src/config/extra/lang/MakeFile";
import * as util from "util";

// regen lang before launch
fs.readdirSync(`${__dirname}/src/config/extra/lang`).filter(d => fs.lstatSync(`${__dirname}/src/config/extra/lang/${d}`).isDirectory()).map(d => {
	MakeFile(d);
});
import config from "./src/config";
import path from "path";

import Logger from "./src/util/LoggerV10";
[config.dir.logs, `${config.dir.logs}/spam`, `${config.dir.logs}/client`, config.dir.tmp].map(l => !fs.existsSync(path.resolve(l)) ? (fs.mkdirSync(path.resolve(l)), Logger.log("Setup | Logs", `Creating non existent directory "${l}" in ${path.resolve(`${l}/../`)}`)) : null);

// for faster loading after launch (and error checking)
import "./src/main";
import "./src/commands";

import ListStats from "./src/util/ListStats";
import Cluster from "cluster";
import { Fleet } from "eris-fleet";

const Admiral = new Fleet({
	...config.client.options,
	token: config.client.token,
	path: `${__dirname}/src/main.ts`
});

if (Cluster.isMaster) {
	Admiral
		.on("log", (m) => {
			if (m instanceof Error) m = m.stack;
			if (typeof m !== "string") m = util.inspect(m, { depth: null, colors: true, showHidden: true });
			Logger.log("Log", m);
		})
		.on("debug", (m) => {
			if (m instanceof Error) m = m.stack;
			if (typeof m !== "string") m = util.inspect(m, { depth: null, colors: true, showHidden: true });
			Logger.debug("Debug", m);
		})
		.on("warn", (m) => {
			if (m instanceof Error) m = m.stack;
			if (typeof m !== "string") m = util.inspect(m, { depth: null, colors: true, showHidden: true });
			Logger.warn("Warn", m);
		})
		.on("error", (m) => {
			if (m instanceof Error) m = m.stack;
			if (typeof m !== "string") m = util.inspect(m, { depth: null, colors: true, showHidden: true });
			Logger.error("Error", m);
		});

	if (!config.beta) setInterval(() => ListStats(Admiral), 9e5);

	if (__filename.endsWith(".js") && !fs.existsSync(`${config.dir.base}/src/assets`)) {
		fs.copySync(`${config.dir.base}/src/assets`, `${config.dir.base}/build/src/assets`);
		Logger.log("Setup | Assets", `Copied assets directory ${`${config.dir.base}/src/assets`} to ${config.dir.base}/build/src/assets`);
	}

	fs.writeFileSync(`${__dirname}/tmp/master.pid`, process.pid.toString());

	/*setInterval(() => {
		find("name", __dirname).then(v => console.log(v.filter(p => p.ppid = process.pid)));
	}, 6e4);*/
}

function exit() {
	if (fs.existsSync(`${__dirname}/tmp/master.pid`)) try { fs.unlinkSync(`${__dirname}/tmp/master.pid`); } catch (e) { }
	process.kill(process.pid);
}

process
	.on("exit", exit.bind(null))
	.on("SIGINT", exit.bind(null))
	.on("SIGUSR1", exit.bind(null))
	.on("SIGUSR2", exit.bind(null));
