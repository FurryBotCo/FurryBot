import * as fs from "fs-extra";
import util from "util";
import * as leeks from "leeks.js";
import config from "../config";
import Strings from "./Functions/Strings";
import Utility from "./Functions/Utility";
import Internal from "./Functions/Internal";

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

export default class Logger {
	private static COLORS = {
		time: leeks.colors.gray,
		log: leeks.colors.green,
		info: leeks.colors.green,
		error: leeks.colors.red,
		warn: leeks.colors.yellow,
		debug: leeks.colors.cyan,
		command: leeks.colors.green
	};

	static get log(): OmitFirstArg<typeof Logger["_log"]> {
		return this._log.bind(this, "log");
	}
	static get info(): OmitFirstArg<typeof Logger["_log"]> {
		return this._log.bind(this, "info");
	}
	static get error(): OmitFirstArg<typeof Logger["_log"]> {
		return this._log.bind(this, "error");
	}
	static get warn(): OmitFirstArg<typeof Logger["_log"]> {
		return this._log.bind(this, "warn");
	}
	static get debug(): OmitFirstArg<typeof Logger["_log"]> {
		return this._log.bind(this, "debug");
	}
	static get command(): OmitFirstArg<typeof Logger["_log"]> {
		return this._log.bind(this, "command");
	}

	private static _log(type: string, name: string | string[], message?: any) {
		const d = new Date();
		const time = d.toString().split(" ")[4];
		const date = `${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate()}-${d.getFullYear()}`;
		if (!name) throw new TypeError("Missing logger name.");
		if (!message) {
			message = name;
			name = "General";
		}
		if (typeof message !== "string") {
			if (message instanceof Buffer || typeof message === "function") message = message.toString();
			if (typeof message === "object") message = util.inspect(message, { depth: null, colors: true, showHidden: true });
		}

		try {
			message = message.replace(config.client.token, "[TOKEN]");
		} catch (e) { }

		if (!fs.existsSync(config.dir.logs.client)) fs.mkdirpSync(config.dir.logs.client);
		fs.appendFileSync(`${config.dir.logs.client}/${date}.log`, Internal.consoleSanitize(`[${time}] ${Strings.ucwords(type)} | ${name instanceof Array ? name.join(" | ") : name.toString()} | ${message}\n`));
		process.stdout.write(`[${Logger.COLORS.time(time)}] ${Logger.COLORS[type](Strings.ucwords(type))} | ${name instanceof Array ? name.map(n => Logger.COLORS[type](n)).join(" | ") : Logger.COLORS[type](name.toString())} | ${Logger.COLORS[type](message)}\n`);
	}
}
