import Category from "../modules/CommandHandler/Category";
import * as fs from "fs-extra";
const ext = __filename.split(".").reverse()[0];

export default (fs.readdirSync(`${__dirname}`).filter(d => fs.lstatSync(`${__dirname}/${d}`).isDirectory()).map(d => {
	if (!fs.existsSync(`${__dirname}/${d}/index.${ext}`)) throw new TypeError(`Missing command index for "${__dirname}/${d}".`);
	return require(`${__dirname}/${d}/index.${ext}`).default;
})) as Category[];
