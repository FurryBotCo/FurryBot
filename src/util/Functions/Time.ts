import { Time as T } from "./TypeDefs";

export default class Time {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * convert seconds to hours
	 * @static
	 * @param {number} sec - seconds
	 * @returns
	 * @memberof Time
	 */
	static secondsToHours(sec: number) {
		let hours: string | number = Math.floor(sec / 3600);
		let minutes: string | number = Math.floor((sec - (hours * 3600)) / 60);
		let seconds: string | number = Math.floor(sec - (hours * 3600) - (minutes * 60));

		if (hours < 10) hours = `0${hours}`;
		if (minutes < 10) minutes = `0${minutes}`;
		if (seconds < 10) seconds = `0${seconds}`;
		return `${hours}:${minutes}:${seconds}`;
	}

	/**
	 * convert a date or epoch into a readable string
	 * @static
	 * @param {(Date | number)} date - date/timestamp
	 * @returns {string}
	 * @memberof Time
	 */
	static toReadableDate(date: Date | number) {
		if (!(date instanceof Date) && typeof date !== "number") throw new TypeError("Must provide either a valid Date object, or a number timestamp.");
		const a = new Date(date).toISOString().replace("Z", "").split("T");
		return `${a[0]} ${a[1].split(".")[0]} UTC`;
	}

	/**
	 * Conver milliseconds into readable time
	 * @static
	 * @param {number} time
	 * @param {boolean} [words]
	 * @returns {(Promise<string | T.MsResponse>)}
	 * @memberof Time
	 */
	static ms(time: number, words: true): string;
	static ms(time: number, words: false): T.MsResponse;
	static ms(time: number, words = false): string | T.MsResponse {
		if (time === 0) return words ? "0 seconds" : "0s";
		const r = {
			s: 0,
			m: 0,
			h: 0,
			d: 0,
			w: 0,
			mn: 0,
			y: 0
		};

		while (time >= 1e3) { r.s++; time -= 1e3; }
		while (r.s >= 60) { r.m++; r.s -= 60; }
		while (r.m >= 60) { r.h++; r.m -= 60; }
		while (r.h >= 24) { r.d++; r.h -= 24; }
		while (r.d >= 7) { r.w++; r.d -= 7; }
		while (r.w >= 4) { r.mn++; r.w -= 4; }
		while (r.mn >= 12) { r.y++; r.mn -= 12; }
		if (time > 0) r.s += time / 1000;

		const str = [];
		if (r.s > 0) str.push(`${r.s} second${r.s === 1 ? "" : "s"}`);
		if (r.m > 0) str.push(`${r.m} minute${r.m === 1 ? "" : "s"}`);
		if (r.h > 0) str.push(`${r.h} hour${r.h === 1 ? "" : "s"}`);
		if (r.d > 0) str.push(`${r.d} day${r.d === 1 ? "" : "s"}`);
		if (r.w > 0) str.push(`${r.w} week${r.w === 1 ? "" : "s"}`);
		if (r.mn > 0) str.push(`${r.mn} month${r.mn === 1 ? "" : "s"}`);
		if (r.y > 0) str.push(`${r.y} year${r.y === 1 ? "" : "s"}`);

		return words ? str.join(", ") : Object.keys(r).filter(k => r[k] > 0).map(k => `${r[k]}${k}`).reduce((a, b) => a + b, "");
	}

	/**
	 * parse time into d/h/m/s
	 * @static
	 * @param {number} time
	 * @param {boolean} [full=false]
	 * @param {boolean} [ms=false]
	 * @returns {string}
	 * @memberof Time
	 */
	static parseTime(time: number, full = false, ms = false) {
		if (ms) time = time / 1000;
		const methods = [
			{ name: full ? " day" : "d", count: 86400 },
			{ name: full ? " hour" : "h", count: 3600 },
			{ name: full ? " minute" : "m", count: 60 },
			{ name: full ? " second" : "s", count: 1 }
		];

		const timeStr = [`${Math.floor(time / methods[0].count).toString()}${methods[0].name}${Math.floor(time / methods[0].count) > 1 && full ? "s" : ""}`];
		for (let i = 0; i < 3; i++) {
			timeStr.push(`${Math.floor(time % methods[i].count / methods[i + 1].count).toString()}${methods[i + 1].name}${Math.floor(time % methods[i].count / methods[i + 1].count) > 1 && full ? "s" : ""}`);
		}
		let j = timeStr.filter(g => !g.startsWith("0")).join(", ");
		if (j.length === 0) j = "no time";
		return j;
	}

	/**
	 * format a date into dd/mm/yyyy hh:mm:ss.ms
	 * @static
	 * @param {(Date | number)} [d=new Date()]
	 * @param {boolean} [seconds=true]
	 * @param {boolean} [ms=false]
	 * @returns
	 * @memberof Time
	 */
	static formatDateWithPadding(d: Date | number = new Date(), seconds = true, ms = false) {
		if (typeof d === "number") d = new Date(d);
		return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${(d.getDate()).toString().padStart(2, "0")}/${d.getFullYear()} ${seconds ? `${(d.getHours()).toString().padStart(2, "0")}:${(d.getMinutes()).toString().padStart(2, "0")}:${(d.getSeconds()).toString().padStart(2, "0")}` : ""}${ms ? `.${(d.getMilliseconds()).toString().padStart(3, "0")}` : ""}`;
	}
}
