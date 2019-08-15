import * as fs from "fs-extra";
import chalk, { Chalk } from "chalk";
import _getCallerFile from "./_getCallerFile";
import os from "os";
import config from "../config/config";
import path from "path";

class Logger {
	constructor() {

	}

	async log(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number): Promise<boolean> {
		return this._log("log", msg, shardId);
	}

	async warn(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number): Promise<boolean> {
		return this._log("warn", msg, shardId);
	}

	async error(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number): Promise<boolean> {
		return this._log("error", msg, shardId);
	}

	async info(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number): Promise<boolean> {
		return this._log("info", msg, shardId);
	}

	async debug(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number): Promise<boolean> {
		return this._log("debug", msg, shardId);
	}

	async command(msg: string | number | any[] | object | Buffer | Promise<any>, shardId?: number): Promise<boolean> {
		return this._log("info", msg, shardId);
	}

	async _log(type: "log" | "warn" | "error" | "info" | "debug", msg: string | number | [] | object | Buffer | Promise<any>, shardId?: number): Promise<boolean> {
		if (!process.stdout.writable) return false;
		if (typeof msg !== "string") {
			if (msg instanceof Promise) msg = await msg;
			// if (msg instanceof Array) msg = msg.join(" ");
			try {
				if (typeof msg === "object") msg = JSON.stringify(msg);
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
			process.stderr.write(`logs directory (${config.logsDir}) does not exist\n`);
			return false;
		}
		let c: Chalk;
		switch (type.toLowerCase()) {
			case "log":
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

		if (msg.toString().indexOf(config.bot.token)) msg = msg.toString().replace(new RegExp(config.bot.token, "g"), "[TOKEN]");
		const shard = typeof shardId === "number" ? `[Shard ${shardId}]` : "";
		fs.appendFileSync(`${config.logsDir}/client/${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}.log`, `[${d}][${type}]${typeof shardId === "number" ? `[Shard ${shardId}]` : ""}: ${msg}${os.EOL}`);
		process.stdout.write(`${chalk.grey(`[${chalk.blue(d)}][${c(type)}]${typeof shardId === "number" ? `[${chalk.magenta(`Shard ${shardId}`)}]` : ""}: ${c(msg.toString())}`)}\n`);
		return true;
	}
}

export default Logger;