import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import chunk from "chunk";
import Language from "../../util/Language";
import Strings from "../../util/Functions/Strings";
import config from "../../config";

export default new Command(["disable"], __filename)
	.setBotPermissions([])
	.setUserPermissions([
		"manageGuild"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const notAllowed = [
			"disable"
		];
		if (msg.args.length === 0) return new CommandError("ERR_INVALID_USAGE", cmd);

		switch (msg.args[0].toLowerCase()) {
			case "add": {
				const all = msg.args[1].toLowerCase() === "all";
				const d: any = {};
				let type: "cmd" | "cat";
				if (!all) {
					const cmds = this.cmd.triggers.map(t => t.toLowerCase());
					const cats = this.cmd.categories.map(c => c.name.toLowerCase());
					if (cmds.includes(msg.args[1].toLowerCase())) (type = "cmd", d.command = msg.args[1].toLowerCase()); // eslint-disable-line @typescript-eslint/no-unused-expressions
					else if (cats.includes(msg.args[1].toLowerCase())) (type = "cat", d.category = msg.args[1].toLowerCase()); // eslint-disable-line @typescript-eslint/no-unused-expressions
					else return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`, [msg.args[1].toLowerCase()]));
				} else d.all = true;

				if (d.command && notAllowed.includes(d.command.toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.commandNotAllowed`, [d.command]));

				if (msg.args.length === 2) {
					if (d.all) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noAllServer`));
					const c = {
						type: "server",
						...d
					};
					for (const dis of msg.gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.duplicate`));

					await msg.gConfig.mongoEdit({
						$push: {
							disable: c
						}
					});
					return msg.reply({
						allowedMentions: {
							everyone: false,
							roles: false,
							users: false
						},
						content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.success.${type}Server`, [msg.args[1].toLowerCase()])
					});
				} else {
					const ch = await msg.getChannelFromArgs(2, true, 0);
					const role = await msg.getRoleFromArgs(2, true, 0);
					const user = await msg.getMemberFromArgs(2, true, 0);

					if (ch) {
						const c = {
							type: "channel",
							id: ch.id,
							...d
						};

						if (!msg.gConfig.disable || !(msg.gConfig.disable instanceof Array)) await msg.gConfig.mongoEdit({
							$set: {
								disable: []
							}
						});

						for (const dis of msg.gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.duplicate`));

						await msg.gConfig.mongoEdit({
							$push: {
								disable: c
							}
						});
						return msg.reply({
							allowedMentions: {
								everyone: false,
								roles: false,
								users: [msg.author.id]
							},
							content: Language.parseString(msg.gConfig.settings.lang, `{lang:${cmd.lang}.success.${type || "all"}Channel|${!type ? "" : `${msg.args[1].toLowerCase()}|`}${ch.id}}`)
						});
					} else if (role) {
						const c = {
							type: "role",
							id: role.id,
							...d
						};

						for (const dis of msg.gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.duplicate`));

						await msg.gConfig.mongoEdit({
							$push: {
								disable: c
							}
						});
						return msg.reply({
							allowedMentions: {
								everyone: false,
								roles: false,
								users: [msg.author.id]
							},
							content: Language.parseString(msg.gConfig.settings.lang, `{lang:${cmd.lang}.success.${type || "all"}Role|${!type ? "" : `${msg.args[1].toLowerCase()}|`}${role.id}}`)
						});
					} else if (user) {
						const c = {
							type: "user",
							id: user.id,
							...d
						};

						for (const dis of msg.gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.duplicate`));

						await msg.gConfig.mongoEdit({
							$push: {
								disable: c
							}
						});
						return msg.reply({
							allowedMentions: {
								everyone: false,
								roles: false,
								users: [msg.author.id]
							},
							content: Language.parseString(msg.gConfig.settings.lang, `{lang:${cmd.lang}.success.${type || "all"}User|${!type ? "" : `${msg.args[1].toLowerCase()}|`}${user.id}}`)
						});
					} else return msg.reply({
						allowedMentions: {
							everyone: false,
							roles: false,
							users: [msg.author.id]
						},
						content: Language.parseString(msg.gConfig.settings.lang, `{lang:${cmd.lang}.noAddFound|${msg.args[2].toLowerCase()}}`)
					});
				}
				break;
			}

			case "remove": {
				if (msg.args.length === 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.missingId`));

				if (msg.args[1].toLowerCase() === "all") {
					await msg.gConfig.mongoEdit({
						$set: {
							disable: []
						}
					});
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.cleared`));
				} else {
					const id = Number(msg.args[1]);
					if (isNaN(id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.NaNId`));
					if (id < 1 || id > msg.gConfig.disable.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidId`, [id]));
					const e = msg.gConfig.disable[id - 1];
					await msg.gConfig.mongoEdit({
						$pull: {
							disable: e
						}
					});
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.success`, [id]));
				}
				break;
			}

			case "list": {
				if (msg.gConfig.disable.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.empty`));
				const pages = chunk(msg.gConfig.disable, 10);
				if (pages.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.empty`));
				const page = msg.args.length === 1 ? 1 : Number(msg.args[1]);
				if (isNaN(page) || page > 1 || page < pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.invalidPage`, [1, pages.length]));

				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setDescription([
							...pages[page - 1].map(d => `[#${msg.gConfig.disable.indexOf(d) + 1}]: {lang:${cmd.lang}.list.${(d as any).command ? "cmd" : (d as any).category ? "cat" : "all"}${Strings.ucwords(d.type)}${(d as any).command ? `|${(d as any).command}` : (d as any).category ? `|${(d as any).category}` : ""}${d.type !== "server" ? `|${(d as any).id}` : ""}}`)
						].join("\n"))
						.setColor(Colors.green)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setFooter(`{lang:${cmd.lang}.list.footer|${page}|${pages.length}|${msg.gConfig.disable.length}|${msg.prefix}}`, this.bot.user.avatarURL)
						.toJSON()
				});
				break;
			}

			default: return new CommandError("ERR_INVALID_USAGE", cmd);
		}
	})
	.setOverride("invalidUsage", async function (msg, cmd, err) {
		if (msg.args.length === 0) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.help.title}`)
				.setDescription([
					`**{lang:${cmd.lang}.help.add}**:`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.entireServer}: \`${msg.prefix}disable add all\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.specificChannel}: \`${msg.prefix}disable add all <channel>\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.specificRole}: \`${msg.prefix}disable add all <role>\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.specificUser}: \`${msg.prefix}disable add all <user>\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.cmdTip}`,
					"",
					`**{lang:${cmd.lang}.help.remove}**:`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.withId}: \`${msg.prefix}disable remove <id>\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.removeAll}: \`${msg.prefix}disable remove all\``,
					"",
					`**{lang:${cmd.lang}.help.list}**:`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.list} \`${msg.prefix}disable list\``
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setFooter("OwO", this.bot.user.avatarURL)
				.toJSON()
		});
		else return "DEFAULT";
	})
	.setOverride("help", async function (msg, cmd) {
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.help.title}`)
				.setDescription([
					`**{lang:${cmd.lang}.help.add}**:`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.entireServer}: \`${msg.prefix}disable add all\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.specificChannel}: \`${msg.prefix}disable add all <channel>\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.specificRole}: \`${msg.prefix}disable add all <role>\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.specificUser}: \`${msg.prefix}disable add all <user>\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.cmdTip}`,
					"",
					`**{lang:${cmd.lang}.help.remove}**:`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.withId}: \`${msg.prefix}disable remove <id>\``,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.removeAll}: \`${msg.prefix}disable remove all\``,
					"",
					`**{lang:${cmd.lang}.help.list}**:`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.help.list} \`${msg.prefix}disable list\``
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setFooter("OwO", this.bot.user.avatarURL)
				.toJSON()
		});
	});
