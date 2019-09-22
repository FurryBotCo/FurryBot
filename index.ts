import FurryBot from "./src/main";
import config from "./src/config";
import * as fs from "fs-extra";
import functions from "./src/util/functions";
import path from "path";
import { ClusterManager } from "@donovan_dmc/eris-clusters";

// directory existence check
[config.logsDir, `${config.logsDir}/spam`, `${config.logsDir}/client`, config.tmpDir].map(l => !fs.existsSync(path.resolve(l)) ? (fs.mkdirSync(path.resolve(l)), console.log(`Creating non existent directory "${l}" in ${path.resolve(`${l}/../`)}`)) : null);

if (__filename.endsWith(".js") && !fs.existsSync(`${__dirname}/src/assets`)) {
	fs.copy(path.resolve(`${__dirname}/../src/assets`), `${__dirname}/src/assets`);
	console.log(`Copied assets directory ${path.resolve(`${__dirname}/../src/assets`)} to ${__dirname}/src/assets`);
}

const manager = new ClusterManager(config.bot.token, FurryBot, config.bot.options);
manager.init();

/*process.on("message",
	(m) =>
		require("@donovan_dmc/eris-clusters").Logger.log("Process Message (Worker)", m)
);
require("cluster").on("message",
	(w, m) =>
		require("@donovan_dmc/eris-clusters").Logger.log("Process Message (Master)", m)
);*/

process.on("SIGINT", () => {
	process.kill(process.pid);
});

export default manager;