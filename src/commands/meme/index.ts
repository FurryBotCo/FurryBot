import Category from "../../util/CommandHandler/lib/Category";
import Command from "../../util/CommandHandler/lib/Command";
import * as fs from "fs-extra";
const ext = __filename.split(".").reverse()[0];

const cmd: Command[] = fs.readdirSync(`${__dirname}`).filter(f => f.endsWith(ext) && f !== `index.${ext}` && !fs.lstatSync(`${__dirname}/${f}`).isDirectory()).map(f => require(`${__dirname}/${f}`).default);

const cat = new Category({
	name: "meme",
	displayName: ":joy: Memey",
	devOnly: false,
	description: "Let's get this bread."
});

cmd.map(c => cat.addCommand(c.setCategory(cat.name)));

export default cat;
