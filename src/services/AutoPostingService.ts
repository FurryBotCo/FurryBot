/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { mdb } from "../db";
import GuildConfig, { DBKeys } from "../db/Models/GuildConfig";
import config from "../config";
import Yiffy from "../util/req/Yiffy";
import LocalFunctions from "../util/LocalFunctions";
import { BaseServiceWorker, BaseServiceWorkerSetup } from "eris-fleet";
import Logger from "logger";
import { Colors, EmbedBuilder } from "core";
import Eris from "eris";
import fetch from "node-fetch";
import { Request } from "utilities";
import { WithId } from "mongodb";

export default class AutoPostingService extends BaseServiceWorker {
	private interval: NodeJS.Timeout;
	// we have to prefix the token because we aren't connecting to the gateway
	private testClient = new Eris.Client(`Bot ${config.client.token}`, { restMode: true });
	private DONE: Array<string> = [];
	constructor(setup: BaseServiceWorkerSetup) {
		super(setup);
		this.interval = setInterval(() => {
			const d = new Date();
			if ((d.getMinutes() % 5) === 0) void this.run();
			else if ((d.getSeconds() % 15) === 0) this.DONE = [];
		}, 800);
		this.serviceReady();
	}

	// this service doesn't accept commands, but we have to overload this
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	override async handleCommand(data: never) {
		return;
	}

	override shutdown(done: () => void) {
		clearInterval(this.interval);
		done();
	}

	async run() {
		const d = new Date();
		const entries = await mdb!.collection("guilds").find<WithId<DBKeys>>({ $where: "![undefined,null].includes(this.auto) && this.auto.length > 0" }, {}).toArray();
		for (const g of entries) {
			for (const e of g.auto) {
				if (
					((d.getMinutes() % 5) === 0 && e.time === 5) ||
					((d.getMinutes() % 10) === 0 && e.time === 10) ||
					((d.getMinutes() % 15) === 0 && e.time === 15) ||
					((d.getMinutes() % 30) === 0 && e.time === 30) ||
					((d.getMinutes() % 60) === 0 && e.time === 60)
				) {
					if (this.DONE.includes(e.id)) continue;
					await this.execute(e, new GuildConfig(g.id, g));
					// eslint-disable-next-line deprecation/deprecation
					Logger.info(["Auto Posting"], `Ran auto posting for type "${e.type}" with webhook id "${e.webhook?.id || `ch-${e.webhook.channelId}`}" (time: ${e.time}, id: ${e.id})`);
				}
			}
		}
	}

	async execute({ type, webhook: wh, id }: GuildConfig["auto"][number], gConfig: GuildConfig) {
		this.DONE.push(id);
		if (!wh || !wh.id || !wh.token) {
			await gConfig.mongoEdit<DBKeys>({
				$pull: {
					auto: gConfig.auto.find(a => a.id === id)!
				}
			});
			return;
		}
		const e = new EmbedBuilder(gConfig.settings.lang);
		let file: Eris.MessageFile;
		const w = await this.testClient.getWebhook(wh.id, wh.token).catch(() => null);
		if (!w) {
			Logger.warn("Auto Posting", `Removing auto entry #${id} (type: ${type}) due to its webhook being invalid.`);
			await gConfig.mongoEdit<DBKeys>({
				$pull: {
					auto: gConfig.auto.find(a => a.id === id)!
				}
			});
			return;
		}
		const ch = await this.testClient.getRESTChannel(w.channel_id).catch(() => null) as Eris.AnyGuildChannel | null;
		if (ch === null) {
			Logger.warn("Auto Posting", `Removing auto entry #${id} (type: ${type}) due to its webhook channel not existing.`);
			await gConfig.mongoEdit<DBKeys>({
				$pull: {
					auto: gConfig.auto.find(a => a.id === id)!
				}
			});
			return;
		}
		if ((type.startsWith("yiff") || ["butts", "bulge"].includes(type)) && !ch.nsfw) {
			Logger.warn("Auto Posting", `Removing auto entry #${id} (type: ${type}) due to the channel it goes to not being marked nsfw.`);
			await this.testClient.executeWebhook(wh.id, wh.token, {
				embeds: [
					e
						.setTitle("{lang:other.auto.titles.disabled}")
						.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
						.setColor(Colors.red)
						.setDescription(`{lang:other.auto.disabledNSFW|${type}}`)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				]
			});
			await gConfig.mongoEdit<DBKeys>({
				$pull: {
					auto: gConfig.auto.find(v => v.id === id)
				}
			});
			return;
		}
		switch (type) {
			case "birb": {
				const img = await Yiffy.animals.birb("json", 1);
				e
					.setTitle("{lang:other.auto.titles.birb}")
					.setImage(img.url)
					.setDescription([
						`[[{lang:other.images.shortURL}]](${img.shortURL})`,
						`[[{lang:other.images.reportURL}]](${img.reportURL})`,
						`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
					].join("\n"))
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "bunny": {
				const img = await LocalFunctions.chewyBotAPIRequest("rabbit");
				e
					.setTitle("{lang:other.auto.titles.bunny}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "cat": {
				const img = await fetch("https://api.thecatapi.com/v1/images/search", {
					method: "GET",
					headers: {
						"X-API-Key": config.apis.cat,
						"User-Agent": config.web.userAgent
					}
				})
					.then(async(res) => res.json());

				e
					.setTitle("{lang:other.auto.titles.cat}")
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					.setImage(img[0].url)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "duck": {
				const img = await LocalFunctions.chewyBotAPIRequest("duck");
				e
					.setTitle("{lang:other.auto.titles.duck}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "fox": {
				const img = await Request.getImageFromURL("https://foxrudor.de");
				e
					.setTitle("{lang:other.auto.titles.fox}")
					.setImage("attachment://fox.png")
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				file = {
					file: img,
					name: "fox.png"
				};
				break;
			}

			case "koala": {
				const r = await Request.fetchURL("https://some-random-api.ml/img/koala");
				const img = JSON.parse(r.toString()).link as string;
				e
					.setTitle("{lang:other.auto.titles.koala}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "otter": {
				const img = await LocalFunctions.chewyBotAPIRequest("otter");
				e
					.setTitle("{lang:other.auto.titles.otter}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "panda": {
				const img = await LocalFunctions.chewyBotAPIRequest("panda");
				e
					.setTitle("{lang:other.auto.titles.panda}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "snek": {
				const img = await LocalFunctions.chewyBotAPIRequest("snake");
				e
					.setTitle("{lang:other.auto.titles.snek}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "turtle": {
				const img = await LocalFunctions.chewyBotAPIRequest("turtle");
				e
					.setTitle("{lang:other.auto.titles.turtle}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "wah": {
				const r = await Request.fetchURL("https://some-random-api.ml/img/red_panda");
				const img = JSON.parse(r.toString()).link as string;
				e
					.setTitle("{lang:other.auto.titles.wah}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "wolf": {
				const img = await LocalFunctions.chewyBotAPIRequest("wolf");
				e
					.setTitle("{lang:other.auto.titles.wolf}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "fursuit": {
				const img = await Yiffy.furry.fursuit("json", 1);
				e
					.setTitle("{lang:other.auto.titles.fursuit}")
					.setImage(img.url)
					.setDescription([
						`[[{lang:other.images.shortURL}]](${img.shortURL})`,
						`[[{lang:other.images.reportURL}]](${img.reportURL})`,
						`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
					].join("\n"))
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "butts": {
				const img = await Yiffy.furry.butts("json", 1);
				e
					.setTitle("{lang:other.auto.titles.butts}")
					.setImage(img.url)
					.setDescription([
						`[[{lang:other.images.shortURL}]](${img.shortURL})`,
						`[[{lang:other.images.reportURL}]](${img.reportURL})`,
						`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
					].join("\n"))
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "bulge": {
				const img = await Yiffy.furry.bulge("json", 1);
				e
					.setTitle("{lang:other.auto.titles.bulge}")
					.setImage(img.url)
					.setDescription([
						`[[{lang:other.images.shortURL}]](${img.shortURL})`,
						`[[{lang:other.images.reportURL}]](${img.reportURL})`,
						`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
					].join("\n"))
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "yiff.gay": {
				const img = await Yiffy.furry.yiff.gay("json", 1);
				e
					.setTitle("{lang:other.auto.titles.yiff-gay}")
					.setImage(img.url)
					.setDescription([
						`[[{lang:other.images.shortURL}]](${img.shortURL})`,
						`[[{lang:other.images.reportURL}]](${img.reportURL})`,
						`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
					].join("\n"))
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "yiff.straight": {
				const img = await Yiffy.furry.yiff.straight("json", 1);
				e
					.setTitle("{lang:other.auto.titles.yiff-straight}")
					.setImage(img.url)
					.setDescription([
						`[[{lang:other.images.shortURL}]](${img.shortURL})`,
						`[[{lang:other.images.reportURL}]](${img.reportURL})`,
						`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
					].join("\n"))
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "yiff.lesbian": {
				const img = await Yiffy.furry.yiff.lesbian("json", 1);
				e
					.setTitle("{lang:other.auto.titles.yiff-lesbian}")
					.setImage(img.url)
					.setDescription([
						`[[{lang:other.images.shortURL}]](${img.shortURL})`,
						`[[{lang:other.images.reportURL}]](${img.reportURL})`,
						`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
					].join("\n"))
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "yiff.gynomorph": {
				const img = await Yiffy.furry.yiff.gynomorph("json", 1);
				e
					.setTitle("{lang:other.auto.titles.yiff-gynomorph}")
					.setImage(img.url)
					.setDescription([
						`[[{lang:other.images.shortURL}]](${img.shortURL})`,
						`[[{lang:other.images.reportURL}]](${img.reportURL})`,
						`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
					].join("\n"))
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(`Furry Bot${config.beta ? " Beta" : ""}`, config.images.icons.bot)
					.setTimestamp(new Date().toISOString());
				break;
			}
		}

		// remove the removal notice if we publish the message
		if (ch.type === Eris.Constants.ChannelTypes.GUILD_NEWS) e.setFooter("{lang:other.auto.footerNews}");

		const msg = await this.testClient.executeWebhook(wh.id, wh.token, {
			wait: true,
			embeds: [
				e.toJSON()
			],
			// reeeeeee
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			file: file! as any
		});
		if (ch.type === Eris.Constants.ChannelTypes.GUILD_NEWS) await (msg).crosspost().catch(() => null);
	}
}
