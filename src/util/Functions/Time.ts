

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
	 *
	 * @static
	 * @param {(number | {
	 * 		ms?: number;
	 * 		s?: number;
	 * 		m?: number;
	 * 		h?: number;
	 * 		d?: number;
	 * 		w?: number;
	 * 		mn?: number;
	 * 		y?: number;
	 * 	})} data
	 * @param {boolean} [words]
	 * @returns {(Promise<string | T.MsResponse>)}
	 * @memberof Time
	 */
	static async ms(data: number | {
		ms?: number;
		s?: number;
		m?: number;
		h?: number;
		d?: number;
		w?: number;
		mn?: number;
		y?: number;
	}, words?: boolean): Promise<string | {
		ms: number;
		s: number;
		m: number;
		h: number;
		d: number;
		w: number;
		mn: number;
		y: number;
	}> {
		if (typeof data === "number") {
			if (data === 0) {
				if (words) return "0 seconds";
				else return {
					ms: 0,
					s: 0,
					m: 0,
					h: 0,
					d: 0,
					w: 0,
					mn: 0,
					y: 0
				};
			} else if (data < 1000) {
				if (words) return `${data} milliseconds`;
				else return {
					ms: data,
					s: 0,
					m: 0,
					h: 0,
					d: 0,
					w: 0,
					mn: 0,
					y: 0
				};
			}
		} else {
			if (data.ms < 1000 && (Object.keys(data).map(k => data[k]).reduce((a, b) => a + b) - data.ms) === 0) {
				if (words) return `${data.ms} milliseconds`;
				else return {
					ms: data.ms,
					s: 0,
					m: 0,
					h: 0,
					d: 0,
					w: 0,
					mn: 0,
					y: 0
				};
			}
		}

		const t = await new Promise((a, b) => {
			const t = {
				ms: 0,
				s: 0,
				m: 0,
				h: 0,
				d: 0,
				w: 0,
				mn: 0,
				y: 0
			};


			const k = setTimeout(b, 3e4, new Error("ERR_TIMEOUT_REACHED"));

			if (typeof data === "number") t.ms = data;
			else if (typeof data !== "object") throw new Error("invalid input");
			else {
				if (data.ms) t.ms = data.ms;
				if (data.s) t.s = data.s;
				if (data.m) t.m = data.m;
				if (data.h) t.h = data.h;
				if (data.d) t.d = data.d;
				if (data.w) t.w = data.w;
				if (data.m) t.mn = data.mn;
				if (data.y) t.y = data.y;
			}

			const shorten = (() => {
				if (t.ms >= 1000) {
					t.ms -= 1000;
					t.s += 1;
				}

				if (t.s >= 60) {
					t.s -= 60;
					t.m += 1;
				}

				if (t.m >= 60) {
					t.m -= 60;
					t.h += 1;
				}

				if (t.h >= 24) {
					t.h -= 24;
					t.d += 1;
				}

				if (t.d >= 30) {
					t.d -= 30;
					t.mn += 1;
				}

				if ((t.mn * 30) + t.d >= 365) {
					t.d = ((t.mn * 30) + t.d) - 365;
					t.mn -= 12;
					t.y += 1;
				}
			});

			const c = () => (t.ms >= 1000) || (t.s >= 60) || (t.m >= 60) || (t.h >= 24) || (t.d >= 30) || (t.w >= 4) || (t.mn >= 12);
			const d = () => t.d >= 7;
			while (c()) {
				shorten();
				if (!c()) {
					if (!d()) {
						clearTimeout(k);
						return a(t);
					}

					while (d()) {
						t.d -= 7;
						t.w += 1;
						if (!d()) {
							clearTimeout(k);
							return a(t);
						}
					}
				}
			}
		});

		if (!words) return t as any;
		else {
			const full = {
				ms: "millisecond",
				s: "second",
				m: "minute",
				h: "hour",
				d: "day",
				w: "week",
				mn: "month",
				y: "year"
			};

			const j = {};

			Object.keys(t).forEach((k) => {
				if (t[k] !== 0) j[k] = t[k];
			});

			if (Object.keys(j).length < 1) return {} as any;

			const useFull = Object.keys(j).length < 4;

			return Object.keys(j).reverse().map((k, i, a) => `${i === a.length - 1 && a.length !== 1 ? "and " : ""}${j[k]}${useFull ? ` ${full[k]}${j[k] > 1 ? "s" : ""}` : k}`).join(", ").trim();
		}
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
