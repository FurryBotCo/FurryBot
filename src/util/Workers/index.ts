import { Worker } from "worker_threads";
import FurryBot from "../../main";
import * as fs from "fs-extra";

export default class Workers {
	client: FurryBot;
	workers: {
		[k: string]: Worker;
	};
	constructor(client: FurryBot) {
		this.client = client;
	}

	setup() {
		fs
			.readdirSync(`${__dirname}`)
			.filter(f => !f.startsWith("index"))
			.map(f => this.workers[f.split(".")[0]] = new Worker(`${__dirname}/${f}`));
	}
}
