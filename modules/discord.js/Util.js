const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isObject = d => typeof d === "object" && d !== null;
const { Colors } = require("./Constants");

/**
 * reduced clone of https://github.com/discordjs/discord.js/blob/master/src/util/Util.js
 * @see {https://github.com/discordjs/discord.js/blob/master/src/util/Util.js}
 */

module.exports = class Util {
	constructor() {
		throw new Error("no");
	}

	/**
   * Resolves a StringResolvable to a string.
   * @param {StringResolvable} data The string resolvable to resolve
   * @returns {string}
   */
	static resolveString(data) {
		if (typeof data === "string") return data;
		if (Array.isArray(data)) return data.join("\n");
		return String(data);
	}

	/**
   * Resolves a ColorResolvable into a color number.
   * @param {ColorResolvable} color Color to resolve
   * @returns {number} A color
   */
	static resolveColor(color) {
		if (typeof color === "string") {
			if (color === "RANDOM") return Math.floor(Math.random() * (0xFFFFFF + 1));
			if (color === "DEFAULT") return 0;
			color = Colors[color] || parseInt(color.replace("#", ""), 16);
		} else if (Array.isArray(color)) {
			color = (color[0] << 16) + (color[1] << 8) + color[2];
		}

		if (color < 0 || color > 0xFFFFFF) throw new RangeError("COLOR_RANGE");
		else if (color && isNaN(color)) throw new TypeError("COLOR_CONVERT");

		return color;
	}

	/**
   * Shallow-copies an object with its class/prototype intact.
   * @param {Object} obj Object to clone
   * @returns {Object}
   * @private
   */
	static cloneObject(obj) {
		return Object.assign(Object.create(obj), obj);
	}

	/**
   * Flatten an object. Any properties that are collections will get converted to an array of keys.
   * @param {Object} obj The object to flatten.
   * @param {...Object<string, boolean|string>} [props] Specific properties to include/exclude.
   * @returns {Object}
   */
	static flatten(obj, ...props) {
		if (!isObject(obj)) return obj;

		props = Object.assign(...Object.keys(obj).filter(k => !k.startsWith("_")).map(k => ({ [k]: true })), ...props);

		const out = {};

		for (let [prop, newProp] of Object.entries(props)) {
			if (!newProp) continue;
			newProp = newProp === true ? prop : newProp;

			const element = obj[prop];
			const elemIsObj = isObject(element);
			const valueOf = elemIsObj && typeof element.valueOf === "function" ? element.valueOf() : null;

			// If it's an array, flatten each element
			if (Array.isArray(element)) out[newProp] = element.map(e => Util.flatten(e));
			// If it's an object with a primitive `valueOf`, use that value
			else if (typeof valueOf !== "object") out[newProp] = valueOf;
			// If it's a primitive
			else if (!elemIsObj) out[newProp] = element;
		}

		return out;
	}
};