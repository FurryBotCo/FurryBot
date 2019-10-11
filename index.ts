import config from "./src/config";
import * as fs from "fs-extra";
import path from "path";
import { Main, Logger, MainStats } from "@donovan_dmc/ws-clusters";
import yargs from "yargs";
import ListStats from "./src/util/ListStats";
// directory existence check
[config.logsDir, `${config.logsDir}/spam`, `${config.logsDir}/client`, config.tmpDir].map(l => !fs.existsSync(path.resolve(l)) ? (fs.mkdirSync(path.resolve(l)), Logger.log("General", `Creating non existent directory "${l}" in ${path.resolve(`${l}/../`)}`)) : null);

if (__filename.endsWith(".js") && !fs.existsSync(`${__dirname}/src/assets`)) {
	fs.copy(path.resolve(`${__dirname}/../src/assets`), `${__dirname}/src/assets`);
	Logger.log("General", `Copied assets directory ${path.resolve(`${__dirname}/../src/assets`)} to ${__dirname}/src/assets`);
}

const main = new Main(config.bot.token, `${__dirname}/src/main.js`, config.bot.options);
main.init();

main.on("stats", (st: MainStats) => {
	if (config.beta) return;
	if (!main.ready) Logger.warn("Main", `Skipped stats as main instance is not ready.`);

	ListStats(st.shards.map(s => s.guildCount));
});

fs.writeFileSync(`${config.rootDir}/../process.pid`, process.pid);
export default main;
