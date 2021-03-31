import FurryBot from "../main";
import config from "../config";
import StatusHandler from "../util/handler/StatusHandler";
import { ClientEvent } from "core";
import { pid } from "utilities";
import * as fs from "fs-extra";

export default new ClientEvent<FurryBot>("ready", async function() {
	if (this.firstReady === true) return;
	this.firstReady = true;
	fs.mkdirpSync(`${config.dir.tmp}/pid`);
	pid(`${config.dir.tmp}/pid/cluster-${this.clusterId}.pid`);

	void StatusHandler
		.init(this)
		.run(new Date(2021, 0, 1));

	void this.loadCommands();
});
