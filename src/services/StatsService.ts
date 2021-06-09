import db from "../db";
import Logger from "logger";
import { colors } from "leeks.js";
import { BaseService, ServiceInitalizer } from "clustering";

export default class StatsService extends BaseService {
	constructor(setup: ServiceInitalizer) {
		super(setup);
		void db.init(false, true).then(() => this.done());
	}

	async handleCommand(data: string | Array<string>) {
		if (!Array.isArray(data)) data = [data];
		// the middle color screws up the end color
		if (!db.r) return Logger.warn("StatsService", `Skipping stats processing for [ ${colors.green(data.join(", "))} ${colors.yellow("] because Redis has not been initialized.")}`);
		const r = db.r.multi();
		for (const v of data) r.incr(v);
		void r.exec();
		return true;
	}

	shutdown(done: () => void) {
		done();
	}
}
