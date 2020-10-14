export default class AverageUtil {
	maxEntries: number;
	round: "none" | "normal" | "floor" | "ceil";
	private entries: number[];
	constructor(maxEntries?: number, round?: AverageUtil["round"]) {
		this.maxEntries = maxEntries || 15;
		this.entries = [];
		this.round = round || "normal";
	}

	addEntry(e: number): [avg: number, total: number] {
		if (this.entries.length >= this.maxEntries) this.entries.shift();
		this.entries.push(e);
		return this.getAverage();
	}

	clearEntries(): [avg: number, total: number] {
		this.entries = [];
		return [0, 0];
	}

	getAverage(): [avg: number, total: number] {
		switch (this.entries.length) {
			case 0: return [0, 0];
			case 1: return [this.entries[0], 1];
			default: {
				let avg = this.entries.reduce((a, b) => a + b) / this.entries.length;
				switch (this.round) {
					case "none": break;
					case "normal": avg = Math.round(avg); break;
					case "ceil": avg = Math.ceil(avg); break;
					case "floor": avg = Math.floor(avg); break;
				}

				return [avg, this.entries.length];
			}
		}
	}

	getMax(): [max: number, total: number] {
		return [Math.max(...this.entries), this.entries.length];
	}

	getMin(): [min: number, total: number] {
		return [Math.min(...this.entries), this.entries.length];
	}
}
