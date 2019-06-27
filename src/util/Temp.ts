import * as fs from "fs";

export default class Temp {
	dir: string;
	constructor(dir: string) {
		if (!fs.existsSync(dir)) throw new TypeError("invalid temp dir");
		this.dir = dir;
	}

	clean() {
		return fs.readdirSync(`${__dirname}/../../tmp`).map(d => fs.unlinkSync(`${__dirname}/../../tmp/${d}`));
	}
}