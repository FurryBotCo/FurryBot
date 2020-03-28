import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import config from "../config";
import chalk from "chalk";

export default new ClientEvent("debug", (async function (this: FurryBot, info: string, id: number) {

	if (typeof config !== "undefined" && config.debug === true) {
		// too many for this
		if (["Duplicate presence update"].some(t => info.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return;

		if (new RegExp("Reset [0-9]{5,15} \\([0-9]{1,10}ms left\\)", "i").test(info.toLowerCase())) {
			const code = Number(info.match("([0-9]{1,3})\: [0-9]{1,10}ms")[1]);
			const color = code <= 399 ? chalk.green : code <= 499 ? chalk.blue : code <= 599 ? chalk.red : (t) => t;
			return [undefined, null].includes(id) ? Logger.debug(`Debug | Request[${color(code)}]`, info) : Logger.debug(`Debug | Request[${color(code)}] | Shard #${id}`, info);
		}
		if (Logger !== undefined) return [undefined, null].includes(id) ? Logger.debug("Debug", info) : Logger.debug(`Debug | Shard #${id}`, info);
		else return console.debug(info);
	}
}));
