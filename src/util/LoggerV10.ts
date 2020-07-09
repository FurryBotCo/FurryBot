import chalk from "chalk";
import util from "util";
import * as fs from "fs-extra";
import config from "../config";

const colors = {
	log: "grey",
	verbose: "cyan",
	prompt: "grey",
	info: "green",
	data: "grey",
	help: "cyan",
	warn: "yellow",
	debug: "cyan",
	error: "red"
};

class Logger {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static get log() { return this._log("info"); }
	static get info() { return this._log("info"); }
	static get warn() { return this._log("warn"); }
	static get error() { return this._log("error"); }
	static get data() { return this._log("data"); }
	static get debug() { return this._log("debug"); }

	static _log(type: string) {
		return (async (source: string, msg?: any): Promise<boolean> => {
			if (msg instanceof Error) msg = msg.stack;

			if (typeof msg === "undefined") {
				msg = source;
				source = "General";
			}
			if (typeof msg !== "string") {
				if (msg instanceof Promise) msg = await msg;
				// if (msg instanceof Array) msg = msg.join(" ");
				try {
					if (typeof msg === "object") msg = util.inspect(msg, { depth: 3, colors: true });
				} catch (e) {
					try {
						msg = JSON.stringify(msg);
					} catch (e) { }
					// apparently some random error throws the Logger class into here,
					// throwing a circular error which then screws up more by being thrown above the logger
					// so we just add a catch here and do less parsing on it with another catch
				}
				if (msg instanceof Buffer) msg = msg.toString();
				if (msg instanceof Function) msg = msg.toString();
			}

			if (typeof msg.indexOf !== "undefined") {
				if (msg.indexOf(config.client.token)) msg = msg.replace(config.client.token, "[TOKEN]");
				if (msg.indexOf(config.universalKey)) msg = msg.replace(config.universalKey, "[KEY]");
			}

			if (typeof process.send !== "undefined") {
				if (!["log", "warn", "error", "debug"].includes(type)) type = "log";
				process.send({
					op: type,
					msg: `${source} | ${msg}`
				});
				return true;
			}
			try {
				const dt = new Date();
				const d = ((d = new Date(), seconds = true, ms = false) => `${(d.getMonth() + 1).toString().padStart(2, "0")}-${(d.getDate()).toString().padStart(2, "0")}-${d.getFullYear()}${seconds ? `${(d.getHours()).toString().padStart(2, "0")}:${(d.getMinutes()).toString().padStart(2, "0")}:${(d.getSeconds()).toString().padStart(2, "0")}` : ""}${ms ? `.${(d.getMilliseconds()).toString().padStart(3, "0")}` : ""}`)(dt, false);

				// .replace(/[^\[\]\w\s:\(\)#\|\.,_-]/gmi, "")
				if (!fs.existsSync(`${config.dir.logs}/client`)) {
					fs.mkdirpSync(`${config.dir.logs}/client`);
					this.log("Setup | Logs", `Creating non existent directory "${config.dir.logs}/client" in ${config.dir.logs}`);
				}
				if (!fs.existsSync(`${config.dir.logs}/client/${d}.log`)) fs.writeFileSync(`${config.dir.logs}/client/${d}.log`, "");
				fs.appendFileSync(`${config.dir.logs}/client/${d}.log`, `[${dt.toTimeString().split(" ")[0]}][${type.toUpperCase()}] ${source} | ${msg}\n`);
				process.stdout.write(`${chalk.grey(`[${dt.toTimeString().split(" ")[0]}]`)} ${source} | ${chalk[colors[type]](msg)}\n`);
				return true;
			} catch (e) {
				console.error(e);
				return false;
			}
		});
	}
}

export default Logger;
