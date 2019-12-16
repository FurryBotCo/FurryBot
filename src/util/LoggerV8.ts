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

class LoggerV8 {
	constructor() { }

	get log() { return this._log("info"); }
	get info() { return this._log("info"); }
	get warn() { return this._log("warn"); }
	get error() { return this._log("error"); }
	get data() { return this._log("data"); }
	get debug() { return this._log("debug"); }

	_log(type: string) {
		return (async (source: string, msg?: any): Promise<boolean> => {
			const d = new Date();
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

			if (msg.indexOf(config.bot.token)) msg = msg.replace(config.bot.token, "[TOKEN]");
			if (msg.indexOf(config.universalKey)) msg = msg.replace(config.universalKey, "[KEY]");

			// .replace(/[^\[\]\w\s:\(\)#\|\.,_-]/gmi, "")
			fs.appendFileSync(`${config.logsDir}/client/${d.getMonth()}-${d.getDate()}-${d.getFullYear()}.log`, `[${d.toTimeString().split(" ")[0]}][${type.toUpperCase()}] ${source} | ${mn}\n`);
			process.stdout.write(`${chalk.grey(`[${d.toTimeString().split(" ")[0]}]`)} ${source} | ${chalk[colors[type]](msg)}\n`);
			return true;
		});
	}
}


const Logger = new LoggerV8(); // tslint:disable-line variable-name

export { LoggerV8 };
export { Logger };

export default Logger;
