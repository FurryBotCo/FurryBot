import config from "./src/config";
import * as fs from "fs-extra";
import path from "path";
import { ClusterManager, ManagerStats, Logger } from "clustersv2";
import yargs from "yargs";
import ListStats from "./src/util/ListStats";
// directory existence check
[config.logsDir, `${config.logsDir}/spam`, `${config.logsDir}/client`, config.tmpDir].map(l => !fs.existsSync(path.resolve(l)) ? (fs.mkdirSync(path.resolve(l)), Logger.log("General", `Creating non existent directory "${l}" in ${path.resolve(`${l}/../`)}`)) : null);

if (__filename.endsWith(".js") && !fs.existsSync(`${__dirname}/src/assets`)) {
	fs.copy(path.resolve(`${__dirname}/../src/assets`), `${__dirname}/src/assets`);
	Logger.log("General", `Copied assets directory ${path.resolve(`${__dirname}/../src/assets`)} to ${__dirname}/src/assets`);
}

const manager = new ClusterManager(config.bot.token, `${__dirname}/src/main.js`, config.bot.options);
manager.launch();

manager.on("stats", (st: ManagerStats) => { });

if (!config.beta) setInterval(() => ListStats(manager.stats.shards.map(s => s.guildCount)), 9e5);

fs.writeFileSync(`${config.rootDir}/../process.pid`, process.pid);
export default manager;
