import Command from "../../util/cmd/Command";
import { dependencies, devDependencies } from "../../../package.json";
import { dependencies as lock } from "../../../package-lock.json";
import EmbedBuilder from "../../util/EmbedBuilder";
import config from "../../config";
import { Colors } from "../../util/Constants";
import Strings from "../../util/Functions/Strings";
import Eris from "eris";

export default new Command(["dependencies", "dep"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(1e4, true)
	.setExecutor(async function (msg, cmd) {
		const dep: {
			[k in "main" | "dev" | string]: {
				name: string;
				url: string;
				version: string;
				git: boolean;
			}[];
		} = {
			main: [],
			dev: []
		};

		function parse(n: string, v: string) {
			const git = v.startsWith("github:");
			return {
				url: git ?
					`https://github.com/${`${v.replace("github:", "").split("#")[0]}/commit/${lock[n].version.split("#")[1].slice(0, 7)}`.replace(/\/{2,2}/, "/")}` :
					`https://npm.im/${n}`,
				version: git ? lock[n].version.split("#")[1].slice(0, 7) : lock[n].version,
				git
			};
		}

		for (const d of Object.keys(dependencies)) {
			const v = parse(d, dependencies[d]);
			dep.main.push({
				name: d,
				...v
			});
		}

		for (const d of Object.keys(devDependencies)) {
			const v = parse(d, devDependencies[d]);
			dep.dev.push({
				name: d,
				...v
			});
		}

		const emb = new EmbedBuilder(config.devLanguage)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setFooter("OwO", this.bot.user.avatarURL);

		let i = 0, text = [];

		for (const key of Object.keys(dep)) {
			for (const e of dep[key]) {
				let t: string;
				switch (e.name) {
					case "eris": {
						t = `**[${e.name}](${e.url})** - ${Eris.VERSION}-Dev (\`${e.version}\`)`;
						break;
					}

					default: {
						t = `**[${e.name}](${e.url})** - \`${e.version}\``;
					}
				}

				if ((text.reduce((a, b) => a + b.length, 0) + t.length) >= 975) {
					i++;
					emb.addField(`{lang:${cmd.lang}.title${Strings.ucwords(key)}|${i}}`, text.join("\n"), false);
					text = [];
				}

				text.push(t);
			}

			if (text.length !== 0) {
				i++;
				emb.addField(`{lang:${cmd.lang}.title${Strings.ucwords(key)}|${i}}`, text.join("\n"), false);
			}
			i = 0, text = []; // eslint-disable-line @typescript-eslint/no-unused-expressions
		}

		return msg.channel.createMessage({
			embed: emb.toJSON()
		});
	});
