import { performance } from "perf_hooks";
import Logger from "./Logger";

interface Timer {
	[k: string]: {
		start: number;
		end: number;
	};
}

export default class Timers {
	timers: Timer[];
	log: boolean;
	constructor(log?: boolean) {
		this.timers = [];
		this.log = !!log;
	}

	start(label: string) {
		if (Object.keys(this.timers).includes(label)) throw new TypeError(`Timer with the label "${label}" has already been started.`);
		const t = this.timers[label] = {
			start: parseFloat(performance.now().toFixed(3)),
			end: null
		};
		return t.start;
	}

	end(label: string) {
		if (!Object.keys(this.timers).includes(label)) throw new TypeError(`Timer with the label "${label}" has not been started.`);
		if (this.timers[label].end !== null) throw new TypeError(`Timer with the label "${label}" has already ended.`);

		this.timers[label].end = parseFloat(performance.now().toFixed(3));
		if (this.log) Logger.debug("Timers", `${label} took ${this.calc(label, label)}ms`);
		return this.timers[label].end;
	}

	calc(start: string, end?: string) {
		if (!end) end = start;
		return typeof start === "number" && typeof end === "number" ?
			parseFloat(
				(end - start).toFixed(3)
			) : parseFloat(
				(
					(this.timers && this.timers[end] ? this.timers[end].end : 0)
					-
					(this.timers && this.timers[start] ? this.timers[start].start : 0)
				).toFixed(3)
			);
	}
}
