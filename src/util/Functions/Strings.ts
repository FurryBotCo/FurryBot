export default class Strings {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * first letter of every word uppercase
	 * @static
	 * @param {string} str
	 * @returns {string}
	 * @memberof Strings
	 */
	static ucwords(str: string) {
		return str.toString().toLowerCase().replace(/^(.)|\s+(.)/g, (r) => r.toUpperCase());
	}

	static formatString(str: string, formatArgs: (string | number)[]) {
		if ([undefined, null].includes(str)) return null;
		formatArgs.map((a, i) => {
			// console.log("1", new RegExp(`\\{${i}\\}`, "g"));
			// console.log("2", str);
			// console.log("3", a);
			// console.log("4", str?.replace(new RegExp(`\\{${i}\\}`, "g"), a?.toString()));
			str = str?.replace(new RegExp(`\\{${i}\\}`, "g"), a?.toString());
		});
		return str;
	}

	static formatBytes(str: string | number, precision?: number) {
		if ([undefined, null].includes(precision)) precision = 2;
		str = Number(str);
		const { KB, MB, GB } = {
			KB: 1000,
			MB: 1000000,
			GB: 1000000000
		};
		if (str >= GB) return `${(str / GB).toFixed(precision)} GB`;
		else if (str >= MB) return `${(str / MB).toFixed(precision)} MB`;
		else if (str >= KB) return `${(str / KB).toFixed(precision)} KB`;
		else return `${str} B`;
	}
}
