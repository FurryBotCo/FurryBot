import chalk from "chalk";
import util from "util";
import * as fs from "fs-extra";
import config from "../config";
import deasync from "deasync";

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

class LoggerV8 {
	constructor() { }

	get log() { return this._log("info"); }
	get logSync() { return this._logSync("info"); }
	get info() { return this._log("info"); }
	get infoSync() { return this._logSync("info"); }
	get warn() { return this._log("warn"); }
	get warnSync() { return this._logSync("warn"); }
	get error() { return this._log("error"); }
	get errorSync() { return this._logSync("error"); }
	get data() { return this._log("data"); }
	get dataSync() { return this._logSync("data"); }
	get debug() { return this._log("debug"); }
	get debugSync() { return this._logSync("debug"); }

	_log(type: string) {
		return (async (source: string, msg?: any): Promise<boolean> => {
			try {
				const dt = new Date();
				const d = ((d = new Date(), seconds = true, ms = false) => `${(d.getMonth() + 1).toString().padStart(2, "0")}-${(d.getDate()).toString().padStart(2, "0")}-${d.getFullYear()} ${seconds ? `${(d.getHours()).toString().padStart(2, "0")}:${(d.getMinutes()).toString().padStart(2, "0")}:${(d.getSeconds()).toString().padStart(2, "0")}` : ""}${ms ? `.${(d.getMilliseconds()).toString().padStart(3, "0")}` : ""}`)(dt, false);
				if (typeof msg === "undefined") {
					msg = source;
					source = "General";
				}
				let mn = msg;
				if (typeof msg !== "string") {
					if (msg instanceof Promise) msg = await msg;
					// if (msg instanceof Array) msg = msg.join(" ");
					try {
						if (typeof msg === "object") msg = util.inspect(msg, { depth: 3, colors: true });
					} catch (e) {
						// apparently some random error throws the Logger class into here,
						// throwing a circular error which then screws up more by being thrown above the logger
					}
					if (msg instanceof Buffer) msg = msg.toString();
					if (msg instanceof Function) msg = msg.toString();
				}

				if (typeof mn !== "string") {
					if (mn instanceof Promise) mn = await mn;
					// if (msg instanceof Array) msg = msg.join(" ");
					try {
						if (typeof mn === "object") mn = util.inspect(mn, { depth: 3, colors: false });
					} catch (e) {
						// apparently some random error throws the Logger class into here,
						// throwing a circular error which then screws up more by being thrown above the logger
					}
					if (mn instanceof Buffer) mn = mn.toString();
					if (mn instanceof Function) mn = mn.toString();
				}

				if (typeof msg.indexOf !== "undefined") {
					if (msg.indexOf(config.bot.client.token)) msg = msg.replace(config.bot.client.token, "[TOKEN]");
					if (msg.indexOf(config.universalKey)) msg = msg.replace(config.universalKey, "[KEY]");
				}

				// .replace(/[^\[\]\w\s:\(\)#\|\.,_-]/gmi, "")
				if (!fs.existsSync(`${config.dir.logs}/client/${d}.log`)) fs.writeFileSync(`${config.dir.logs}/client/${d}.log`, "");
				fs.appendFileSync(`${config.dir.logs}/client/${d}.log`, `[${dt.toTimeString().split(" ")[0]}][${type.toUpperCase()}] ${source} | ${mn}\n`);
				process.stdout.write(`${chalk.grey(`[${dt.toTimeString().split(" ")[0]}]`)} ${source} | ${chalk[colors[type]](msg)}\n`);
				return true;
			} catch (e) {
				console.error(e);
				return false;
			}
		});
	}

	_logSync(type: string): (source: string, msg?: any) => boolean {
		return deasync(this._log(type)).bind(this);
	}
}


const Logger = new LoggerV8(); // tslint:disable-line variable-name

export { LoggerV8 };
export { Logger };

export default Logger;
