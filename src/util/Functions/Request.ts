import config from "../../config";
import phin from "phin";
import * as fs from "fs-extra";

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
		return new Promise(async (resolve, reject) => {
			let s;
			if ([undefined, null].includes(json)) json = true;

			try {
				s = await phin({
					method: "GET",
					url: `https://api.furry.bot/${animal ? "animals" : `furry/${safe ? "sfw" : "nsfw"}`}/${category ? category.toLowerCase() : safe ? "hug" : "bulge"}${json ? "" : "/image"}`.replace(/\s/g, ""),
					parse: "json",
					timeout: 5e3
				});
				resolve(s.body);
			} catch (error) {
				reject({
					error,
					response: s.body
				});
			}
		});
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
}
