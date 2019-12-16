import * as fs from "fs-extra";

export default class Temp {
	dir: string;
	constructor(dir: string) {
		if (!fs.existsSync(dir) || !dir) throw new TypeError("invalid temp dir");
		this.dir = dir;
	}

	clean() {
		return !this.dir ? (console.warn(`Temporary directory "${this.dir}" is invalid.`), null) : fs.readdirSync(this.dir).map(d => fs.unlinkSync(`${this.dir}/${d}`));
	}
}
