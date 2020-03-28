import FurryBot from "../main";
import { EventEmitter } from "tsee";

export default class CooldownHandler<T extends string = string> extends EventEmitter<{
	[k in "add" | "remove"]: (value: string, type: T, time?: number, meta?: any) => void;
}> {
	entries: Map<T, Set<string>>;
	times: {
		type: string;
		value: string;
		created: number;
		time: number;
		timer: NodeJS.Timeout;
	}[];
	meta: {
		type: string;
		value: string;
		data: any;
	}[];
	constructor() {
		super();
		this.entries = new Map();
		this.times = [];
		this.meta = [];
	}

	add(value: string, type: T, time?: number, meta?: any) {
		if (!this.entries.has(type)) this.entries.set(type, new Set());
		if (!this.entries.get(type).has(value)) {
			this.entries.get(type).add(value);
			const e = [];
			if (typeof time === "number" && time !== 0) {
				this.times.push({
					type,
					value,
					created: Date.now(),
					time,
					timer: setTimeout(() => this.remove(value, type), time)
				});
				e.push(time);
			} else e.push(null);

			if (![undefined, null].includes(meta)) {
				this.meta.push({
					value,
					type,
					data: meta
				});
				e.push(meta);
			}

			this.emit("add", value, type, ...e);
		}
		return this;
	}

	remove(value: string, type: T) {
		if (!this.entries.has(type)) this.entries.set(type, new Set());
		if (this.entries.get(type).has(value)) {
			const j = this.times.find(t => t.value === value && t.type === type);
			const m = this.meta.find(t => t.value === value && t.type === type);
			const e = [];
			if (!!j) {
				clearTimeout(j.timer);
				e.push(j.time);
			} else e.push(null);
			e.push(!!m ? m.data : null);
			this.emit("remove", value, type, ...e);
			this.entries.get(type).delete(value);
		}
		return this;
	}

	clear(type: T) {
		// loop them with remove to make doing specific things easier
		if (this.entries.has(type)) Array.from(this.entries.get(type).values()).map(k => this.remove(k, type));
		return this;
	}

	check(value: string, type?: T, meta?: any): {
		found: boolean;
		time?: number;
	} {
		let found = false, time = 0;
		// check all
		if (!type) Array.from(this.entries.values()).map(s => s.has(value) ? found = true : null);
		// check one
		else {
			if (!this.entries.has(type)) found = false;
			else if (!this.entries.get(type).has(value)) found = false;
			else {
				if (![undefined, null].includes(meta)) {
					const m = this.meta.find(t => t.value === value && t.type === type);
					if (!m || Object.keys(meta).some(k => !m.data[k] || m.data[k] !== meta[k]) || Object.keys(m.data).some(k => !meta[k] || meta[k] !== m.data[k])) return {
						found: false,
						time: null
					};
				}
				found = true;
				const j = this.times.find(t => t.value === value && t.type === type);
				if (!!j) time = (j.created + j.time) - Date.now();
				else time = null;
			}
		}

		return {
			found,
			time
		};
	}
}
