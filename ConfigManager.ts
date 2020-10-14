// This is not used in bot code

import * as fs from "fs-extra";
import compressing from "compressing";
import rimraf from "rimraf";
import phin from "phin";
import * as pkg from "./package.json";


const [key, blame] = fs.readFileSync(`${__dirname}/config.key`).toString().split(/\r?\n/);
const tmp = `${__dirname}/tmp`;
const cnf = `${__dirname}/src/config`;
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

const dev = false;
if (dev) process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

process.nextTick(async () => {
	switch (process.argv[2]?.toLowerCase()) {
		case "pull": {
			const p = await phin({
				method: "GET",
				url: dev ? "https://127.2.3.1/V2/config/pull" : "https://api.furry.bot/V2/config/pull",
				headers: {
					"User-Agent": `FurryBot/${pkg.version} (https://github.com/FurryBotCo/FurryBot)`,
					"Authorization": key,
					"Host": "api.furry.bot"
				}
			});
			if (p.statusCode === 200) console.log("Successfully pulled");
			else {
				if (p.statusCode === 410) throw new TypeError("No config is stored on the server.");
				else throw new TypeError(`Non-200 OK status code: ${p.statusCode} ${p.statusMessage}\n(${p.body.toString()})`);
			}
			fs.writeFileSync(`${tmp}/config.tgz`, p.body);
			if (fs.existsSync(`${tmp}/config`)) rimraf.sync(`${tmp}/config`);
			if (fs.existsSync(cnf)) {
				if (fs.existsSync(`${cnf}/backup.tgz`)) fs.unlinkSync(`${cnf}/backup.tgz`);
				await compressing.tgz.compressDir(cnf, `${cnf}/backup.tgz`);
				rimraf.sync(cnf);
			}
			await compressing.tgz.uncompress(`${tmp}/config.tgz`, `${tmp}/config`);
			fs.mkdirSync(cnf);
			fs.readdirSync(`${tmp}/config/config`).map(v =>
				fs.renameSync(`${tmp}/config/config/${v}`, `${cnf}/${v}`)
			);
			rimraf.sync(`${tmp}/config`);
			fs.unlinkSync(`${tmp}/config.tgz`);
			console.log("Successfully replaced.");
			break;
		}

		case "push": {
			const reason = process.argv.slice(3).join(" ");
			if (fs.existsSync(`${cnf}/backup.tgz`)) fs.renameSync(`${cnf}/backup.tgz`, `${tmp}/backup.tgz`);
			await compressing.tgz.compressDir(`${__dirname}/src/config`, `${tmp}/config.tgz`);
			const f = fs.readFileSync(`${tmp}/config.tgz`).toString("base64");
			if (fs.existsSync(`${tmp}/backup.tgz`)) fs.renameSync(`${tmp}/backup.tgz`, `${cnf}/backup.tgz`);
			const p = await phin({
				method: "POST",
				url: dev ? "https://127.2.3.1/V2/config/push" : "https://api.furry.bot/V2/config/push",
				headers: {
					"User-Agent": `FurryBot/${pkg.version} (https://github.com/FurryBotCo/FurryBot)`,
					"Authorization": key,
					"Host": "api.furry.bot"
				},
				data: {
					file: f,
					reason,
					blame
				} as any
			});
			if (p.statusCode === 204) console.log("Successfully pushed!");
			else throw new TypeError(`Non-204 No Content status code: ${p.statusCode} ${p.statusMessage}\n(${p.body.toString()})`);
			break;
		}

		default: throw new TypeError("invalid input");
	}
});
