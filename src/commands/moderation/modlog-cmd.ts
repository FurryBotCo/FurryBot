import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import config from "../../config";
import { Command, CommandError, BotFunctions, Colors, EmbedBuilder } from "core";
import Eris from "eris";
import Language from "language";
import { Request } from "utilities";
import FileType from "file-type";

export default new Command<FurryBot, UserConfig, GuildConfig>(["modlog"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageChannels",
		"manageWebhooks"
	])
	.setUserPermissions([
		"manageGuild"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		switch (msg.args[0]?.toLowerCase()) {
			case "s":
			case "set":
			case "setup": {
				const c = msg.args.length === 1 ? msg.channel : await msg.getChannelFromArgs<Eris.GuildTextableChannel>(1, true, 0);
				if (c === null) return msg.reply({
					embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL", true)
				});
				if (msg.gConfig.modlog.webhook && msg.gConfig.modlog.webhook.channelId === c.id) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.alreadySet`, [msg.prefix]));
				await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.select`, [c.id]));
				const sel = await this.col.awaitMessages(msg.channel.id, 6e4, ({ author: { id } }) => id === msg.author.id, 1);
				let hook: Eris.Webhook, created = false;
				if (sel === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
				if (sel.content.toLowerCase() === "cancel") return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.userCancelled"));
				switch (!sel.content ? NaN : Number(sel.content)) {
					case 1: {
						const w = await msg.channel.getWebhooks();
						if (w.length === 0)  return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.noWebhooksChannel`));
						await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.select1`, [w.map((v, i) => `**${i + 1}.)** \`${v.name}\``).join("\n")]));
						const j = await this.col.awaitMessages(msg.channel.id, 6e4, ({ author: { id } }) => id === msg.author.id, 1);
						if (j === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
						if (j.content.toLowerCase() === "cancel") return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.userCancelled"));
						const a = !j.content ? NaN : Number(j.content);
						if (isNaN(a) || a < 1 || a > w.length) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.invalidSelection", [1, w.length]));
						hook = w[a - 1];
						break;
					}

					case 2: {
						const wh = await msg.channel.guild.getWebhooks();
						if (wh.length === 0)  return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.noWebhooksServer`));
						await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.select2`));
						const j = await this.col.awaitMessages(msg.channel.id, 6e4, ({ author: { id } }) => id === msg.author.id, 1);
						if (j === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
						if (j.content.toLowerCase() === "cancel") return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.userCancelled"));
						const [ , id, token] = (/https?:\/\/(?:canary\.|ptb\.)?discord.com\/api\/webhooks\/(\d{15,21})\/([a-zA-Z\d_-]+)/.exec(j.content) ?? [] as unknown) as  [_: never, id?: string, token?: string];
						if (!id || !token) return msg.channel.createMessage({
							content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.invalidURL`),
							messageReferenceID: j.id,
							allowedMentions: {
								repliedUser: false
							}
						});
						const w = wh.find(v => v.id === id && v.token === v.token);
						if (w === undefined) return msg.channel.createMessage({
							content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.invalidWebhook`),
							messageReferenceID: j.id,
							allowedMentions: {
								repliedUser: false
							}
						});
						hook = w;
						break;
					}

					case 3: {
						if (!msg.channel.permissionsOf(this.client.user.id).has("manageWebhooks")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.missingPermission`, ["manageWebhooks", msg.channel.id]));
						const img = await Request.getImageFromURL(config.images.icons.bot);
						const { mime } = await FileType.fromBuffer(img) ?? { mime: null };
						if (mime === null) throw new Error("Internal error.");
						const b64 = Buffer.from(img).toString("base64");
						hook = await msg.channel.createWebhook({
							name: "Furry Bot Moderation Log",
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

				await this.client.executeWebhook(hook!.id, hook!.token, {
					wait: false,
					embeds: [
						new EmbedBuilder(msg.gConfig.settings.lang)
							.setTitle(`{lang:${cmd.lang}.setup.testEmbed.title}`)
							.setDescription(`{lang:${cmd.lang}.setup.testEmbed.desc|${this.client.user.id}|${msg.prefix}}`)
							.setColor(Colors.furry)
							.setTimestamp(new Date().toISOString())
							.setAuthor(msg.author.tag, msg.author.avatarURL)
							.setFooter("OwO", this.client.user.avatarURL)
							.toJSON()
					]
				});

				await msg.gConfig.mongoEdit({
					$set: {
						modlog: {
							enabled: true,
							channel: null,
							webhook: {
								id: hook!.id,
								token: hook!.token,
								channelId: hook!.channel_id
							}
						}
					}
				});
				return msg.reply(`${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.done`, [ch.id, hook!.name, hook!.id, msg.prefix])}${created ? `\n${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.setup.created`)}` : ""}`);

				break;
			}

			case "r":
			case "reset": {
				if (msg.gConfig.modlog.enabled === false) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.reset.notEnabled`));
				if (msg.gConfig.modlog.webhook) {
					const w = await this.client.getWebhook(msg.gConfig.modlog.webhook.id, msg.gConfig.modlog.webhook.token).catch(() => null);
					if (w !== null) {
						await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.reset.removeWebhook`, [w.id]));
						const n = await this.col.awaitMessages(msg.channel.id, 6e4, ({ author: { id: d } }) => d === msg.author.id, 1);
						if (n === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
						if (n.content.toLowerCase() === "yes") {
							await this.client.deleteWebhook(w.id, w.token);
							await msg.gConfig.mongoEdit({
								$set: {
									modlog: {
										enabled: false,
										channel: null,
										webhook: null
									}
								}
							});
							return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.reset.doneWebhook`, [w.id]));
						} else if (n.content.toLowerCase() === "cancel") return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.userCancelled"));
					}
				}
				await msg.gConfig.mongoEdit({
					$set: {
						modlog: {
							enabled: false,
							channel: null,
							webhook: null
						}
					}
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.reset.done`));
				break;
			}

			case "info":
			case "get": {
				if (msg.gConfig.modlog.enabled === false) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.get.notEnabled`));
				const w =msg.gConfig.modlog.webhook ? await this.client.getWebhook(msg.gConfig.modlog.webhook.id, msg.gConfig.modlog.webhook.token).catch(() => null) : null;
				if (w === null) {
					await msg.gConfig.mongoEdit({
						$set: {
							modlog: {
								enabled: false,
								channel: null,
								webhook: null
							}
						}
					});
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.get.notEnabled`));
				}
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setDescription(`{lang:${cmd.lang}.get.desc|${w.channel_id}|${w.name}|${w.id}}`)
						.setTitle(`{lang:${cmd.lang}.get.title}`)
						.setFooter("OwO", this.client.user.avatarURL)
						.setColor(Colors.furry)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				});
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
							`\`${msg.prefix}modlog setup [#channel]\` - {lang:${cmd.lang}.help.setup}`,
							`\`${msg.prefix}modlog get\` - {lang:${cmd.lang}.help.get}`,
							`\`${msg.prefix}modlog reset\` - {lang:${cmd.lang}.help.reset}`
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
