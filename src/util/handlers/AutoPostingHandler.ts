import config from "../../config";
import GuildConfig from "../config/GuildConfig";
import EmbedBuilder from "../EmbedBuilder";
import Request from "../Functions/Request";
import FurryBotAPI from "../req/FurryBotAPI";
import phin from "phin";
import Eris from "eris";
import { Colors } from "../Constants";
import FurryBot from "../../main";
// @TODO webhooks
export default class AutoPostingHandler {
	static async execute(entryId: string, type: GuildConfig["auto"][number]["type"], channelId: string, gConfig: GuildConfig, client: FurryBot) {
		const e = new EmbedBuilder(gConfig.settings.lang);
		let file: Eris.MessageFile;
		const g = client.bot.guilds.get(gConfig.id);
		if (!g) return;
		const ch = g.channels.get(channelId) as Eris.GuildTextableChannel;
		if (!ch) {
			await gConfig.mongoEdit({
				$pull: {
					auto: gConfig.auto.find(v => v.id === entryId)
				}
			});
			return;
		}
		if ((type.startsWith("yiff") || ["butts", "bulge"].includes(type)) && !ch.nsfw) {
			await ch.createMessage({
				embed: e
					.setTitle("{lang:other.auto.titles.disabled}")
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setColor(Colors.red)
					.setDescription(`{lang:other.auto.disabledNSFW|${type}}`)
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});
			await gConfig.mongoEdit({
				$pull: {
					// we assume there's only one per type per channel
					auto: gConfig.auto.find(v => v.type === type && channelId === channelId)
				}
			});
			return;
		}
		switch (type) {
			case "birb": {
				const img = await FurryBotAPI.animals.birb("json", 1);
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "bunny": {
				const img = await Request.chewyBotAPIRequest("rabbit");
				e
					.setTitle("{lang:other.auto.titles.bunny}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "cat": {
				const img = await phin<any>({
					method: "GET",
					url: "https://api.thecatapi.com/v1/images/search",
					parse: "json",
					headers: {
						"X-API-Key": config.apis.cat,
						"User-Agent": config.web.userAgent
					}
				}).then(b => b.body);

				e
					.setTitle("{lang:other.auto.titles.cat}")
					.setImage(img[0].url)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "duck": {
				const img = await Request.chewyBotAPIRequest("duck");
				e
					.setTitle("{lang:other.auto.titles.duck}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "otter": {
				const img = await Request.chewyBotAPIRequest("otter");
				e
					.setTitle("{lang:other.auto.titles.otter}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "panda": {
				const img = await Request.chewyBotAPIRequest("panda");
				e
					.setTitle("{lang:other.auto.titles.panda}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "snek": {
				const img = await Request.chewyBotAPIRequest("snake");
				e
					.setTitle("{lang:other.auto.titles.snek}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "turtle": {
				const img = await Request.chewyBotAPIRequest("turtle");
				e
					.setTitle("{lang:other.auto.titles.turtle}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "wolf": {
				const img = await Request.chewyBotAPIRequest("wolf");
				e
					.setTitle("{lang:other.auto.titles.wolf}")
					.setImage(img)
					.setFooter(`{lang:other.auto.footer|${gConfig.prefix[0]}}`)
					.setColor(Colors.gold)
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "fursuit": {
				const img = await FurryBotAPI.furry.fursuit("json", 1);
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "butts": {
				const img = await FurryBotAPI.furry.butts("json", 1);
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "bulge": {
				const img = await FurryBotAPI.furry.bulge("json", 1);
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "yiff.gay": {
				const img = await FurryBotAPI.furry.yiff.gay("json", 1);
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "yiff.straight": {
				const img = await FurryBotAPI.furry.yiff.straight("json", 1);
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "yiff.lesbian": {
				const img = await FurryBotAPI.furry.yiff.lesbian("json", 1);
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}

			case "yiff.gynomorph": {
				const img = await FurryBotAPI.furry.yiff.gynomorph("json", 1);
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
					.setAuthor(client.bot.user.username, client.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString());
				break;
			}
		}

		// remove the removal notice if we publish the message
		if (ch.type === Eris.Constants.ChannelTypes.GUILD_NEWS) e.setFooter("{lang:other.auto.footerNews}");

		const msg = await ch.createMessage({
			embed: e.toJSON()
		}, file);
		if (ch.type === Eris.Constants.ChannelTypes.GUILD_NEWS) await (msg as Eris.Message<Eris.NewsChannel>).crosspost().catch(err => null);
	}
}
