import { performance } from "perf_hooks";

export default class Timers {
	timers: {
		start: number;
		end: number;
		[k: string]: number;
	};
	constructor() {
		this.timers = {
			start: 0,
			end: 0
		};
	}

	start() { return this.time("start"); }
	end() { return this.time("end"); }
	time(label: string, log?: boolean) {
		const t = this.timers[label] = parseFloat(performance.now().toFixed(3));
		if (log) console.log(`start to ${label}: ${(t - (this.timers.start || 0)).toFixed(3)}ms`);
		return t;
	}

	calc(start: string, end: string): number;
	calc(start: number, end: number): number;
	calc(start: string | number, end: string | number) { return typeof start === "number" && typeof end === "number" ? (start - end) : (this.timers[end] || 0) - (this.timers[start] || 0); }
}
