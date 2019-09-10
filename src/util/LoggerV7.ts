import * as fs from "fs-extra";
import chalk, { Chalk } from "chalk";
import _getCallerFile from "./_getCallerFile";
import os from "os";
import config from "../config";
import path from "path";
import util from "util";
// import client from "../../index";

class Logger {
	constructor() {

	}

	async log(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> {
		return this._log("log", msg, shardId, extra);
	}

	async warn(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> {
		return this._log("warn", msg, shardId, extra);
	}

	async error(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> {
		return this._log("error", msg, shardId);
	}

	async info(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> {
		return this._log("info", msg, shardId, extra);
	}

	async debug(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> {
		return this._log("debug", msg, shardId, extra);
	}

	async command(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> {
		return this._log("command", msg, shardId, extra);
	}

	async _log(type: "log" | "warn" | "error" | "info" | "debug" | "command", msg: string | number | [] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> {
		if (!process.stdout.writable) return false;
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
		const date = new Date();
		const d = date.toString().split(" ")[4];
		if (!fs.existsSync(config.logsDir)) {
			if (process.stderr.writable) process.stderr.write(`logs directory (${config.logsDir}) does not exist\n`);
			return false;
		}
		let c: Chalk;
		switch (type.toLowerCase()) {
			case "log":
			case "command":
				c = chalk.green;
				break;

			case "warn":
				c = chalk.yellow;
				break;

			case "error":
				c = chalk.red;
				break;

			case "info":
				c = chalk.green;
				break;

			case "debug":
				c = chalk.cyan;
				break;
		}
		if (typeof msg === "undefined") msg = "undefined";

		if (msg.toString().indexOf(config.bot.token)) msg = msg.toString().replace(new RegExp(config.bot.token, "g"), "[BOT TOKEN]");
		if (msg.toString().indexOf(config.universalKey)) msg = msg.toString().replace(new RegExp(config.universalKey, "g"), "[UNIVERSAL KEY]");

		/*client.io.emit("log", {
			type,
			d,
			shard: typeof shardId === "number" ? shardId : 0,
			msg
		});*/

		let e;
		if (extra && extra !== null && (typeof extra === "string" || (extra instanceof Array && extra.length > 0))) {
			if (typeof extra === "string") e = `[${extra}]`;
			else if (extra instanceof Array) e = extra.map(e => `[${e}]`).join("");
			else e = "";
		} else e = "";
		fs.appendFileSync(`${config.logsDir}/client/${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}.log`, `[${d}][${type.toUpperCase()}]${typeof shardId === "number" ? `[Shard ${shardId}]` : ""}${e.replace(new RegExp("[\\u001b\|\u001b][[0-9]{1,3}m", "g"), "")}: ${msg}${os.EOL}`);
		process.stdout.write(`${chalk.grey(`[${chalk.blue(d)}][${c(type.toUpperCase())}]${typeof shardId === "number" ? `[${chalk.magenta(`Shard ${shardId}`)}]` : ""}${e}: ${c(msg.toString())}`)}\n`);
		return true;
	}
}

export default Logger;