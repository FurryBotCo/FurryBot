import Category from "../../modules/CommandHandler/Category";
import Command from "../../modules/CommandHandler/Command";
import * as fs from "fs-extra";
const ext = __filename.split(".").reverse()[0];

const cat = new Category({
	name: "fun",
	file: __filename,
	restrictions: []
});

export default (async () => {
	const cmd = await Promise.all<Command>(fs.readdirSync(`${__dirname}`).filter(f => f.endsWith(ext) && f !== `index.${ext}` && !fs.lstatSync(`${__dirname}/${f}`).isDirectory()).map(async (f) => import(`${__dirname}/${f}`).then(d => d.default)));
	cmd.map(c => cat.addCommand(c.setCategory(cat.name)));
	return cat;
});
