
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

	/**
	 * generate a random string
	 * @static
	 * @param {number} [len=10] - string length
	 * @param {string} [keyset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"] - characters to use in random generation
	 * @returns {string}
	 * @memberof Strings
	 */
	static random(len = 10, keyset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
		let rand = "";
		for (let i = 0; i < len; i++) rand += keyset.charAt(Math.floor(Math.random() * keyset.length));
		return rand;
	}

	/**
	 * format a string with the provided arguments
	 * @static
	 * @param {string} str - string to format
	 * @param {...string[]} args - arguments to replace
	 * @returns {string}
	 * @memberof Strings
	 */
	static formatStr(str: string, ...args: string[]) {
		let res = str.toString();
		args = args.map(a => a.toString());
		const a = res.match(/({\d})/g);
		const e = ((s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
		const e2 = ((s) => s.replace(/\{/g, "").replace(/\}/g, ""));
		a.map((b) => args[e2(b)] !== undefined ? res = res.replace(new RegExp(e(b), "g"), args[e2(b)]) : null);
		return res;
	}

	/**
	 * make every other letter uppercase
	 * @static
	 * @param {string} str
	 * @returns {string}
	 * @memberof Strings
	 */
	static everyOtherUpper(str: string) {
		let res = "";
		for (let i = 0; i < str.length; i++) {
			res += i % 2 === 0 ? str.charAt(i).toUpperCase() : str.charAt(i);
		}
		return res;
	}

	/**
	 * ascii escape string
	 * @static
	 * @param {string} str - string to escape
	 * @returns
	 * @memberof Strings
	 */
	static toAsciiEscape(str: string) {
		const r = [];
		for (let i = 0; i < str.length; i++) r.push(str.charCodeAt(i).toString(16).toUpperCase());
		return {
			escape: r,
			string: `\\u${r.join("\\u")}`
		};
	}
}
