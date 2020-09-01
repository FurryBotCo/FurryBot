import Command from "../../../util/cmd/Command";
import CommandError from "../../../util/cmd/CommandError";
import Utility from "../../../util/Functions/Utility";
import { Colors } from "../../../util/Constants";
import EmbedBuilder from "../../../util/EmbedBuilder";
import config from "../../../config";
import Language from "../../../util/Language";
import Category from "../../../util/cmd/Category";
import Internal from "../../../util/Functions/Internal";

export default new Command(["reload"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions(["developer"])
	.setCooldown(0, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

		switch (msg.args[0].toLowerCase()) {
			case "cmd": {
				if (!msg.args[1]) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.cmdMissing`));
				const c = this.cmd.getCommand(msg.args[1].toLowerCase()) as { cmd: Command; cat: Category; };
				if (!c) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.cmdInvalid`));

				try {
					await c.cat.reloadCommand(c.cmd);
				} catch (e) {
					return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.error`, ["command", msg.args[1].toLowerCase(), Internal.consoleSanitize(e.stack)]));
				}

				return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.cmdDone`, [msg.args[1].toLowerCase()]));
			}

			case "cat": {
				if (!msg.args[1]) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.catMissing`));
				const c = this.cmd.categories.find(cat => cat.name.toLowerCase() === msg.args[1].toLowerCase());
				if (!c) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.catInvalid`));
				try {
					await this.cmd.reloadCategory(c);
				} catch (e) {
					return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.error`, ["category", msg.args[1].toLowerCase(), Internal.consoleSanitize(e.stack)]));
				}

				return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.catDone`, [msg.args[1].toLowerCase()]));
				break;
			}

			case "all": {
				const cache = Object.keys(require.cache);
				for (const r of cache) delete require.cache[r];
				return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.all`, [cache.length]));
			}

			case "file": {
				const nm = msg.dashedArgs.value.indexOf("--node-modules");
				let c = Object.keys(require.cache).filter(e => e.toLowerCase().indexOf(msg.args[1].toLowerCase()) !== -1);
				if (!nm) c = c.filter(e => e.indexOf("node_modules") === -1);
				if (!c || c.length === 0) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.fileNotFound`, [msg.args[1]]));
				c.map(e => delete require.cache[e]);

				if (c.length === 1) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.file`, [c[0]]));
				else return msg.reply(`${Language.get(config.devLanguage, `${cmd.lang}.files`, [c.length])}\n${c.map(e => `- **${e}**`).join("\n")}`);
			}

			default: {
				return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.invalid`, [msg.args[0].toLowerCase()]));
			}
		}
	});
