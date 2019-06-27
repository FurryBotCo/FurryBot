import * as fs from "fs";

export default class Temp {
	dir: string;
	constructor(dir: string) {
		this.dir = dir;
	}

	clean() {
		return fs.readdirSync(this.dir).map(d => fs.unlinkSync(`${this.dir}/${d}`));
	}
}