import Category from "../modules/CommandHandler/Category";
import * as fs from "fs-extra";
const ext = __filename.split(".").reverse()[0];

export default Promise.all<Category>(fs.readdirSync(`${__dirname}`).filter(d => fs.lstatSync(`${__dirname}/${d}`).isDirectory()).map(async (d) => {
	if (!fs.existsSync(`${__dirname}/${d}/index.${ext}`)) throw new TypeError(`Missing command index for "${__dirname}/${d}".`);
	// this is like this for very specific reasons
	return import(`${__dirname}/${d}/index.${ext}`).then((async (d) => {
		const v = await d.default();
		return v;
	}));
}));
