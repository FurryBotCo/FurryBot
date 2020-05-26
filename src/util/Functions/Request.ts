import config from "../../config";
import phin from "phin";
import * as fs from "fs-extra";
import Logger from "../LoggerV9";

export default class Request {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * get the image at a url as a buffer
	 * @static
	 * @param {string} url
	 * @returns
	 * @memberof Request
	 */
	static async getImageFromURL(url: string) {
		return phin({ url }).then(res => Buffer.from(res.body));
	}

	/**
	 * Download an image to a directory
	 * @static
	 * @param {string} url
	 * @param {string} filename
	 * @returns {Promise<fs.WriteStream>}
	 * @memberof Request
	 */
	static async downloadImage(url: string, filename: string): Promise<fs.WriteStream> { return phin({ url, timeout: 5e3 }).then(res => res.pipe(fs.createWriteStream(filename))); }

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
