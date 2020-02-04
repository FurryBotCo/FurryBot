import config from "../../config";
import phin from "phin";
import * as fs from "fs-extra";
import Logger from "../LoggerV8";

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
		return phin({ url }).then(res => res.body);
	}

	/**
	 * get an image from api.furry.bot
	 * @static
	 * @param {boolean} [animal=true]
	 * @param {string} [category=null]
	 * @param {boolean} [json=true]
	 * @param {boolean} [safe=false]
	 * @returns {(Promise<T.APIResponse>)}
	 * @memberof Request
	 */
	static async imageAPIRequest(animal = true, category: string = null, json = true, safe = false): Promise<(
		{
			success: true;
			response: {
				image: string;
				filetype: string;
				name: string;
			};
		} | {
			success: false;
			error: {
				code: number;
				description: string;
			}
		}
	)> {
		if ([undefined, null].includes(json)) json = true;
		const url = `https://api.furry.bot/V1/${animal ? "animals" : `furry/${safe ? "sfw" : "nsfw"}`}/${category ? category.toLowerCase() : safe ? "hug" : "bulge"}${json ? "" : "/image"}`.replace(/\s/g, "");
		const s = await phin({
			method: "GET",
			url,
			parse: "json",
			timeout: 5e3
		});

		if (s.statusCode !== 200) Logger.error("Request", `URL: ${url}, Status: ${s.statusCode} ${s.statusMessage}`);

		return s.body;
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

	/**
	 * Dank Memer API Request
	 * @static
	 * @param {string} path - request path
	 * @param {(string[] | string)} [avatars=[]] - avatars for generation
	 * @param {(string[] | string)} [usernames=[]] - usernames for generation
	 * @param {string} [text=""] - text for generation
	 * @returns {Promise<phin.BufferResponse>}
	 * @memberof Request
	 */
	static async memeRequest(path: string, avatars: string[] | string = [], usernames: string[] | string = [], text = ""): Promise<phin.BufferResponse> {
		avatars = typeof avatars === "string" ? [avatars] : avatars;
		usernames = typeof usernames === "string" ? [usernames] : usernames;
		const data: {
			avatars?: string[];
			usernames?: string[];
			text?: string;
		} = {};
		if (avatars && avatars.length > 0) data.avatars = avatars;
		if (usernames && usernames.length > 0) data.usernames = usernames;
		if (text && text.length > 0) data.text = text;
		return phin({
			method: "POST",
			url: `https://dankmemer.services/api${path}`,
			headers: {
				"Authorization": config.apis.dankMemer.token,
				"User-Agent": config.userAgent,
				"Content-Type": "application/json"
			},
			data,
			parse: "none",
			timeout: 3e4
		});
	}

	static async chewyBotAPIRequest(cat: string): Promise<string> {
		let r: phin.BufferResponse;
		try {
			r = await phin({
				method: "GET",
				url: `https://api.chewey-bot.top/${cat}`,
				headers: {
					"User-Agent": config.web.userAgent,
					"Authorization": config.apis.chewyBot.key
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
