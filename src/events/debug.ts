import ClientEvent from "../util/ClientEvent";
import Logger from "../util/LoggerV9";
import FurryBot from "../main";
import config from "../config";
import chalk from "chalk";

export default new ClientEvent("debug", (async function (this: FurryBot, info: string, id: number) {
	await this.track("events", "debug");
	if (typeof config !== "undefined" && config.debug === true) {
		// too many for this
		if (["duplicate presence update"].some(t => info.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return;

		if (new RegExp("Reset [0-9]{5,15} \\([0-9]{1,10}ms left\\)", "i").test(info.toLowerCase())) {
			const code = Number(info.match("([0-9]{1,3})\: [0-9]{1,10}ms")[1]);
			const color = code <= 399 ? chalk.green : code <= 499 ? chalk.blue : code <= 599 ? chalk.red : (t) => t;
			return [undefined, null].includes(id) ? this.log("debug", info, `Debug | Request[${color(code)}]`) : this.log("debug", info, `Shard #${id} | Debug | Request[${color(code)}]`);
		}
		if (Logger !== undefined) return [undefined, null].includes(id) ? this.log("debug", info, `Debug`) : this.log("debug", info, `Shard #${id} | Debug`);
		else return console.debug(info);
	}
}));
