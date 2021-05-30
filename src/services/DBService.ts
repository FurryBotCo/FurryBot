import { Redis } from "../db";
import Logger from "logger";
import { colors } from "leeks.js";
import { BaseService, ServiceInitalizer } from "clustering";

type DBCommand = never;

export default class DBService extends BaseService {
	constructor(setup: ServiceInitalizer) {
		super(setup);
		this.ready();
	}

	async handleCommand(data: string | Array<string>) {
		if (!Array.isArray(data)) data = [data];
		// the middle color screws up the end color
		if (Redis === null) return Logger.warn("StatsService", `Skipping stats processing for [ ${colors.green(data.join(", "))} ${colors.yellow("] because Redis has not been initialized.")}`);
		const r = Redis.multi();
		for (const v of data) r.incr(v);
		void r.exec();
		return true;
	}

	shutdown(done: () => void) {
		done();
	}
}
