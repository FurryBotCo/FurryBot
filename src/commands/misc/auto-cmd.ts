import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import config from "../../config";
import { Colors, Command, CommandError, EmbedBuilder } from "core";
import Language from "language";
import Eris from "eris";
import chunk from "chunk";
import { Request } from "utilities";
import FileType from "file-type";
import crypto from "crypto";

export default new Command<FurryBot, UserConfig, GuildConfig>(["auto"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageChannels",
		"manageWebhooks"
	])
	.setUserPermissions([
		"manageGuild",
		"manageChannels",
		"manageWebhooks"
	])
	.setRestrictions([
		"donator"
	])
	.setCooldown(5e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const max = 10;
		function f(t: string) {
			// allows for stuff like yiff-gay and yiffgay
			return config.autoTypes.find(v => [v, v.replace(/\./g, "-"), v.replace(/\./g, "")].some(j => j.toLowerCase() === t.toLowerCase()));
		}
		switch (msg.args[0]?.toLowerCase()) {
			case "add": {
				if (msg.gConfig.auto.length >= max) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.max`, [max, msg.prefix]));
				if (msg.args.length !== 3) return new CommandError("INVALID_USAGE", cmd);
				const t = f(msg.args[1]);
				if (!t) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.invalidType`, [msg.args[1]]));
				const time = Number(msg.args[2]) as (5 | 10 | 15 | 30 | 60);
				if (isNaN(time) || !([5, 10, 15, 30, 60] as const).includes(time)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.invalidTime`, [msg.args[2]]));
				await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.select`, [msg.channel.id]));
				const sel = await this.col.awaitMessages(msg.channel.id, 6e4, ({ author: { id } }) => id === msg.author.id, 1);
				let hook: Eris.Webhook, created = false;
				if (sel === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
				switch (!sel.content ? NaN : Number(sel.content)) {
					case 1: {
						const w = await msg.channel.getWebhooks();
						if (w.length === 0)  return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.noWebhooksChannel`));
						await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.select1`, [w.map((v, i) => `**${i + 1}.)** \`${v.name}\``).join("\n")]));
						const j = await this.col.awaitMessages(msg.channel.id, 6e4, ({ author: { id } }) => id === msg.author.id, 1);
						if (j === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
						const a = !j.content ? NaN : Number(j.content);
						if (isNaN(a) || a < 1 || a > w.length) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.invalidSelection", [1, w.length]));
						hook = w[a - 1];
						break;
					}

					case 2: {
						const wh = await msg.channel.guild.getWebhooks();
						if (wh.length === 0)  return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.noWebhooksServer`));
						await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.select2`));
						const j = await this.col.awaitMessages(msg.channel.id, 6e4, ({ author: { id } }) => id === msg.author.id, 1);
						if (j === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
						const [ , id, token] = (/https?:\/\/(?:canary\.|ptb\.)?discord.com\/api\/webhooks\/(\d{15,21})\/([a-zA-Z\d_-]+)/.exec(j.content) ?? [] as unknown) as  [_: never, id?: string, token?: string];
						if (!id || !token) return msg.channel.createMessage({
							content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.invalidURL`),
							messageReferenceID: j.id,
							allowedMentions: {
								repliedUser: false
							}
						});
						const w = wh.find(v => v.id === id && v.token === v.token);
						if (w === undefined) return msg.channel.createMessage({
							content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.invalidWebhook`),
							messageReferenceID: j.id,
							allowedMentions: {
								repliedUser: false
							}
						});
						hook = w;
						break;
					}

					case 3: {
						if (!msg.channel.permissionsOf(this.client.user.id).has("manageWebhooks")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.missingPermission`, ["manageWebhooks", msg.channel.id]));
						const img = await Request.getImageFromURL(config.images.icons.bot);
						const { mime } = await FileType.fromBuffer(img) ?? { mime: null };
						if (mime === null) throw new Error("Internal error.");
						const b64 = Buffer.from(img).toString("base64");
						hook = await msg.channel.createWebhook({
							name: "Furry Bot Auto Posting",
							avatar: `data:${mime};base64,${b64}`
						});
						created = true;
						break;
					}

					default: return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.invalidSelection", [1, 3]));
				}
				let ch = this.client.getChannel(hook!.channel_id) as Eris.GuildChannel;
				if (!ch || !(ch instanceof Eris.GuildChannel)) ch = await this.client.getRESTChannel(hook!.channel_id) as Eris.GuildChannel;
				if (!ch) throw new TypeError("Unable to fetch channel.");
				if ((t.startsWith("yiff") || ["butts", "bulge"].includes(t)) && !ch.nsfw) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.nsfw`, [msg.args[1], ch.id]));
				const j: GuildConfig["auto"][number] = {
					id: crypto.randomBytes(12).toString("hex"),
					type: t,
					time,
					channel: null,
					webhook: {
						id: hook!.id,
						token: hook!.token,
						channelId: hook!.channel_id
					}
				} as GuildConfig["auto"][number];

				const k = await msg.gConfig.edit({
					auto: [
						...msg.gConfig.auto,
						j
					]
				});
				return msg.reply(`${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.done`, [t, ch.id, hook!.name, hook!.id, msg.prefix, (k?.auto?.length || 0) + 1])}${created ? `\n${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.created`)}` : ""}`);

				break;
			}

			case "remove": {
				if (msg.args.length !== 2) return new CommandError("INVALID_USAGE", cmd);
				if (msg.gConfig.auto.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.noEntries`));
				const id = Number(msg.args[1]);
				if (id < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.lessThanOne`));
				if (id > msg.gConfig.auto.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.invalidId`, [id]));
				const j = [...msg.gConfig.auto];
				const v = j.splice(id - 1, 1)[0];
				const w = await this.client.getWebhook(v.webhook.id, v.webhook.token).catch(() => null);
				if (w !== null) {
					await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.removeWebhook`, [w.id]));
					const n = await this.col.awaitMessages(msg.channel.id, 6e4, ({ author: { id: d } }) => d === msg.author.id, 1);
					if (n === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
					if (n.content.toLowerCase() === "yes") {
						await this.client.deleteWebhook(w.id, w.token);
						return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.doneWebhook`, [id, v.type, w.id]));
					}
				}
				const a = [...msg.gConfig.auto];
				a.splice(a.indexOf(v), 1);
				await msg.gConfig.edit({
					auto: a
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.done`, [id, v.type]));
				break;
			}

			case "list": {
				if (msg.gConfig.auto.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.noEntries`));
				const perPage = 15;
				const pages = chunk(msg.gConfig.auto, perPage);
				const page = msg.args.length === 1 ? 1 : Number(msg.args[1]);
				if (page < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.lessThanOne`));
				if (page > pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.invalidPage${pages.length === 1 ? "One" : ""}`, [page, pages.length]));
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setDescription(pages[page - 1].map((v, i) => `{lang:${cmd.lang}.list.entry|${(i + 1) + ((page - 1) * perPage)}|${v.type}|${v.webhook.channelId}|${v.time}}`).join("\n"))
						.setTitle(`{lang:${cmd.lang}.list.page|${page}}`)
						.setFooter(`{lang:${cmd.lang}.list.footer|${page}|${pages.length}|${msg.gConfig.auto.length}|${msg.prefix}}`, this.client.user.avatarURL)
						.setColor(Colors.furry)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				});
				break;
			}

			case "available": {
				const incomplete = [
				] as Array<string>;
				const text = config.autoTypes.map(v => `**${v}** - ${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.available.${v.replace(/\./g, "-")}`)}`);
				const end: Array<string> = [];
				let i = 0;
				for (const t of text) {
					if (!end[i]) end[i] = "";
					if (end[i].length > 1750 || (end[i].length + t.length) > 1750) {
						i++;
						end[i] = "";
						end[i - 1] = end[i - 1].slice(0, -2);
					}

					// incomplete.some(v => t.indexOf(v) !== -1)
					const j = incomplete.find(v => t.indexOf(v) !== -1);

					// I could make this a lot simpler but meh
					end[i] += `${j ? t.replace(new RegExp(`\\*\\*${j}\\*\\*`), `__**${j}**__`) : t}\n`;
				}
				await msg.reply(`${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.available.possible`)}\n${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.available.incomplete`)}\n\n${end[0]}`);
				if (end.length > 1) {
					for (const v of end) {
						if (v === end[0]) continue;
						await msg.channel.createMessage(v);
					}
				}
				break;
			}

			case "clear": {
				if (!msg.member.permissions.has("manageGuild")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.needPermission`));
				const len = msg.gConfig.auto.length;
				if (len === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.noEntries`));
				await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.confirm`, [len]));
				const v = await this.col.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id, 1);
				if (!v || v.content.toLowerCase() !== "yes") return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.cancelled`));
				await msg.gConfig.edit({
					auto: []
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.done`, [len]));
				break;
			}

			default: return new CommandError("INVALID_USAGE", cmd, "NONE_PROVIDED");
		}
	})
	.setOverride("invalidUsage", async function (msg, cmd, err) {
		switch (err.extra) {
			case "NONE_PROVIDED":
			case "INVALID_SUBCOMMAND": {
				await msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setTitle("\u274c {lang:other.words.invalid$ucwords$} {lang:other.words.usage$ucwords$}")
						.setDescription([
							`{lang:${cmd.lang}.help.main}`,
							`{lang:${cmd.lang}.help.noInclude}`,
							"",
							`{lang:other.words.example$ucwords$}: \`${msg.prefix}auto add wah 5\``,
							`{lang:${cmd.lang}.help.validTimes}`,
							`\`${msg.prefix}auto add <type> <time>\` - {lang:${cmd.lang}.help.add}`,
							`\`${msg.prefix}auto remove <id>\` - {lang:${cmd.lang}.help.remove}`,
							`\`${msg.prefix}auto list\` - {lang:${cmd.lang}.help.list}`,
							`\`${msg.prefix}auto available\` - {lang:${cmd.lang}.help.available}`,
							`\`${msg.prefix}auto clear\` - {lang:${cmd.lang}.help.clear}`
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.red)
						.setFooter("OwO", this.client.user.avatarURL)
						.toJSON()
				});
				break;
			}

			default: return "DEFAULT";
		}
	});
