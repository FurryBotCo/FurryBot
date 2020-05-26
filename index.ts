process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as fs from "fs-extra";
import config from "./src/config";
import path from "path";
import Logger from "./src/util/LoggerV9";
[config.dir.logs, `${config.dir.logs}/spam`, `${config.dir.logs}/client`, config.dir.tmp].map(l => !fs.existsSync(path.resolve(l)) ? (fs.mkdirSync(path.resolve(l)), Logger.log("Setup | Logs", `Creating non existent directory "${l}" in ${path.resolve(`${l}/../`)}`)) : null);

import ListStats from "./src/util/ListStats";
import FurryBot from "./src/main";

const bot = new FurryBot(config.client.token, config.client.options);
if (!config.beta) setInterval(() => ListStats(bot, bot.shards.map(s => bot.guilds.filter(g => g.shard.id === s.id).length)), 9e5);

if (__filename.endsWith(".js") && !fs.existsSync(`${config.dir.base}/src/assets`)) {
	fs.copySync(`${config.dir.base}/src/assets`, `${config.dir.base}/build/src/assets`);
	bot.log("log", `Copied assets directory ${`${config.dir.base}/src/assets`} to ${config.dir.base}/build/src/assets`, "Setup | Assets");
}

fs.writeFileSync(`${__dirname}/${__filename.endsWith(".ts") ? "" : "../"}process.pid`, process.pid);

bot.connect();

export default bot;

process.on("SIGINT", () => {
	bot
		.removeAllListeners()
		.disconnect({ reconnect: false });
	process.kill(process.pid);
});
