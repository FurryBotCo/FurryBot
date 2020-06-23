import * as fs from "fs";
import dot from "dot-object";
export default ((lang: string) => {
	const obj = {};

	function go(dir, path) {
		fs.readdirSync(dir).map(d => {
			if (fs.lstatSync(`${dir}/${d}`).isDirectory()) {
				go(`${dir}/${d}`, `${path}.${d}`);
			} else {
				const f = JSON.parse(fs.readFileSync(`${dir}/${d}`).toString());
				dot.set(`${path}.${d.split(".")[0]}`, f, obj, true);
			}
		});
	}

	go(`${__dirname}/${lang}`, lang);

	fs.writeFileSync(`${__dirname}/${lang}.json`, JSON.stringify(obj[lang]));
});
