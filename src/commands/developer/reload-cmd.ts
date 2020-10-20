import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import config from "../../config";
import Language from "../../util/Language";
import Category from "../../util/cmd/Category";
import Internal from "../../util/Functions/Internal";
import { execSync } from "child_process";
import { performance } from "perf_hooks";
import Eris from "eris";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import FurryBot from "../../main";
import Time from "../../util/Functions/Time";
import Utility from "../../util/Functions/Utility";

export default new Command(["reload"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions(["developer"])
	.setCooldown(0, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		async function rebuild(this: FurryBot, obj: Command | Category) {
			let m: Eris.Message, a: string, rebuild = false;
			if (config.beta) {
				if (msg.args.length === 2) {
					m = await msg.reply("would you like to rebuild the code? **Yes** or **No**.");
					const b = await this.col.awaitMessages(msg.channel.id, 15e3, (s) => s.author.id === msg.author.id);
					if (!b || !b.content || !["false", "true", "no", "yes"].includes(b.content.toLowerCase())) return msg.reply("invalid response.");
					a = b.content.toLowerCase();
					await b.delete().catch(err => null);
				} else {
					a = msg.args[2].toLowerCase();
					m = await msg.channel.createMessage("Processing..");
				}
			} else a = "no";

			switch (a.toLowerCase()) {
				case "false":
				case "no":
					rebuild = false;
					break;

				case "true":
				case "yes":
					rebuild = true;
					break;
			}

			try {
				if (rebuild) {
					m = await m.edit("Rebuilding code, please wait..");
					const start = performance.now();
					const rb = execSync("npm run build", {
						cwd: config.dir.base
					});

					const end = performance.now();
					m = await m.edit(`Rebuild finished in ${Time.ms(end - start, true, true)}.\`\`\`fix\n${rb.toString()}\n\`\`\``);
				} else m = await m.edit("Not rebuilding code.");
			} catch (e) {
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle("Error")
						.setColor(Colors.red)
						.setDescription(`There was an error while rebuilding the code.\n${e.stack}`)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setFooter("(a full restart might be required)", this.bot.user.avatarURL)
						.toJSON()
				});
			}
		}

		switch (msg.args[0].toLowerCase()) {
			case "cmd": {
				if (!msg.args[1]) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.cmdMissing`));
				const { cmd: c, cat } = this.cmd.getCommand(msg.args[1].toLowerCase());
				if (!c) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.cmdInvalid`));

				await rebuild.owo(this, c);
				try {
					await cat.reloadCommand(c);
				} catch (e) {
					return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.error`, ["command", msg.args[1].toLowerCase(), Internal.consoleSanitize(e.stack)]));
				}

				return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.cmdDone`, [msg.args[1].toLowerCase()]));
			}

			case "cat": {
				if (!msg.args[1]) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.catMissing`));
				const c = this.cmd.categories.find(cat => cat.name.toLowerCase() === msg.args[1].toLowerCase());
				if (!c) return msg.reply(Language.get(config.devLanguage, `${cmd.lang}.catInvalid`));
				await rebuild.owo(this, c);
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
