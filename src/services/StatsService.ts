import { Redis } from "../db";
import { BaseServiceWorker, BaseServiceWorkerSetup } from "eris-fleet";

export default class StatsService extends BaseServiceWorker {
	constructor(setup: BaseServiceWorkerSetup) {
		super(setup);
		this.serviceReady();
	}

	async handleCommand(data: string | Array<string>) {
		if (!Array.isArray(data)) data = [data];
		const r = Redis.multi();
		for (const v of data) r.incr(v);
		void r.exec();
		return true;
	}

	shutdown(done: () => void) {
		done();
	}
}
