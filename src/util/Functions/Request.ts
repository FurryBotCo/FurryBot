import * as fs from "fs-extra";
import * as https from "https";
import * as http from "http";
import URL from "url";
import config from "../../config";
import phin from "phin";
import Logger from "../LoggerV10";

export default class Request {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * get the image at a url as a buffer
	 * @static
	 * @param {string} url
	 * @returns {Promise<Buffer>}
	 * @memberof Request
	 */
	static async fetchURL(url: string): Promise<Buffer> {
		return new Promise((a, b) => {
			const uri = URL.parse(url);
			(uri.protocol === "https:" ? https : http).request({
				method: "GET",
				host: uri.host,
				path: uri.path,
				protocol: uri.protocol,
				port: uri.port || uri.protocol === "https:" ? 443 : 80,
				timeout: 3e4,
				headers: {
					"User-Agent": config.web.userAgent
				}
			}, (res) => {
				const data = [];
				res
					.on("data", (d) => data.push(d))
					.on("error", (err) => b(err))
					.on("end", () => a(Buffer.concat(data)));
			}).end();
		});
	}

	static get getImageFromURL() { return this.fetchURL; }

	/**
	 * Download an image to a directory
	 * @static
	 * @param {string} url
	 * @param {string} filename
	 * @returns {Promise<void>}
	 * @memberof Request
	 */
	static async downloadImage(url: string, filename: string): Promise<void> {
		return this.fetchURL(url).then(img => fs.writeFileSync(filename, img));
	}


	static async chewyBotAPIRequest(cat: string): Promise<string> {
		let r: phin.IResponse;
		try {
			r = await phin({
				method: "GET",
				url: `https://api.chewey-bot.top/${cat}`,
				headers: {
					"User-Agent": config.web.userAgent,
					"Authorization": config.apiKeys.chewyBot.key
				},
				timeout: 5e3
			});
			const b = JSON.parse(r.body.toString());
			return b.data;
		} catch (e) { // cannot annotate try-catch clauses
			const err = e as Error;
			Logger.error("Request", `${r.statusCode} ${r.statusMessage}`);
			Logger.error("Request", err);
			Logger.error("Request", r.body.toString());
			if (err.message.indexOf("JSON") !== -1 && err.stack.indexOf("JSON.parse") !== -1) return null;
			throw err;
		}
	}
}
