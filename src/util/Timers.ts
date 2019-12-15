import { performance } from "perf_hooks";

export default class Timers {
	timers: {
		[k: string]: {
			start: number;
			end: number;
		};
	};
	constructor() {
		this.timers = {};
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

		return this.timers[label].end = parseFloat(performance.now().toFixed(3));
	}

	calc(start: string, end: string): number;
	calc(start: number, end: number): number;
	calc(start: string | number, end: string | number) { return typeof start === "number" && typeof end === "number" ? parseFloat((start - end).toFixed(3)) : parseFloat(((this.timers && this.timers[end] ? this.timers[end].end : 0) - (this.timers && this.timers[start] ? this.timers[start].start : 0)).toFixed(3)); }
}
