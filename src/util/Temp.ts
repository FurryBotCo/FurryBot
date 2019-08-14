import * as fs from "fs-extra";
import config from "../config/config";

export default class Temp {
	dir: string;
	constructor(dir: string) {
		if (!fs.existsSync(dir)) throw new TypeError("invalid temp dir");
		this.dir = dir;
	}

	clean() {
		return fs.readdirSync(config.tmpDir).map(d => fs.unlinkSync(`${__dirname}/../../tmp/${d}`));
	}
}