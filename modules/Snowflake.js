module.exports = class Snowflake {
	constructor(date = new Date()) {
		// 2018-01-01T00:00:00.000Z
		this.EPOCH = 1514764800000;
		this.INCREMENT = 0;

		this.id = this._generate(date);
	}
  
	/**
	 * A Discord snowflake, except the epoch is 2018-01-01T00:00:00.000Z
	 * https://github.com/discordjs/discord.js/blob/master/src/util/Snowflake.js
	 * ```
	 * If we have a snowflake '266241948824764416' we can represent it as binary:
	 *
	 * 64										  22	 17	 12		  0
	 *  000000111011000111100001101001000101000000  00001  00000  000000000000
	 *	   number of ms since epoch	                worker  pid	increment
	 * ```
	 * @typedef {string} Snowflake
	 */
	
	_generate(timestamp = Date.now()) {
		if (timestamp instanceof Date) timestamp = timestamp.getTime();
		if (typeof timestamp !== "number" || isNaN(timestamp)) throw new TypeError(`"timestamp" argument must be a number (received ${isNaN(timestamp) ? "NaN" : typeof timestamp})`);
		if (this.INCREMENT >= 4095) this.INCREMENT = 0;
		const BINARY = `${(timestamp - this.EPOCH).toString(2).padStart(42, "0")}0000100000${(this.INCREMENT++).toString(2).padStart(12, "0")}`;
		return this._binaryToID(BINARY);
	}
  
	_binaryToID(num) {
		let dec = "";

		while (num.length > 50) {
			const high = parseInt(num.slice(0, -32), 2);
			const low = parseInt((high % 10).toString(2) + num.slice(-32), 2);
  
			dec = (low % 10).toString() + dec;
			num = Math.floor(high / 10).toString(2) + Math.floor(low / 10).toString(2).padStart(32, "0");
		}
  
		num = parseInt(num, 2);
		while (num > 0) {
			dec = (num % 10).toString() + dec;
			num = Math.floor(num / 10);
		}
  
		return dec;
	}
  
	get generate() {
		return this._generate;
	}

	regenerate(date = new Date()) {
		return this.id = this._generate(date);
	}

	toString() {
		return this.id;
	}

	toJSON() {
		return {
			id: this.id
		};
	}
};