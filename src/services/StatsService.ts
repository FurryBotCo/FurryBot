import { Redis } from "../db";
import { BaseServiceWorker, BaseServiceWorkerSetup } from "eris-fleet";
import Logger from "logger";
import { colors } from "leeks.js";

export default class StatsService extends BaseServiceWorker {
	constructor(setup: BaseServiceWorkerSetup) {
		super(setup);
		this.serviceReady();
	}

	override async handleCommand(data: string | Array<string>) {
		if (!Array.isArray(data)) data = [data];
		// the middle color screws up the end color
		if (Redis === null) return Logger.warn("StatsService", `Skipping stats processing for [ ${colors.green(data.join(", "))} ${colors.yellow("] because Redis has not been initialized.")}`);
		const r = Redis.multi();
		for (const v of data) r.incr(v);
		void r.exec();
		return true;
	}

	override shutdown(done: () => void) {
		done();
	}
}
