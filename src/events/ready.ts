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

	const d = new Date();
	// zero out h, m, s, ms
	d.setHours(0, 0, 0, 0);
	void StatusHandler
		.init(this)
		.run(d);

	// @FIXME REMOVE THE SKIP IN PRODUCTION!
	void this.loadCommands(`${config.dir.codeSrc}/commands`, [
		/* "animals",
		// "developer",
		"fun",
		"images",
		"information",
		"meme",
		"misc",
		"moderation",
		"nsfw",
		"utility" */
	]);
});
