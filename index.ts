import config from "./src/config";
import * as fs from "fs-extra";
import path from "path";
import { Logger } from "./src/util/LoggerV8";
import ListStats from "./src/util/ListStats";
import FurryBot from "./src/main";

// directory existence check
[config.logsDir, `${config.logsDir}/spam`, `${config.logsDir}/client`, config.tmpDir].map(l => !fs.existsSync(path.resolve(l)) ? (fs.mkdirSync(path.resolve(l)), Logger.log("General", `Creating non existent directory "${l}" in ${path.resolve(`${l}/../`)}`)) : null);

if (__filename.endsWith(".js") && !fs.existsSync(`${__dirname}/src/assets`)) {
	fs.copy(path.resolve(`${__dirname}/../src/assets`), `${__dirname}/src/assets`);
	Logger.log("General", `Copied assets directory ${path.resolve(`${__dirname}/../src/assets`)} to ${__dirname}/src/assets`);
}

const bot = new FurryBot(config.bot.token, config.bot.clientOptions);
if (!config.beta) setInterval(() => ListStats(bot.shards.map(s => bot.guilds.filter(g => g.shard.id === s.id).length)), 9e5);

fs.writeFileSync(`${__dirname}/${__filename.endsWith(".ts") ? "" : "../"}process.pid`, process.pid);

bot.connect();

export default bot;

process.on("SIGINT", () => {
	bot
		.removeAllListeners()
		.disconnect({ reconnect: false });
	process.kill(process.pid);
});
