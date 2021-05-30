import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig, { DBKeys } from "../../db/Models/GuildConfig";
import { Colors, Command, CommandError, defaultEmojis, EmbedBuilder } from "core";
import Eris from "eris";
import { PartialRecord, Strings } from "utilities";
import Language from "language";
import chunk from "chunk";

export default new Command<FurryBot, UserConfig, GuildConfig>(["disable"], __filename)
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
		if (msg.args.length === 0) return new CommandError("INVALID_USAGE", cmd);

		switch (msg.args[0].toLowerCase()) {
			case "add": {
				const all = msg.args[1].toLowerCase() === "all";
				const d: PartialRecord<"command" | "category", string> & PartialRecord<"all", boolean> = {};
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
					} as GuildConfig["disable"][number];
					for (const dis of msg.gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.duplicate`));

					await msg.gConfig.edit<DBKeys>({
						disable: [...msg.gConfig.disable, c]
					});
					return msg.reply({
						allowedMentions: {
							everyone: false,
							roles: false,
							users: false
						},
						content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.success.${type!}Server`, [msg.args[1].toLowerCase()])
					});
				} else {
					msg.args = [...msg.args.slice(0, 2), msg.args.slice(2).join(" ")];
					const ch = await msg.getChannelFromArgs<Eris.GuildTextableChannel | Eris.CategoryChannel>(2, true, 0);
					const role = await msg.getRoleFromArgs(2, true, 0);
					const user = await msg.getMemberFromArgs(2, true, 0);

					if (ch) {
						if ((ch.type as number) === Eris.Constants.ChannelTypes.GUILD_VOICE) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidChannel`));
						const c = {
							type: "channel",
							id: ch.id,
							...d
						} as GuildConfig["disable"][number];
						if (!msg.gConfig.disable || !(msg.gConfig.disable instanceof Array)) await msg.gConfig.edit<DBKeys>({
							disable: []
						});

						for (const dis of msg.gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.duplicate`));

						await msg.gConfig.edit<DBKeys>({
							disable: [...msg.gConfig.disable, c]
						});
						return msg.reply({
							allowedMentions: {
								everyone: false,
								roles: false,
								users: [msg.author.id]
							},
							content: Language.parseString(msg.gConfig.settings.lang, `{lang:${cmd.lang}.success.${type! || "all"}${ch.type === Eris.Constants.ChannelTypes.GUILD_CATEGORY ? "Category" : "Channel"}|${msg.args[1].toLowerCase()}|${ch[ch.type === Eris.Constants.ChannelTypes.GUILD_CATEGORY ? "name" : "id"]}}`)
						});
					} else if (role) {
						const c = {
							type: "role",
							id: role.id,
							...d
						} as GuildConfig["disable"][number];

						for (const dis of msg.gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.duplicate`));

						await msg.gConfig.edit<DBKeys>({
							disable: [...msg.gConfig.disable, c]
						});
						return msg.reply({
							allowedMentions: {
								everyone: false,
								roles: false,
								users: [msg.author.id]
							},
							content: Language.parseString(msg.gConfig.settings.lang, `{lang:${cmd.lang}.success.${type! || "all"}Role|${msg.args[1].toLowerCase()}|${role.id}}`)
						});
					} else if (user) {
						const c = {
							type: "user",
							id: user.id,
							...d
						} as GuildConfig["disable"][number];

						for (const dis of msg.gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.duplicate`));

						await msg.gConfig.edit<DBKeys>({
							disable: [...msg.gConfig.disable, c]
						});
						return msg.reply({
							allowedMentions: {
								everyone: false,
								roles: false,
								users: [msg.author.id]
							},
							content: Language.parseString(msg.gConfig.settings.lang, `{lang:${cmd.lang}.success.${type! || "all"}User|${msg.args[1].toLowerCase()}|${user.id}}`)
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
					await msg.gConfig.edit<DBKeys>({
						disable: []
					});
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.cleared`));
				} else {
					const id = Number(msg.args[1]);
					if (isNaN(id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.NaNId`));
					if (id < 1 || id > msg.gConfig.disable.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidId`, [id]));
					const e = msg.gConfig.disable[id - 1];
					const k = [...msg.gConfig.disable];
					k.splice(k.indexOf(e), 1);
					await msg.gConfig.edit<DBKeys>({
						disable: k
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
							// @TODO different message for category
							...pages[page - 1].map(d => `[#${msg.gConfig.disable.indexOf(d) + 1}]: {lang:${cmd.lang}.list.${"command" in d ? "cmd" : "category" in d ? "cat" : "all"}${Strings.ucwords(d.type)}${"command" in d ? `|${d.command}` : "category" in d ? `|${d.category}` : ""}${d.type !== "server" ? `|${d.id}` : ""}}`)
						].join("\n"))
						.setColor(Colors.green)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setFooter(`{lang:${cmd.lang}.list.footer|${page}|${pages.length}|${msg.gConfig.disable.length}|${msg.prefix}}`, this.client.user.avatarURL)
						.toJSON()
				});
				break;
			}

			default: return new CommandError("INVALID_USAGE", cmd);
		}
	})
	.setOverride("invalidUsage", async function (msg, cmd) {
		if (msg.args.length === 0) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.help.title}`)
				.setDescription([
					`**{lang:${cmd.lang}.help.add}**:`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.entireServer}: \`${msg.prefix}disable add all\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.specificChannel}: \`${msg.prefix}disable add all <channel>\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.specificRole}: \`${msg.prefix}disable add all <role>\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.specificUser}: \`${msg.prefix}disable add all <user>\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.cmdTip}`,
					"",
					`**{lang:${cmd.lang}.help.remove}**:`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.withId}: \`${msg.prefix}disable remove <id>\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.removeAll}: \`${msg.prefix}disable remove all\``,
					"",
					`**{lang:${cmd.lang}.help.list}**:`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.list} \`${msg.prefix}disable list\``
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.furry)
				.setFooter("OwO", this.client.user.avatarURL)
				.toJSON()
		}).then(() => undefined);
		else return "DEFAULT";
	})
	.setOverride("help", async function (msg, cmd) {
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.help.title}`)
				.setDescription([
					`**{lang:${cmd.lang}.help.add}**:`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.entireServer}: \`${msg.prefix}disable add all\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.specificChannel}: \`${msg.prefix}disable add all <channel>\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.specificRole}: \`${msg.prefix}disable add all <role>\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.specificUser}: \`${msg.prefix}disable add all <user>\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.cmdTip}`,
					"",
					`**{lang:${cmd.lang}.help.remove}**:`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.withId}: \`${msg.prefix}disable remove <id>\``,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.removeAll}: \`${msg.prefix}disable remove all\``,
					"",
					`**{lang:${cmd.lang}.help.list}**:`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.help.list} \`${msg.prefix}disable list\``
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.furry)
				.setFooter("OwO", this.client.user.avatarURL)
				.toJSON()
		}).then(() => undefined);
	});
