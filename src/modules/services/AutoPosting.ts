/// <reference path="../../util/@types/eris-fleet.d.ts" />
import { BaseServiceWorker } from "eris-fleet";
import { Request } from "../../util/Functions";
import { FurryBotAPI } from "../External";
import db, { mdb } from "../Database";
import Eris, { Client } from "eris";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import phin from "phin";
import Logger from "../../util/LoggerV10";
import { JSONResponse } from "furrybotapi/src/typings";

export default class AutoPostingWorker extends BaseServiceWorker {
	client: Eris.Client;
	constructor(setup) {
		super(setup);
		this.client = new Client(`Bot ${config.client.token}`, { restMode: true });
		this.client
			.on("debug", (d) => Logger.debug("Auto Posting", d))
			.on("error", (d) => Logger.error("Auto Posting", d))
			.on("warn", (d) => Logger.warn("Auto Posting", d));
		this.serviceReady();
	}

	async shutdown(done) {
		return done();
	}

	async handleCommand(entry: GlobalTypes.AutoEntry) {
		Logger.info("Auto Posting", `Processing entry ${entry._id}`);
		const g = await db.getGuild(entry.guildId);
		if (!g) {
			Logger.warn("Auto Posting", `Skipped posting type "${entry.type}" in guild "${g.id}" because the guild entry does not exist in the database.`);
			await mdb.collection("auto").findOneAndDelete({ _id: entry._id });
			return;
		}

		const r = await this.client.getRESTGuild(g.id);
		if (!r) {
			Logger.warn("Auto Posting", `Skipped posting type "${entry.type}" in guild "${g.id}" because the guild has been removed.`);
			await mdb.collection("auto").findOneAndDelete({ _id: entry._id });
			return;
		}

		const p = await g.premiumCheck();
		if (!p.active) {
			Logger.warn("Auto Posting", `Skipped posting type "${entry.type}" in guild "${g.id}" because their premium is not active.`);
			await mdb.collection("auto").findOneAndDelete({ _id: entry._id });
			return;
		}

		const d = new Date().toISOString();
		let data: JSONResponse;

		let file: Buffer;

		switch (entry.type) {
			case "animals.bird": {
				data = await FurryBotAPI.animals.birb("json", 1);
				file = await Request.getImageFromURL(data.url);
				break;
			}

			case "animals.bunny": {
				file = await Request.chewyBotAPIRequest("bunny").then(i => Request.getImageFromURL(i));
				break;
			}

			case "animals.cat": {
				file = await phin<{ file: string; }>({
					method: "GET",
					url: "https://aws.random.cat/meow",
					parse: "json",
					headers: {
						"User-Agent": config.web.userAgent
					}
				}).then(i => Request.getImageFromURL(i.body.file));
				break;
			}

			case "animals.duck": {
				file = await Request.chewyBotAPIRequest("duck").then(i => Request.getImageFromURL(i));
				break;
			}

			case "animals.fox": {
				file = await Request.getImageFromURL("https://foxrudor.de");
				break;
			}

			case "animals.otter": {
				file = await Request.chewyBotAPIRequest("otter").then(i => Request.getImageFromURL(i));
				break;
			}

			case "animals.panda": {
				file = await Request.chewyBotAPIRequest("panda").then(i => Request.getImageFromURL(i));
				break;
			}

			case "animals.snek": {
				file = await Request.chewyBotAPIRequest("snek").then(i => Request.getImageFromURL(i));
				break;
			}

			case "animals.turtle": {
				file = await Request.chewyBotAPIRequest("turtle").then(i => Request.getImageFromURL(i));
				break;
			}

			case "animals.wolf": {
				file = await Request.chewyBotAPIRequest("wolf").then(i => Request.getImageFromURL(i));
				break;
			}

			case "yiff.dickgirl": {
				data = await FurryBotAPI.furry.yiff.dickgirl("json", 1);
				file = await Request.getImageFromURL(data.url);
				break;
			}

			case "yiff.gay": {
				data = await FurryBotAPI.furry.yiff.gay("json", 1);
				file = await Request.getImageFromURL(data.url);
				break;
			}

			case "yiff.lesbian": {
				data = await FurryBotAPI.furry.yiff.lesbian("json", 1);
				file = await Request.getImageFromURL(data.url);
				break;
			}

			case "yiff.straight": {
				data = await FurryBotAPI.furry.yiff.straight("json", 1);
				file = await Request.getImageFromURL(data.url);
				break;
			}

			default: {
				Logger.error("Auto Posting", `Invalid auto posting type "${entry.type}"`);
				return;
			}
		}


		const embed = new EmbedBuilder("en")
			.setAuthor("Auto Posting", config.images.botIcon)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setImage(`attachment://auto-${entry.type}.png`);

		if (!!data) embed.setDescription(`${data.sources.length > 0 ? `[[source]](${data.sources[0]}) ` : ""}[[Short URL]](${data.shorturl}) [[Direct Image URL]](${data.url})`);

		await this.client.executeWebhook(entry.webhook.id, entry.webhook.token, {
			embeds: [
				embed.toJSON()
			],
			file: {
				name: `auto-${entry.type}.png`,
				file
			}
		}).catch(err => {
			Logger.error(`Auto Posting | ${entry.type}`, `Failed auto posting for guild ${entry.guildId}, reason: ${err.stack}`);
		});
	}
}
