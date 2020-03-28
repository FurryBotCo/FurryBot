class Snowflake {
	constructor() {
		// 2019-01-01T00:00:00.000Z
	}
	EPOCH = 1420070400000;
	INCREMENT = 0;

	_generate(timestamp: Date | number = Date.now()) {
		if (timestamp instanceof Date) timestamp = timestamp.getTime();
		if (typeof timestamp !== "number" || isNaN(timestamp)) {
			throw new TypeError(
				`"timestamp" argument must be a number (received ${isNaN(timestamp) ? "NaN" : typeof timestamp})`
			);
		}
		if (this.INCREMENT >= 4095) this.INCREMENT = 0;
		// eslint-disable-next-line max-len
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

	get getSnowflake() { return this._generate; }
	get getId() { return this._generate; }
	get get() { return this._generate; }
	get generate() { return this._generate; }
}

export default Snowflake;
