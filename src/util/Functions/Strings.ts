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
}
